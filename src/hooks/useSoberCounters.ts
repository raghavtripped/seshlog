import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Category } from '@/types/session';
import { computeSoberStatus, type SoberStatus } from '@/lib/soberCounter';

// Supabase caps each response at 1000 rows, so a long history is read in pages
// — the longest-streak figure needs every session ever logged, not the newest 1000.
const PAGE_SIZE = 1000;
const TICK_MS = 60 * 1000;

export type SoberCounterKey = Category;

export interface SoberCounter {
  key: SoberCounterKey;
  status: SoberStatus;
}

const COUNTER_CATEGORIES: Record<SoberCounterKey, Category[]> = {
  cigs: ['cigs'],
  vapes: ['vapes'],
  weed: ['weed'],
  liquor: ['liquor'],
  gum: ['gum'],
};

type DateRow = { category: string; session_date: string };

export const useSoberCounters = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<DateRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const all: DateRow[] = [];
        for (let from = 0; ; from += PAGE_SIZE) {
          const { data, error: dbError } = await supabase
            .from('sessions')
            .select('category, session_date')
            .eq('user_id', user.id)
            .order('session_date', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);
          if (dbError) throw dbError;
          all.push(...(data ?? []));
          if (!data || data.length < PAGE_SIZE) break;
        }
        if (!cancelled) setRows(all);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const counters = useMemo<SoberCounter[]>(
    () =>
      (Object.keys(COUNTER_CATEGORIES) as SoberCounterKey[]).map((key) => {
        const categories = COUNTER_CATEGORIES[key];
        const dates = rows
          .filter((r) => categories.includes(r.category as Category))
          .map((r) => r.session_date);
        return { key, status: computeSoberStatus(dates, now) };
      }),
    [rows, now]
  );

  return { counters, isLoading, error };
};
