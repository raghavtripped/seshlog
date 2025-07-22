// /src/hooks/useHydrationEntries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

// Define the HydrationEntry type
export type HydrationEntry = {
  id: string;
  user_id: string;
  created_at: string;
  amount_ml: number; // Amount in milliliters
  beverage_type: string; // e.g., 'water', 'coffee', 'juice'
  notes?: string;
};

// The custom hook for hydration entries
export const useHydrationEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['hydration_entries', user?.id];

  // Fetch hydration entries
  const { data: entries = [], isLoading, error } = useQuery<HydrationEntry[]>({
    queryKey,
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_events')
        .select('id, user_id, created_at, payload')
        .eq('user_id', user.id)
        .eq('event_type', 'HYDRATION_LOG')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the Supabase data into our HydrationEntry type
      return data.map((entry): HydrationEntry => {
        const payload = entry.payload as Record<string, unknown> || {};
        return {
          id: entry.id,
          user_id: entry.user_id,
          created_at: entry.created_at,
          amount_ml: (payload.amount_ml as number) ?? 0,
          beverage_type: (payload.beverage_type as string) ?? 'water',
          notes: (payload.notes as string) ?? '',
        };
      });
    },
    enabled: !!user,
  });

  // Add a new hydration entry
  const addEntry = useMutation({
    mutationFn: async (newEntryData: Omit<HydrationEntry, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { created_at, ...payload } = newEntryData;

      const { error } = await supabase.from('daily_events').insert([{
        user_id: user.id,
        event_type: 'HYDRATION_LOG',
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