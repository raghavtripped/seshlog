import { useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { Session } from '@/types/session';
import { resolveWindow, type StatsRangePreset } from '@/lib/sessionSeries';
import { analyseNicotineLoad, type NicotineLoadAnalysis } from '@/lib/nicotineLoad';

/**
 * Memoized nicotine-load analysis across cigs and vapes. Returns null when the
 * range can't be resolved (all-time with no sessions, or an unfinished custom range).
 */
export const useNicotineLoad = (
  sessions: Session[],
  preset: StatsRangePreset,
  customRange?: DateRange,
  rateOverride?: number
): NicotineLoadAnalysis | null =>
  useMemo(() => {
    const window = resolveWindow(preset, sessions, customRange);
    if (!window) return null;
    return analyseNicotineLoad(sessions, window, rateOverride);
  }, [sessions, preset, customRange, rateOverride]);
