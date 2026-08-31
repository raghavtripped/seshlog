import { useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { Session } from '@/types/session';
import { resolveWindow, type StatsRangePreset } from '@/lib/sessionSeries';
import {
  analyseNicotineLoad,
  type ExchangeRates,
  type NicotineLoadAnalysis,
} from '@/lib/nicotineLoad';

/**
 * Memoized nicotine-load analysis across cigs, vapes and gum. Returns null when
 * the range can't be resolved (all-time with no sessions, or an unfinished custom
 * range).
 */
export const useNicotineLoad = (
  sessions: Session[],
  preset: StatsRangePreset,
  customRange?: DateRange,
  overrides?: Partial<ExchangeRates>
): NicotineLoadAnalysis | null =>
  useMemo(() => {
    const window = resolveWindow(preset, sessions, customRange);
    if (!window) return null;
    return analyseNicotineLoad(sessions, window, overrides);
  }, [sessions, preset, customRange, overrides]);
