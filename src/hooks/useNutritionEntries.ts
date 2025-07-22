// /src/hooks/useNutritionEntries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

// Define the NutritionEntry type
export type NutritionEntry = {
  id: string;
  user_id: string;
  created_at: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  notes?: string;
};

// The custom hook for nutrition entries
export const useNutritionEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['nutrition_entries', user?.id];

  // Fetch nutrition entries
  const { data: entries = [], isLoading, error } = useQuery<NutritionEntry[]>({
    queryKey,
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_events')
        .select('id, user_id, created_at, payload')
        .eq('user_id', user.id)
        .eq('event_type', 'NUTRITION_LOG')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the Supabase data into our NutritionEntry type
      return data.map((entry): NutritionEntry => {
        const payload = entry.payload as Record<string, unknown> || {};
        return {
          id: entry.id,
          user_id: entry.user_id,
          created_at: entry.created_at,
          meal_type: (payload.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack') ?? 'snack',
          description: (payload.description as string) ?? 'No description',
          calories: (payload.calories as number) ?? 0,
          protein: payload.protein as number | undefined,
          carbs: payload.carbs as number | undefined,
          fats: payload.fats as number | undefined,
          notes: (payload.notes as string) ?? '',
        };
      });
    },
    enabled: !!user,
  });

  // Add a new nutrition entry
  const addEntry = useMutation({
    mutationFn: async (newEntryData: Omit<NutritionEntry, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { created_at, ...payload } = newEntryData;

      const { error } = await supabase.from('daily_events').insert([{
        user_id: user.id,
        event_type: 'NUTRITION_LOG',
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