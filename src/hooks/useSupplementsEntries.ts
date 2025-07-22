// /src/hooks/useSupplementsEntries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

// Define the SupplementEntry type
export type SupplementEntry = {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  dosage: string;
  time_of_day: 'morning' | 'afternoon' | 'evening';
  notes?: string;
};

// The custom hook for supplements entries
export const useSupplementsEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['supplements_entries', user?.id];

  // Fetch supplements entries
  const { data: entries = [], isLoading, error } = useQuery<SupplementEntry[]>({
    queryKey,
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_events')
        .select('id, user_id, created_at, payload')
        .eq('user_id', user.id)
        .eq('event_type', 'SUPPLEMENT_LOG')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the Supabase data into our SupplementEntry type
      return data.map((entry): SupplementEntry => {
        const payload = entry.payload as Record<string, unknown> || {};
        return {
          id: entry.id,
          user_id: entry.user_id,
          created_at: entry.created_at,
          name: (payload.name as string) ?? 'Unnamed Supplement',
          dosage: (payload.dosage as string) ?? 'N/A',
          time_of_day: (payload.time_of_day as 'morning' | 'afternoon' | 'evening') ?? 'morning',
          notes: (payload.notes as string) ?? '',
        };
      });
    },
    enabled: !!user,
  });

  // Add a new supplement entry
  const addEntry = useMutation({
    mutationFn: async (newEntryData: Omit<SupplementEntry, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { created_at, ...payload } = newEntryData;

      const { error } = await supabase.from('daily_events').insert([{
        user_id: user.id,
        event_type: 'SUPPLEMENT_LOG',
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