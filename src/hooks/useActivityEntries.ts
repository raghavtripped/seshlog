// /src/hooks/useActivityEntries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

// Define the ActivityEntry type
export type ActivityEntry = {
  id: string;
  user_id: string;
  created_at: string;
  activity_type: 'running' | 'walking' | 'cycling' | 'strength' | 'other';
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  distance_km?: number;
  calories_burned?: number;
  notes?: string;
};

// The custom hook for activity entries
export const useActivityEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['activity_entries', user?.id];

  // Fetch activity entries
  const { data: entries = [], isLoading, error } = useQuery<ActivityEntry[]>({
    queryKey,
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_events')
        .select('id, user_id, created_at, payload')
        .eq('user_id', user.id)
        .eq('event_type', 'ACTIVITY_LOG')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the Supabase data into our ActivityEntry type
      return data.map((entry): ActivityEntry => {
        const payload = entry.payload as Record<string, unknown> || {};
        return {
          id: entry.id,
          user_id: entry.user_id,
          created_at: entry.created_at,
          activity_type: (payload.activity_type as 'running' | 'walking' | 'cycling' | 'strength' | 'other') ?? 'other',
          duration_minutes: (payload.duration_minutes as number) ?? 0,
          intensity: (payload.intensity as 'low' | 'medium' | 'high') ?? 'medium',
          distance_km: payload.distance_km as number | undefined,
          calories_burned: payload.calories_burned as number | undefined,
          notes: (payload.notes as string) ?? '',
        };
      });
    },
    enabled: !!user,
  });

  // Add a new activity entry
  const addEntry = useMutation({
    mutationFn: async (newEntryData: Omit<ActivityEntry, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { created_at, ...payload } = newEntryData;

      const { error } = await supabase.from('daily_events').insert([{
        user_id: user.id,
        event_type: 'ACTIVITY_LOG',
        created_at: created_at,
        payload: payload as Json,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete an entry
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('daily_events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { entries, isLoading, error, addEntry, deleteEntry };
};