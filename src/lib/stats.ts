// Pure descriptive-statistics helpers. No domain knowledge, no React, no dates —
// everything here takes plain numbers so it can be unit-tested in isolation.
//
// Every function returns `null` rather than NaN when there isn't enough data to
// answer honestly (e.g. a standard deviation needs at least two points). Callers
// render a dash for null instead of printing noise.

export const sum = (xs: number[]): number => xs.reduce((acc, x) => acc + x, 0);

export const mean = (xs: number[]): number | null =>
  xs.length === 0 ? null : sum(xs) / xs.length;

export const min = (xs: number[]): number | null =>
  xs.length === 0 ? null : Math.min(...xs);

export const max = (xs: number[]): number | null =>
  xs.length === 0 ? null : Math.max(...xs);

export const median = (xs: number[]): number | null => quantile(xs, 0.5);

/**
 * Quantile via linear interpolation between order statistics (the method R
 * calls type 7, and the one most people mean by "the 90th percentile").
 */
export const quantile = (xs: number[], q: number): number | null => {
  if (xs.length === 0) return null;
  if (xs.length === 1) return xs[0];

  const sorted = [...xs].sort((a, b) => a - b);
  const clamped = Math.min(1, Math.max(0, q));
  const pos = (sorted.length - 1) * clamped;
  const lower = Math.floor(pos);
  const upper = Math.ceil(pos);

  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (pos - lower);
};

export interface Quartiles {
  q1: number;
  median: number;
  q3: number;
  iqr: number;
}

export const quartiles = (xs: number[]): Quartiles | null => {
  if (xs.length === 0) return null;
  const q1 = quantile(xs, 0.25)!;
  const q2 = quantile(xs, 0.5)!;
  const q3 = quantile(xs, 0.75)!;
  return { q1, median: q2, q3, iqr: q3 - q1 };
};

/**
 * Most frequent value. Ties break towards the larger value so the result is
 * deterministic regardless of input order. Returns null when every value is
 * distinct — a "mode" where everything appears once tells you nothing.
 */
export const mode = (xs: number[]): number | null => {
  if (xs.length === 0) return null;

  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);

  let best: number | null = null;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount || (count === bestCount && best !== null && value > best)) {
      best = value;
      bestCount = count;
    }
  }

  return bestCount > 1 ? best : null;
};

/** Sample variance (Bessel-corrected, n − 1). Needs at least two points. */
export const variance = (xs: number[]): number | null => {
  if (xs.length < 2) return null;
  const mu = mean(xs)!;
  const ss = xs.reduce((acc, x) => acc + (x - mu) ** 2, 0);
  return ss / (xs.length - 1);
};

export const stdDev = (xs: number[]): number | null => {
  const v = variance(xs);
  return v === null ? null : Math.sqrt(v);
};

/**
 * Coefficient of variation: standard deviation as a fraction of the mean, which
 * makes spread comparable across units and across people. Undefined when the
 * mean is zero or negative, which for consumption data means "no data to speak of".
 */
export const coefficientOfVariation = (xs: number[]): number | null => {
  const mu = mean(xs);
  const sd = stdDev(xs);
  if (mu === null || sd === null || mu <= 0) return null;
  return sd / mu;
};

/**
 * Sample skewness (G1, the adjusted Fisher–Pearson estimator used by Excel and
 * most stats packages). Positive means a long right tail: a few unusually heavy
 * sessions dragging the average above the typical one. Needs n ≥ 3.
 */
export const skewness = (xs: number[]): number | null => {
  const n = xs.length;
  if (n < 3) return null;
  const sd = stdDev(xs);
  if (sd === null || sd === 0) return null;
  const mu = mean(xs)!;
  const cubed = xs.reduce((acc, x) => acc + ((x - mu) / sd) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * cubed;
};

export interface OutlierBounds {
  lower: number;
  upper: number;
}

/**
 * Tukey fences. Points above `upper` are the heavy outlier sessions we surface;
 * `lower` is included for completeness but is rarely interesting for consumption.
 */
export const outlierBounds = (xs: number[], multiplier = 1.5): OutlierBounds | null => {
  const q = quartiles(xs);
  if (q === null) return null;
  return { lower: q.q1 - multiplier * q.iqr, upper: q.q3 + multiplier * q.iqr };
};

export interface Regression {
  slope: number;
  intercept: number;
  /** Coefficient of determination: how much of the variation the line explains. */
  r2: number;
}

/**
 * Ordinary least-squares fit of y on x. Returns null when there are fewer than
 * two points or when every x is identical (a vertical line has no slope).
 */
export const linearRegression = (
  points: { x: number; y: number }[]
): Regression | null => {
  const n = points.length;
  if (n < 2) return null;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const meanX = mean(xs)!;
  const meanY = mean(ys)!;

  let sxx = 0;
  let sxy = 0;
  for (const { x, y } of points) {
    sxx += (x - meanX) ** 2;
    sxy += (x - meanX) * (y - meanY);
  }
  if (sxx === 0) return null;

  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;

  const ssTot = ys.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
  const ssRes = points.reduce(
    (acc, { x, y }) => acc + (y - (slope * x + intercept)) ** 2,
    0
  );
  // A perfectly flat y series is explained exactly by a flat line.
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
};

/**
 * Pearson correlation coefficient. Null when the series differ in length, are
 * shorter than two points, or either one is constant.
 */
export const pearson = (xs: number[], ys: number[]): number | null => {
  if (xs.length !== ys.length || xs.length < 2) return null;

  const meanX = mean(xs)!;
  const meanY = mean(ys)!;

  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return null;

  return sxy / Math.sqrt(sxx * syy);
};

/**
 * Trailing rolling mean. Entries before the window is full are null so charts
 * don't draw a misleading ramp-up at the left edge.
 */
export const rollingMean = (xs: number[], window: number): (number | null)[] => {
  if (window < 1) return xs.map(() => null);
  return xs.map((_, i) =>
    i + 1 < window ? null : mean(xs.slice(i + 1 - window, i + 1))
  );
};

/** Percentage change from `previous` to `current`. Null when there's no base to compare against. */
export const percentChange = (current: number, previous: number): number | null =>
  previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
