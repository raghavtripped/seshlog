// Combines cigarettes, vaping and nicotine gum into a single nicotine load.
//
// Why this exists: cigs are counted in cigarettes, vapes in puffs and gum in
// milligrams, so no series alone shows the total. When consumption moves between
// them — as it does substantially during a quit attempt, which is the whole point
// of logging gum — each individual series looks flat or noisy while the combined
// total moves. The combined figure is the one that answers "how much am I
// actually taking in?".
//
// The conversion rates are estimated from the data rather than asserted: we pick
// the rates that make weekly combined load most stable. If someone genuinely
// swaps one source for another at a consistent exchange rate, that rate is the
// one under which their total stops jumping around. These are estimates with real
// uncertainty, so the UI exposes them and lets them be overridden.

import { startOfWeek, endOfWeek, addWeeks, format, parseISO } from 'date-fns';
import { Session } from '@/types/session';
import { getNormalizedIndividualConsumption, gumMgPerPiece } from '@/lib/utils';
import { coefficientOfVariation, linearRegression, mean, pearson } from '@/lib/stats';
import type { DateWindow } from '@/lib/sessionSeries';

/** Fallback when there isn't enough overlap to fit a rate. Mid-range and clearly labelled as a default. */
export const DEFAULT_PUFFS_PER_CIG = 20;

/**
 * Fallback milligrams of gum per cigarette-equivalent. A 2mg piece delivers
 * roughly the systemic nicotine of one cigarette, so one piece ≈ one cig by
 * default. Like the puff rate, this is a starting point, not a clinical claim.
 */
export const DEFAULT_MG_PER_CIG = 2;

/** Search bounds for the fitted rates. Outside these ranges the result is not physiologically meaningful. */
export const RATE_SEARCH = { min: 2, max: 100, step: 0.5 } as const;
export const MG_RATE_SEARCH = { min: 0.5, max: 8, step: 0.1 } as const;

export const THRESHOLDS = {
  /** Weeks of data needed before fitting a rate. */
  fitWeeks: 8,
  /** Weeks needed before reporting a trend or a substitution correlation. */
  trendWeeks: 8,
  /** Each series needs this many non-zero weeks for the fit to mean anything. */
  nonZeroWeeks: 3,
} as const;

/** The assumptions that put all three sources on the cigarette scale. */
export interface ExchangeRates {
  /** Puffs judged equivalent to one cigarette. */
  puffsPerCig: number;
  /** Milligrams of gum judged equivalent to one cigarette. */
  mgPerCig: number;
}

export const DEFAULT_RATES: ExchangeRates = {
  puffsPerCig: DEFAULT_PUFFS_PER_CIG,
  mgPerCig: DEFAULT_MG_PER_CIG,
};

export type RateKey = keyof ExchangeRates;
export type RateSource = 'override' | 'fitted' | 'default';

export interface WeekBucket {
  /** Sortable yyyy-MM-dd key for the week start. */
  key: string;
  label: string;
  date: Date;
  /** Individual cigarette consumption that week. */
  cigs: number;
  /** Individual puff consumption that week. */
  puffs: number;
  /** Individual gum consumption that week, in milligrams of nicotine. */
  gumMg: number;
}

const NICOTINE_CATEGORIES = new Set(['cigs', 'vapes', 'gum']);

/**
 * Buckets all three categories into weeks across the window, zero-filling weeks
 * with no sessions. Zero weeks matter here: a week off is a real data point about
 * load.
 *
 * The window is snapped outwards to whole weeks first. Every bucket then covers a
 * complete week and counts every session in it. Filtering on the raw window
 * instead would truncate the first bucket (its week starts before `from`) while
 * leaving the last one over-inclusive — and since both distortions push the same
 * way, they would exaggerate any upward trend.
 */
export const bucketByWeek = (sessions: Session[], window: DateWindow): WeekBucket[] => {
  const totals = new Map<string, { cigs: number; puffs: number; gumMg: number }>();
  const firstWeek = startOfWeek(window.from);
  const lastMoment = endOfWeek(window.to);

  for (const session of sessions) {
    if (!NICOTINE_CATEGORIES.has(session.category)) continue;
    const date = parseISO(session.session_date);
    if (date < firstWeek || date > lastMoment) continue;

    const key = format(startOfWeek(date), 'yyyy-MM-dd');
    const bucket = totals.get(key) ?? { cigs: 0, puffs: 0, gumMg: 0 };
    const amount = getNormalizedIndividualConsumption(session);
    if (session.category === 'cigs') bucket.cigs += amount;
    else if (session.category === 'vapes') bucket.puffs += amount;
    // Gum is logged in pieces; the strength lives in the session type, so a week
    // of 4mg pieces counts double a week of the same number of 2mg pieces.
    else bucket.gumMg += amount * gumMgPerPiece(session.session_type);
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
      gumMg: bucket?.gumMg ?? 0,
    });
  }

  return weeks;
};

export const loadAtRates = (weeks: WeekBucket[], rates: ExchangeRates): number[] =>
  weeks.map((w) => w.cigs + w.puffs / rates.puffsPerCig + w.gumMg / rates.mgPerCig);

export interface RateFit {
  /** The rates the search settled on. Axes that were not fitted sit at their defaults. */
  rates: ExchangeRates;
  /**
   * Which axes the data actually supported fitting. An axis with too little of its
   * own series is pinned to the default instead of being handed to the optimizer,
   * where any value would "fit" equally well.
   */
  fitted: Record<RateKey, boolean>;
  /** Coefficient of variation of combined load at those rates — lower means a better fit. */
  cv: number;
  /** CV of each series on its own, for comparison. Combining should beat all of them. */
  cvCigsAlone: number | null;
  cvPuffsAlone: number | null;
  cvGumAlone: number | null;
}

const countNonZero = (xs: number[]) => xs.filter((x) => x > 0).length;

const gridFor = (range: { min: number; max: number; step: number }): number[] => {
  const values: number[] = [];
  for (let v = range.min; v <= range.max + 1e-9; v += range.step) {
    values.push(Math.round(v * 1e6) / 1e6);
  }
  return values;
};

/**
 * Finds the exchange rates minimizing the coefficient of variation of weekly
 * combined load.
 *
 * Cigarettes are the scale everything else is expressed in, so without enough of
 * them there is nothing to anchor against and we return null. Each of the other
 * two axes is only searched if its own series appears often enough to constrain
 * it; otherwise it stays at its default and drops out of the search. That keeps
 * the result identical to the two-source behaviour for anyone with no gum data,
 * and stops a handful of gum weeks from letting the optimizer pick an arbitrary
 * milligram rate that happens to smooth the total.
 */
export const fitExchangeRate = (weeks: WeekBucket[]): RateFit | null => {
  if (weeks.length < THRESHOLDS.fitWeeks) return null;

  const cigs = weeks.map((w) => w.cigs);
  const puffs = weeks.map((w) => w.puffs);
  const gumMg = weeks.map((w) => w.gumMg);

  if (countNonZero(cigs) < THRESHOLDS.nonZeroWeeks) return null;

  const fitPuffs = countNonZero(puffs) >= THRESHOLDS.nonZeroWeeks;
  const fitGum = countNonZero(gumMg) >= THRESHOLDS.nonZeroWeeks;
  if (!fitPuffs && !fitGum) return null;

  const puffGrid = fitPuffs ? gridFor(RATE_SEARCH) : [DEFAULT_PUFFS_PER_CIG];
  const mgGrid = fitGum ? gridFor(MG_RATE_SEARCH) : [DEFAULT_MG_PER_CIG];

  let best: { rates: ExchangeRates; cv: number } | null = null;
  for (const puffsPerCig of puffGrid) {
    for (const mgPerCig of mgGrid) {
      const rates = { puffsPerCig, mgPerCig };
      const cv = coefficientOfVariation(loadAtRates(weeks, rates));
      if (cv === null) continue;
      if (!best || cv < best.cv) best = { rates, cv };
    }
  }
  if (!best) return null;

  return {
    rates: best.rates,
    fitted: { puffsPerCig: fitPuffs, mgPerCig: fitGum },
    cv: best.cv,
    cvCigsAlone: coefficientOfVariation(cigs),
    cvPuffsAlone: coefficientOfVariation(puffs),
    cvGumAlone: coefficientOfVariation(gumMg),
  };
};

export interface SubstitutionResult {
  /** Correlation between the two weekly volumes. Negative means substitution. */
  r: number;
  weeks: number;
  /** True when the relationship is negative and strong enough to act on. */
  isSubstituting: boolean;
}

export interface SubstitutionAnalysis {
  cigsVapes: SubstitutionResult | null;
  cigsGum: SubstitutionResult | null;
}

const correlate = (a: number[], b: number[]): SubstitutionResult | null => {
  if (a.length < THRESHOLDS.trendWeeks) return null;
  const r = pearson(a, b);
  if (r === null) return null;
  return { r, weeks: a.length, isSubstituting: r <= -0.3 };
};

/**
 * Tests whether the sources trade off against each other. A negative correlation
 * means that when one goes up the other goes down in the same week —
 * substitution. A positive one would mean a shared driver pushing both up.
 *
 * Cigarettes are the reference on both pairs because they are the thing being
 * quit: what matters is whether vaping or gum is displacing them.
 */
export const analyseSubstitution = (weeks: WeekBucket[]): SubstitutionAnalysis => {
  const cigs = weeks.map((w) => w.cigs);
  return {
    cigsVapes: correlate(cigs, weeks.map((w) => w.puffs)),
    cigsGum: correlate(cigs, weeks.map((w) => w.gumMg)),
  };
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
  /** The rates actually used — the override when set, else the fit, else the default. */
  rates: ExchangeRates;
  rateSource: Record<RateKey, RateSource>;
  fit: RateFit | null;
  load: number[];
  /** Fraction of each week's load coming from cigarettes; null for weeks with nothing logged. */
  cigShare: (number | null)[];
  /** Fraction of each week's load coming from gum; null for weeks with nothing logged. */
  gumShare: (number | null)[];
  trend: LoadTrend | null;
  substitution: SubstitutionAnalysis;
  totalLoad: number;
  meanLoad: number | null;
  hasData: boolean;
  /** Whether any gum was logged in the window, so the UI can stay quiet about it otherwise. */
  hasGum: boolean;
}

const resolveRate = (
  key: RateKey,
  overrides: Partial<ExchangeRates> | undefined,
  fit: RateFit | null
): { value: number; source: RateSource } => {
  const override = overrides?.[key];
  if (override !== undefined) return { value: override, source: 'override' };
  if (fit?.fitted[key]) return { value: fit.rates[key], source: 'fitted' };
  return { value: DEFAULT_RATES[key], source: 'default' };
};

export const analyseNicotineLoad = (
  sessions: Session[],
  window: DateWindow,
  overrides?: Partial<ExchangeRates>
): NicotineLoadAnalysis => {
  const weeks = bucketByWeek(sessions, window);
  const fit = fitExchangeRate(weeks);

  const puffs = resolveRate('puffsPerCig', overrides, fit);
  const mg = resolveRate('mgPerCig', overrides, fit);
  const rates: ExchangeRates = { puffsPerCig: puffs.value, mgPerCig: mg.value };

  const load = loadAtRates(weeks, rates);
  const totalLoad = load.reduce((acc, x) => acc + x, 0);

  return {
    weeks,
    rates,
    rateSource: { puffsPerCig: puffs.source, mgPerCig: mg.source },
    fit,
    load,
    cigShare: weeks.map((w, i) => (load[i] === 0 ? null : w.cigs / load[i])),
    gumShare: weeks.map((w, i) => (load[i] === 0 ? null : w.gumMg / rates.mgPerCig / load[i])),
    trend: analyseTrend(load),
    substitution: analyseSubstitution(weeks),
    totalLoad,
    meanLoad: mean(load),
    hasData: weeks.some((w) => w.cigs > 0 || w.puffs > 0 || w.gumMg > 0),
    hasGum: weeks.some((w) => w.gumMg > 0),
  };
};
