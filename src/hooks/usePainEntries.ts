// /src/hooks/usePainEntries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

// Define the PainEntry type
export type PainEntry = {
  id: string;
  user_id: string;
  created_at: string;
  pain_level: number; // 0-10 scale
  stiffness_level: number; // 0-10 scale
  location: string; // e.g., 'Lower Back', 'Neck', 'Knees'
  description?: string;
  triggers?: string;
};

// The custom hook for pain entries
export const usePainEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['pain_entries', user?.id];

  // Fetch pain entries
  const { data: entries = [], isLoading, error } = useQuery<PainEntry[]>({
    queryKey,
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_events')
        .select('id, user_id, created_at, payload')
        .eq('user_id', user.id)
        .eq('event_type', 'PAIN_LOG')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the Supabase data into our PainEntry type
      return data.map((entry): PainEntry => {
        const payload = entry.payload as Record<string, unknown> || {};
        return {
          id: entry.id,
          user_id: entry.user_id,
          created_at: entry.created_at,
          pain_level: (payload.pain_level as number) ?? 0,
          stiffness_level: (payload.stiffness_level as number) ?? 0,
          location: (payload.location as string) ?? 'General',
          description: payload.description as string | undefined,
          triggers: payload.triggers as string | undefined,
        };
      });
    },
    enabled: !!user,
  });

  // Add a new pain entry
  const addEntry = useMutation({
    mutationFn: async (newEntryData: Omit<PainEntry, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { created_at, ...payload } = newEntryData;

      const { error } = await supabase.from('daily_events').insert([{
        user_id: user.id,
        event_type: 'PAIN_LOG',
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