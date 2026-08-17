import { useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { Session } from '@/types/session';
import { resolveWindow, type StatsRangePreset } from '@/lib/sessionSeries';
import { computeSessionStatistics, type SessionStatistics } from '@/lib/sessionStatistics';

/**
 * Memoized wrapper around `computeSessionStatistics`. Returns null when the
 * chosen range can't be resolved — 'all time' with no sessions on record, or a
 * custom range the user hasn't finished picking.
 */
export const useSessionStatistics = (
  sessions: Session[],
  preset: StatsRangePreset,
  customRange?: DateRange
): SessionStatistics | null =>
  useMemo(() => {
    const window = resolveWindow(preset, sessions, customRange);
    if (!window) return null;
    return computeSessionStatistics(sessions, window);
  }, [sessions, preset, customRange]);
