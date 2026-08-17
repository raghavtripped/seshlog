// Assembles the full statistics bundle rendered by the category stats page.
//
// Kept as a pure function (the React hook is a thin `useMemo` around it) so the
// thresholds and interpretations below can be tested directly.

import { Session } from '@/types/session';
import {
  coefficientOfVariation,
  linearRegression,
  max,
  mean,
  median,
  min,
  mode,
  outlierBounds,
  pearson,
  percentChange,
  quantile,
  quartiles,
  skewness,
  stdDev,
  sum,
  variance,
} from '@/lib/stats';
import {
  buildSessionSeries,
  computeStreaks,
  previousWindow,
  summarisePeriod,
  windowLengthInDays,
  type DateWindow,
  type SessionSeries,
  type Streaks,
  type PeriodSummary,
} from '@/lib/sessionSeries';

/**
 * Minimum sample sizes. Below these we show "not enough data yet" rather than a
 * number, because a standard deviation over three sessions or a trend line over
 * five days is noise wearing a lab coat.
 */
export const THRESHOLDS = {
  spread: 2,
  outliers: 8,
  trendDays: 14,
  trendSessions: 5,
  correlation: 5,
  skew: 3,
} as const;

export interface Descriptive {
  n: number;
  sum: number;
  mean: number | null;
  median: number | null;
  mode: number | null;
  stdDev: number | null;
  variance: number | null;
  cv: number | null;
  min: number | null;
  q1: number | null;
  q3: number | null;
  max: number | null;
  iqr: number | null;
  p90: number | null;
  p95: number | null;
  skew: number | null;
}

export const describe = (xs: number[]): Descriptive => {
  const q = quartiles(xs);
  return {
    n: xs.length,
    sum: sum(xs),
    mean: mean(xs),
    median: median(xs),
    mode: mode(xs),
    stdDev: stdDev(xs),
    variance: variance(xs),
    cv: coefficientOfVariation(xs),
    min: min(xs),
    q1: q?.q1 ?? null,
    q3: q?.q3 ?? null,
    max: max(xs),
    iqr: q?.iqr ?? null,
    p90: quantile(xs, 0.9),
    p95: quantile(xs, 0.95),
    skew: xs.length >= THRESHOLDS.skew ? skewness(xs) : null,
  };
};

export type ConsistencyBand = 'steady' | 'variable' | 'spiky';

/**
 * Turns a coefficient of variation into plain language. The cutoffs are
 * conventional rules of thumb, not laws of nature — they exist so the number
 * means something at a glance.
 */
export const consistencyBand = (cv: number): ConsistencyBand => {
  if (cv < 0.3) return 'steady';
  if (cv < 0.6) return 'variable';
  return 'spiky';
};

export interface ComparisonMetric {
  current: number;
  previous: number;
  change: number | null;
}

const compare = (current: number, previous: number): ComparisonMetric => ({
  current,
  previous,
  change: percentChange(current, previous),
});

export interface TrendResult {
  /** Change in daily consumption per week, from an OLS fit on daily totals. */
  slopePerWeek: number;
  /** How much of the day-to-day variation the straight line explains, 0-1. */
  r2: number;
  direction: 'up' | 'down' | 'flat';
}

export interface OutlierSession {
  session: Session;
  dose: number;
}

export interface GapStats {
  medianHours: number | null;
  meanHours: number | null;
  longestHours: number | null;
}

export interface SocialSplit {
  socialCount: number;
  soloCount: number;
  socialAverage: number | null;
  soloAverage: number | null;
  /** Social mean minus solo mean; null unless both sides have data. */
  difference: number | null;
}

export interface SessionStatistics {
  window: DateWindow;
  series: SessionSeries;
  summary: PeriodSummary;
  previousSummary: PeriodSummary;
  comparison: {
    total: ComparisonMetric;
    sessionCount: ComparisonMetric;
    sessionsPerDay: ComparisonMetric;
    averagePerSession: ComparisonMetric;
  };
  /** Null when the window is too short or too sparse to fit a meaningful line. */
  trend: TrendResult | null;
  perSession: Descriptive;
  perDay: Descriptive;
  streaks: Streaks;
  /** Null below `THRESHOLDS.outliers` sessions; empty array means none found. */
  outliers: OutlierSession[] | null;
  gaps: GapStats;
  /** Correlation between dose size and self-reported rating; null when too few rated sessions. */
  ratingCorrelation: number | null;
  averageRating: number | null;
  social: SocialSplit;
  /** Daily totals paired with a 7-day trailing average for the trend chart. */
  hasData: boolean;
}

export const computeSessionStatistics = (
  allSessions: Session[],
  window: DateWindow
): SessionStatistics => {
  const series = buildSessionSeries(allSessions, window);
  const summary = summarisePeriod(series);

  const prevSeries = buildSessionSeries(allSessions, previousWindow(window));
  const previousSummary = summarisePeriod(prevSeries);

  const dayCount = windowLengthInDays(window);
  const enoughForTrend =
    dayCount >= THRESHOLDS.trendDays && series.sessions.length >= THRESHOLDS.trendSessions;

  let trend: TrendResult | null = null;
  if (enoughForTrend) {
    const fit = linearRegression(
      series.dailyTotals.map((y, x) => ({ x, y }))
    );
    if (fit) {
      const slopePerWeek = fit.slope * 7;
      trend = {
        slopePerWeek,
        r2: fit.r2,
        // Anything under a hundredth of a unit a week is flat for our purposes.
        direction: Math.abs(slopePerWeek) < 0.01 ? 'flat' : slopePerWeek > 0 ? 'up' : 'down',
      };
    }
  }

  let outliers: OutlierSession[] | null = null;
  if (series.sessions.length >= THRESHOLDS.outliers) {
    const bounds = outlierBounds(series.perSession);
    outliers = bounds
      ? series.sessions
          .map((session, i) => ({ session, dose: series.perSession[i] }))
          .filter((entry) => entry.dose > bounds.upper)
          .sort((a, b) => b.dose - a.dose)
      : [];
  }

  const gaps: GapStats = {
    medianHours: median(series.gapHours),
    meanHours: mean(series.gapHours),
    longestHours: max(series.gapHours),
  };

  const ratingCorrelation =
    series.ratingPairs.length >= THRESHOLDS.correlation
      ? pearson(
          series.ratingPairs.map((p) => p.dose),
          series.ratingPairs.map((p) => p.rating)
        )
      : null;

  const socialAverage = mean(series.socialDoses);
  const soloAverage = mean(series.soloDoses);

  return {
    window,
    series,
    summary,
    previousSummary,
    comparison: {
      total: compare(summary.total, previousSummary.total),
      sessionCount: compare(summary.sessionCount, previousSummary.sessionCount),
      sessionsPerDay: compare(summary.sessionsPerDay, previousSummary.sessionsPerDay),
      averagePerSession: compare(
        summary.averagePerSession ?? 0,
        previousSummary.averagePerSession ?? 0
      ),
    },
    trend,
    perSession: describe(series.perSession),
    perDay: describe(series.dailyTotals),
    streaks: computeStreaks(series.days),
    outliers,
    gaps,
    ratingCorrelation,
    averageRating: mean(series.ratingPairs.map((p) => p.rating)),
    social: {
      socialCount: series.socialDoses.length,
      soloCount: series.soloDoses.length,
      socialAverage,
      soloAverage,
      difference:
        socialAverage === null || soloAverage === null ? null : socialAverage - soloAverage,
    },
    hasData: series.sessions.length > 0,
  };
};
