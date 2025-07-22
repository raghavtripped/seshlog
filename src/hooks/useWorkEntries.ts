// /src/hooks/useWorkEntries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

// Define the WorkEntry type
export type WorkEntry = {
  id: string;
  user_id: string;
  created_at: string;
  task_description: string;
  duration_minutes: number;
  productivity_level: 1 | 2 | 3 | 4 | 5;
  project?: string;
  notes?: string;
};

// The custom hook for work entries
export const useWorkEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['work_entries', user?.id];

  // Fetch work entries
  const { data: entries = [], isLoading, error } = useQuery<WorkEntry[]>({
    queryKey,
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_events')
        .select('id, user_id, created_at, payload')
        .eq('user_id', user.id)
        .eq('event_type', 'WORK_LOG')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the Supabase data into our WorkEntry type
      return data.map((entry): WorkEntry => {
        const payload = entry.payload as Record<string, unknown> || {};
        return {
          id: entry.id,
          user_id: entry.user_id,
          created_at: entry.created_at,
          task_description: (payload.task_description as string) ?? 'Unnamed Task',
          duration_minutes: (payload.duration_minutes as number) ?? 0,
          productivity_level: (payload.productivity_level as 1 | 2 | 3 | 4 | 5) ?? 3,
          project: payload.project as string | undefined,
          notes: (payload.notes as string) ?? '',
        };
      });
    },
    enabled: !!user,
  });

  // Add a new work entry
  const addEntry = useMutation({
    mutationFn: async (newEntryData: Omit<WorkEntry, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { created_at, ...payload } = newEntryData;

      const { error } = await supabase.from('daily_events').insert([{
        user_id: user.id,
        event_type: 'WORK_LOG',
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