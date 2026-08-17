// Turns a raw `Session[]` into the numeric series the statistics run on.
//
// Two populations matter and they answer different questions:
//   • per-session amounts — how big is a typical dose?
//   • per-day totals      — how much do I get through in a day?
// Per-day totals include days with no sessions at all. Dropping those zero days
// would quietly inflate every average, because "I averaged 2g on the days I
// smoked" is a very different claim from "I averaged 2g a day".

import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns';
import { Session } from '@/types/session';
import { getNormalizedIndividualConsumption, isSocialSession } from '@/lib/utils';

export type StatsRangePreset = '30d' | '90d' | '1y' | 'all' | 'custom';

export interface DateWindow {
  /** Start of the first day in the window. */
  from: Date;
  /** Start of the last day in the window; the window includes all of this day. */
  to: Date;
}

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** Number of calendar days the window spans, counting both endpoints. */
export const windowLengthInDays = (window: DateWindow): number =>
  differenceInCalendarDays(window.to, window.from) + 1;

/**
 * Resolves a preset into concrete dates. `to` is always today, so a fall-off in
 * recent activity shows up as zero days rather than silently shortening the
 * window. For 'all', the window starts at the earliest session on record.
 */
export const resolveWindow = (
  preset: StatsRangePreset,
  sessions: Session[],
  custom?: { from?: Date; to?: Date }
): DateWindow | null => {
  const today = startOfDay(new Date());

  if (preset === 'custom') {
    if (!custom?.from) return null;
    const from = startOfDay(custom.from);
    const to = startOfDay(custom.to ?? custom.from);
    return to < from ? { from: to, to: from } : { from, to };
  }

  if (preset === 'all') {
    if (sessions.length === 0) return null;
    const earliest = sessions.reduce((acc, s) => {
      const d = parseISO(s.session_date);
      return d < acc ? d : acc;
    }, parseISO(sessions[0].session_date));
    const from = startOfDay(earliest);
    return { from, to: from > today ? from : today };
  }

  const spans: Record<'30d' | '90d' | '1y', number> = { '30d': 30, '90d': 90, '1y': 365 };
  return { from: subDays(today, spans[preset] - 1), to: today };
};

/** The equally long window immediately preceding this one, for period-over-period comparison. */
export const previousWindow = (window: DateWindow): DateWindow => {
  const length = windowLengthInDays(window);
  const to = subDays(window.from, 1);
  return { from: subDays(to, length - 1), to };
};

export const sessionsInWindow = (sessions: Session[], window: DateWindow): Session[] => {
  const start = window.from.getTime();
  const end = endOfDay(window.to).getTime();
  return sessions
    .filter((s) => {
      const t = parseISO(s.session_date).getTime();
      return t >= start && t <= end;
    })
    .sort(
      (a, b) => parseISO(a.session_date).getTime() - parseISO(b.session_date).getTime()
    );
};

export interface DayPoint {
  /** Sortable yyyy-MM-dd key. */
  key: string;
  /** Short human label for chart axes. */
  label: string;
  date: Date;
  total: number;
  count: number;
}

export interface BucketPoint {
  label: string;
  /** Weekday index 0-6, or hour 0-23. */
  index: number;
  total: number;
  count: number;
  /** Mean amount across the sessions in this bucket, or null when the bucket is empty. */
  average: number | null;
}

export interface SessionSeries {
  window: DateWindow;
  sessions: Session[];
  /** Normalized individual consumption, one entry per session, chronological. */
  perSession: number[];
  /** One entry per calendar day in the window, zero-filled. */
  days: DayPoint[];
  /** Convenience projection of `days` for the pure stats helpers. */
  dailyTotals: number[];
  /** Hours elapsed between each pair of consecutive sessions. */
  gapHours: number[];
  weekdays: BucketPoint[];
  hours: BucketPoint[];
  /** Dose/rating pairs for sessions that carry a rating. */
  ratingPairs: { dose: number; rating: number }[];
  socialDoses: number[];
  soloDoses: number[];
}

const emptyBuckets = (count: number, label: (i: number) => string): BucketPoint[] =>
  Array.from({ length: count }, (_, index) => ({
    label: label(index),
    index,
    total: 0,
    count: 0,
    average: null,
  }));

const finaliseBuckets = (buckets: BucketPoint[]): BucketPoint[] =>
  buckets.map((b) => ({ ...b, average: b.count === 0 ? null : b.total / b.count }));

export const buildSessionSeries = (
  allSessions: Session[],
  window: DateWindow
): SessionSeries => {
  const sessions = sessionsInWindow(allSessions, window);
  const perSession = sessions.map(getNormalizedIndividualConsumption);

  // Bucket sessions by calendar day first, then walk the window so every day in
  // range gets a point even if nothing was logged.
  const byDay = new Map<string, { total: number; count: number }>();
  sessions.forEach((session, i) => {
    const key = format(parseISO(session.session_date), 'yyyy-MM-dd');
    const bucket = byDay.get(key) ?? { total: 0, count: 0 };
    bucket.total += perSession[i];
    bucket.count += 1;
    byDay.set(key, bucket);
  });

  const days: DayPoint[] = [];
  // addDays works in calendar days, so this stays correct across DST shifts.
  for (
    let cursor = window.from;
    cursor <= window.to;
    cursor = addDays(cursor, 1)
  ) {
    const key = format(cursor, 'yyyy-MM-dd');
    const bucket = byDay.get(key);
    days.push({
      key,
      label: format(cursor, 'MMM dd'),
      date: cursor,
      total: bucket?.total ?? 0,
      count: bucket?.count ?? 0,
    });
  }

  const gapHours: number[] = [];
  for (let i = 1; i < sessions.length; i++) {
    const prev = parseISO(sessions[i - 1].session_date).getTime();
    const curr = parseISO(sessions[i].session_date).getTime();
    gapHours.push((curr - prev) / (1000 * 60 * 60));
  }

  const weekdays = emptyBuckets(7, (i) => WEEKDAY_NAMES[i]);
  const hours = emptyBuckets(24, (i) => `${String(i).padStart(2, '0')}:00`);
  const ratingPairs: { dose: number; rating: number }[] = [];
  const socialDoses: number[] = [];
  const soloDoses: number[] = [];

  sessions.forEach((session, i) => {
    const date = parseISO(session.session_date);
    const dose = perSession[i];

    const weekday = weekdays[date.getDay()];
    weekday.total += dose;
    weekday.count += 1;

    const hour = hours[date.getHours()];
    hour.total += dose;
    hour.count += 1;

    if (session.rating !== null && session.rating !== undefined) {
      ratingPairs.push({ dose, rating: session.rating });
    }

    if (isSocialSession(session)) socialDoses.push(dose);
    else soloDoses.push(dose);
  });

  return {
    window,
    sessions,
    perSession,
    days,
    dailyTotals: days.map((d) => d.total),
    gapHours,
    weekdays: finaliseBuckets(weekdays),
    hours: finaliseBuckets(hours),
    ratingPairs,
    socialDoses,
    soloDoses,
  };
};

export interface Streaks {
  /** Consecutive days ending today (or the window's last day) with at least one session. */
  currentActive: number;
  /** Consecutive days ending at the window's last day with no sessions at all. */
  currentClean: number;
  longestActive: number;
  longestClean: number;
}

export const computeStreaks = (days: DayPoint[]): Streaks => {
  let longestActive = 0;
  let longestClean = 0;
  let runActive = 0;
  let runClean = 0;

  for (const day of days) {
    if (day.count > 0) {
      runActive += 1;
      runClean = 0;
      longestActive = Math.max(longestActive, runActive);
    } else {
      runClean += 1;
      runActive = 0;
      longestClean = Math.max(longestClean, runClean);
    }
  }

  return { currentActive: runActive, currentClean: runClean, longestActive, longestClean };
};

export interface PeriodSummary {
  sessionCount: number;
  total: number;
  sessionsPerDay: number;
  averagePerDay: number;
  averagePerSession: number | null;
  activeDays: number;
  dayCount: number;
}

export const summarisePeriod = (series: SessionSeries): PeriodSummary => {
  const total = series.perSession.reduce((acc, x) => acc + x, 0);
  const dayCount = series.days.length;
  return {
    sessionCount: series.sessions.length,
    total,
    sessionsPerDay: dayCount === 0 ? 0 : series.sessions.length / dayCount,
    averagePerDay: dayCount === 0 ? 0 : total / dayCount,
    averagePerSession:
      series.sessions.length === 0 ? null : total / series.sessions.length,
    activeDays: series.days.filter((d) => d.count > 0).length,
    dayCount,
  };
};
