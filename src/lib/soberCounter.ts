// Time-since-last-use counters for the substance categories.
//
// A bare streak that snaps back to zero is the riskiest way to show this: after
// one slip it reads as "all progress lost", which is exactly the thinking that
// turns a lapse into a full relapse (the abstinence violation effect). So
// alongside the current streak we report two figures a single slip can't erase:
// the longest streak ever, and how many of the last 30 days were session-free.

import { differenceInCalendarDays, format, parseISO, startOfDay, subDays } from 'date-fns';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** How far back the "free days" figure looks, counting today. */
export const SOBER_WINDOW_DAYS = 30;

export interface SoberStatus {
  /** When the most recent session happened; null if none was ever logged. */
  lastAt: Date | null;
  /** Time since the most recent session, never negative. */
  currentMs: number | null;
  /** Longest gap between sessions, including the current one. */
  longestMs: number | null;
  /** Calendar days in the window with no session. */
  freeDays: number;
  /**
   * Calendar days the window covers. Shorter than SOBER_WINDOW_DAYS when logging
   * started recently — days before the first log aren't known to be clean.
   */
  windowDays: number;
}

export const computeSoberStatus = (sessionDates: string[], now: Date): SoberStatus => {
  if (sessionDates.length === 0) {
    return { lastAt: null, currentMs: null, longestMs: null, freeDays: 0, windowDays: 0 };
  }

  const times = sessionDates.map((d) => parseISO(d).getTime()).sort((a, b) => a - b);
  const last = times[times.length - 1];
  const currentMs = Math.max(0, now.getTime() - last);

  let longestMs = currentMs;
  for (let i = 1; i < times.length; i++) {
    longestMs = Math.max(longestMs, times[i] - times[i - 1]);
  }

  const today = startOfDay(now);
  const windowStart = new Date(
    Math.max(subDays(today, SOBER_WINDOW_DAYS - 1).getTime(), startOfDay(times[0]).getTime())
  );
  const windowDays = Math.max(0, differenceInCalendarDays(today, windowStart) + 1);

  const usedDays = new Set<string>();
  for (const t of times) {
    if (t >= windowStart.getTime() && t < today.getTime() + DAY) {
      usedDays.add(format(t, 'yyyy-MM-dd'));
    }
  }

  return {
    lastAt: new Date(last),
    currentMs,
    longestMs,
    freeDays: windowDays - usedDays.size,
    windowDays,
  };
};

/** Compact duration: "35m", "5h 12m", "3d 4h", then whole days from 30d up. */
export const formatSoberDuration = (ms: number): string => {
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);

  if (days >= 30) return `${days}d`;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
