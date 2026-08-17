// Combines cigarettes and vaping into a single nicotine load.
//
// Why this exists: cigs are counted in cigarettes and vapes in puffs, so neither
// series alone shows the total. When consumption moves between the two — as it
// does substantially in practice — each individual series looks flat or noisy
// while the combined total moves. The combined figure is the one that answers
// "how much am I actually taking in?".
//
// The conversion rate is estimated from the data rather than asserted: we pick
// the rate that makes weekly combined load most stable. If someone genuinely
// swaps one device for another at a consistent exchange rate, that rate is the
// one under which their total stops jumping around. This is an estimate with
// real uncertainty, so the UI exposes it and lets it be overridden.

import { startOfWeek, endOfWeek, addWeeks, format, parseISO } from 'date-fns';
import { Session } from '@/types/session';
import { getNormalizedIndividualConsumption } from '@/lib/utils';
import { coefficientOfVariation, linearRegression, mean, pearson } from '@/lib/stats';
import type { DateWindow } from '@/lib/sessionSeries';

/** Fallback when there isn't enough overlap to fit a rate. Mid-range and clearly labelled as a default. */
export const DEFAULT_PUFFS_PER_CIG = 20;

/** Search bounds for the fitted rate. Outside this range the result is not physiologically meaningful. */
export const RATE_SEARCH = { min: 2, max: 100, step: 0.5 } as const;

export const THRESHOLDS = {
  /** Weeks of data needed before fitting a rate. */
  fitWeeks: 8,
  /** Weeks needed before reporting a trend or a substitution correlation. */
  trendWeeks: 8,
  /** Each series needs this many non-zero weeks for the fit to mean anything. */
  nonZeroWeeks: 3,
} as const;

export interface WeekBucket {
  /** Sortable yyyy-MM-dd key for the week start. */
  key: string;
  label: string;
  date: Date;
  /** Individual cigarette consumption that week. */
  cigs: number;
  /** Individual puff consumption that week. */
  puffs: number;
}

/**
 * Buckets both categories into weeks across the window, zero-filling weeks with
 * no sessions. Zero weeks matter here: a week off is a real data point about load.
 *
 * The window is snapped outwards to whole weeks first. Every bucket then covers a
 * complete week and counts every session in it. Filtering on the raw window
 * instead would truncate the first bucket (its week starts before `from`) while
 * leaving the last one over-inclusive — and since both distortions push the same
 * way, they would exaggerate any upward trend.
 */
export const bucketByWeek = (sessions: Session[], window: DateWindow): WeekBucket[] => {
  const totals = new Map<string, { cigs: number; puffs: number }>();
  const firstWeek = startOfWeek(window.from);
  const lastMoment = endOfWeek(window.to);

  for (const session of sessions) {
    if (session.category !== 'cigs' && session.category !== 'vapes') continue;
    const date = parseISO(session.session_date);
    if (date < firstWeek || date > lastMoment) continue;

    const key = format(startOfWeek(date), 'yyyy-MM-dd');
    const bucket = totals.get(key) ?? { cigs: 0, puffs: 0 };
    const amount = getNormalizedIndividualConsumption(session);
    if (session.category === 'cigs') bucket.cigs += amount;
    else bucket.puffs += amount;
    totals.set(key, bucket);
  }

  const weeks: WeekBucket[] = [];
  const last = startOfWeek(window.to);
  for (let cursor = startOfWeek(window.from); cursor <= last; cursor = addWeeks(cursor, 1)) {
    const key = format(cursor, 'yyyy-MM-dd');
    const bucket = totals.get(key);
    weeks.push({
      key,
      label: format(cursor, 'MMM dd'),
      date: cursor,
      cigs: bucket?.cigs ?? 0,
      puffs: bucket?.puffs ?? 0,
    });
  }

  return weeks;
};

export const loadAtRate = (weeks: WeekBucket[], puffsPerCig: number): number[] =>
  weeks.map((w) => w.cigs + w.puffs / puffsPerCig);

export interface RateFit {
  /** Puffs judged equivalent to one cigarette. */
  rate: number;
  /** Coefficient of variation of combined load at that rate — lower means a better fit. */
  cv: number;
  /** CV of each series on its own, for comparison. Combining should beat both. */
  cvCigsAlone: number | null;
  cvPuffsAlone: number | null;
}

const countNonZero = (xs: number[]) => xs.filter((x) => x > 0).length;

/**
 * Finds the exchange rate minimizing the coefficient of variation of weekly
 * combined load. Returns null when there isn't enough of both series to make
 * the question meaningful — with no real overlap, any rate "fits".
 */
export const fitExchangeRate = (weeks: WeekBucket[]): RateFit | null => {
  if (weeks.length < THRESHOLDS.fitWeeks) return null;

  const cigs = weeks.map((w) => w.cigs);
  const puffs = weeks.map((w) => w.puffs);
  if (
    countNonZero(cigs) < THRESHOLDS.nonZeroWeeks ||
    countNonZero(puffs) < THRESHOLDS.nonZeroWeeks
  ) {
    return null;
  }

  let best: { rate: number; cv: number } | null = null;
  for (let rate = RATE_SEARCH.min; rate <= RATE_SEARCH.max; rate += RATE_SEARCH.step) {
    const cv = coefficientOfVariation(loadAtRate(weeks, rate));
    if (cv === null) continue;
    if (!best || cv < best.cv) best = { rate, cv };
  }
  if (!best) return null;

  return {
    rate: best.rate,
    cv: best.cv,
    cvCigsAlone: coefficientOfVariation(cigs),
    cvPuffsAlone: coefficientOfVariation(puffs),
  };
};

export interface SubstitutionResult {
  /** Correlation between weekly cig and puff volume. Negative means substitution. */
  r: number;
  weeks: number;
  /** True when the relationship is negative and strong enough to act on. */
  isSubstituting: boolean;
}

/**
 * Tests whether the two categories trade off against each other. A negative
 * correlation means that when one goes up the other goes down in the same week
 * — substitution. A positive one would mean a shared driver pushing both up.
 */
export const analyseSubstitution = (weeks: WeekBucket[]): SubstitutionResult | null => {
  if (weeks.length < THRESHOLDS.trendWeeks) return null;
  const r = pearson(
    weeks.map((w) => w.cigs),
    weeks.map((w) => w.puffs)
  );
  if (r === null) return null;
  return { r, weeks: weeks.length, isSubstituting: r <= -0.3 };
};

export interface LoadTrend {
  /** Change in weekly load per week. */
  slopePerWeek: number;
  r2: number;
  direction: 'up' | 'down' | 'flat';
  /** Mean load over the first and last quarter of the window, for a plain comparison. */
  earlyMean: number;
  lateMean: number;
}

export const analyseTrend = (load: number[]): LoadTrend | null => {
  if (load.length < THRESHOLDS.trendWeeks) return null;
  const fit = linearRegression(load.map((y, x) => ({ x, y })));
  if (!fit) return null;

  // Compare the first and last quarter rather than halves: with slow drift, the
  // ends separate more clearly than the midpoints do.
  const span = Math.max(1, Math.floor(load.length / 4));
  const earlyMean = mean(load.slice(0, span)) ?? 0;
  const lateMean = mean(load.slice(-span)) ?? 0;

  return {
    slopePerWeek: fit.slope,
    r2: fit.r2,
    direction: Math.abs(fit.slope) < 0.05 ? 'flat' : fit.slope > 0 ? 'up' : 'down',
    earlyMean,
    lateMean,
  };
};

export interface NicotineLoadAnalysis {
  weeks: WeekBucket[];
  /** The rate actually used — the override when set, else the fit, else the default. */
  rate: number;
  rateSource: 'override' | 'fitted' | 'default';
  fit: RateFit | null;
  load: number[];
  /** Fraction of each week's load coming from cigarettes; null for weeks with nothing logged. */
  cigShare: (number | null)[];
  trend: LoadTrend | null;
  substitution: SubstitutionResult | null;
  totalLoad: number;
  meanLoad: number | null;
  hasData: boolean;
}

export const analyseNicotineLoad = (
  sessions: Session[],
  window: DateWindow,
  rateOverride?: number
): NicotineLoadAnalysis => {
  const weeks = bucketByWeek(sessions, window);
  const fit = fitExchangeRate(weeks);

  const rate = rateOverride ?? fit?.rate ?? DEFAULT_PUFFS_PER_CIG;
  const rateSource: NicotineLoadAnalysis['rateSource'] =
    rateOverride !== undefined ? 'override' : fit ? 'fitted' : 'default';

  const load = loadAtRate(weeks, rate);
  const totalLoad = load.reduce((acc, x) => acc + x, 0);

  return {
    weeks,
    rate,
    rateSource,
    fit,
    load,
    cigShare: weeks.map((w, i) => (load[i] === 0 ? null : w.cigs / load[i])),
    trend: analyseTrend(load),
    substitution: analyseSubstitution(weeks),
    totalLoad,
    meanLoad: mean(load),
    hasData: weeks.some((w) => w.cigs > 0 || w.puffs > 0),
  };
};
