import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

// Define the SleepEntry type for consistent use
export type SleepEntry = {
  id: string;
  user_id: string;
  created_at: string; // This will represent the date of the sleep log
  bedtime: string; // e.g., "23:00"
  wake_time: string; // e.g., "07:00"
  duration_hours: number;
  quality_rating: number; // 1-5 scale
  awakenings: number;
  notes?: string;
};

// The new custom hook for managing sleep data
export const useSleepEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['sleep_entries', user?.id];

  // Fetch all sleep entries for the user
  const { data: entries = [], isLoading, error } = useQuery<SleepEntry[]>({
    queryKey,
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_events')
        .select('id, user_id, created_at, payload')
        .eq('user_id', user.id)
        .eq('event_type', 'SLEEP_LOG')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the raw Supabase data into our clean SleepEntry type
      return data.map((entry): SleepEntry => {
        const payload = entry.payload as Record<string, any> || {};
        return {
          id: entry.id,
          user_id: entry.user_id,
          created_at: entry.created_at,
          bedtime: payload.bedtime ?? '00:00',
          wake_time: payload.wake_time ?? '00:00',
          duration_hours: payload.duration_hours ?? 0,
          quality_rating: payload.quality_rating ?? 3,
          awakenings: payload.awakenings ?? 0,
          notes: payload.notes ?? '',
        };
      });
    },
    enabled: !!user,
  });

  // Add a new sleep entry
  const addEntry = useMutation({
    mutationFn: async (newEntryData: Omit<SleepEntry, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { created_at, ...payload } = newEntryData;

      const { error } = await supabase.from('daily_events').insert([{
        user_id: user.id,
        event_type: 'SLEEP_LOG',
        created_at,
        payload: payload as Json,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete an existing entry
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