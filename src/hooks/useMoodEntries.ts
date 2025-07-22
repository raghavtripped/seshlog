import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

// Define the MoodEntry type for consistency
export type MoodEntry = {
  id: string;
  user_id: string;
  created_at: string;
  mood_level: number;
  mood_type: string;
  energy_level: number;
  stress_level: number;
  triggers?: string;
  notes?: string;
};

// The new custom hook
export const useMoodEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['mood_entries', user?.id];

  // Fetch mood entries
  const { data: entries = [], isLoading, error } = useQuery<MoodEntry[]>({
    queryKey,
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_events')
        .select('id, user_id, created_at, payload')
        .eq('user_id', user.id)
        .eq('event_type', 'MOOD_LOG')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the Supabase data into our MoodEntry type
      return data.map((entry): MoodEntry => {
        const payload = entry.payload as Record<string, any> || {};
        return {
          id: entry.id,
          user_id: entry.user_id,
          created_at: entry.created_at,
          mood_level: payload.mood_level ?? 5,
          mood_type: payload.mood_type ?? 'neutral',
          energy_level: payload.energy_level ?? 5,
          stress_level: payload.stress_level ?? 5,
          triggers: payload.triggers ?? '',
          notes: payload.notes ?? '',
        };
      });
    },
    enabled: !!user,
  });

  // Add a new mood entry
  const addEntry = useMutation({
    mutationFn: async (newEntryData: Omit<MoodEntry, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { created_at, ...payload } = newEntryData;

      const { error } = await supabase.from('daily_events').insert([{
        user_id: user.id,
        event_type: 'MOOD_LOG',
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