import { describe, it, expect } from "vitest";
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
  rollingMean,
  skewness,
  stdDev,
  sum,
  variance,
} from "./stats";

describe("mean / sum / min / max", () => {
  it("computes the arithmetic mean", () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
    expect(sum([1, 2, 3, 4])).toBe(10);
  });

  it("returns null on an empty series rather than NaN", () => {
    expect(mean([])).toBeNull();
    expect(min([])).toBeNull();
    expect(max([])).toBeNull();
    expect(sum([])).toBe(0);
  });

  it("handles a single point", () => {
    expect(mean([7])).toBe(7);
    expect(min([7])).toBe(7);
    expect(max([7])).toBe(7);
  });
});

describe("median", () => {
  it("averages the middle pair for an even count", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it("takes the middle value for an odd count", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it("does not depend on input order", () => {
    expect(median([4, 1, 3, 2])).toBe(median([1, 2, 3, 4]));
  });

  it("returns null when empty", () => {
    expect(median([])).toBeNull();
  });
});

describe("quantile", () => {
  // For [1..5] with the type-7 method: pos = (n-1)*q = 4q.
  it("interpolates between order statistics", () => {
    const xs = [1, 2, 3, 4, 5];
    expect(quantile(xs, 0)).toBe(1);
    expect(quantile(xs, 0.25)).toBe(2);
    expect(quantile(xs, 0.5)).toBe(3);
    expect(quantile(xs, 0.75)).toBe(4);
    expect(quantile(xs, 1)).toBe(5);
    expect(quantile(xs, 0.9)).toBeCloseTo(4.6, 10);
  });

  it("clamps out-of-range probabilities", () => {
    expect(quantile([1, 2, 3], 2)).toBe(3);
    expect(quantile([1, 2, 3], -1)).toBe(1);
  });

  it("returns the lone value for a single point", () => {
    expect(quantile([9], 0.25)).toBe(9);
  });
});

describe("quartiles", () => {
  it("reports q1/median/q3 and their spread", () => {
    const q = quartiles([1, 2, 3, 4, 5])!;
    expect(q.q1).toBe(2);
    expect(q.median).toBe(3);
    expect(q.q3).toBe(4);
    expect(q.iqr).toBe(2);
  });

  it("collapses to zero spread when all values are identical", () => {
    const q = quartiles([5, 5, 5, 5])!;
    expect(q.iqr).toBe(0);
  });
});

describe("mode", () => {
  it("finds the most frequent value", () => {
    expect(mode([1, 2, 2, 3])).toBe(2);
  });

  it("breaks ties towards the larger value for determinism", () => {
    expect(mode([1, 1, 3, 3])).toBe(3);
    expect(mode([3, 3, 1, 1])).toBe(3);
  });

  it("returns null when every value is distinct", () => {
    expect(mode([1, 2, 3])).toBeNull();
  });

  it("returns null when empty", () => {
    expect(mode([])).toBeNull();
  });
});

describe("variance / stdDev", () => {
  it("uses the sample (n-1) denominator", () => {
    // [2,4,4,4,5,5,7,9]: mean 5, sum of squared deviations 32.
    // Population variance would be 4; sample variance is 32/7.
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(32 / 7, 10);
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(Math.sqrt(32 / 7), 10);
  });

  it("returns null below two points", () => {
    expect(variance([])).toBeNull();
    expect(variance([5])).toBeNull();
    expect(stdDev([5])).toBeNull();
  });

  it("is zero when every value is identical", () => {
    expect(variance([3, 3, 3])).toBe(0);
    expect(stdDev([3, 3, 3])).toBe(0);
  });
});

describe("coefficientOfVariation", () => {
  it("expresses spread relative to the mean", () => {
    // mean 5, sample sd sqrt(32/7)
    expect(coefficientOfVariation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(
      Math.sqrt(32 / 7) / 5,
      10
    );
  });

  it("returns null when the mean is zero", () => {
    expect(coefficientOfVariation([-1, 0, 1])).toBeNull();
  });

  it("returns null below two points", () => {
    expect(coefficientOfVariation([4])).toBeNull();
  });
});

describe("skewness", () => {
  it("is zero for a symmetric series", () => {
    expect(skewness([1, 2, 3, 4, 5])).toBeCloseTo(0, 10);
  });

  it("is positive when a long right tail drags the mean up", () => {
    expect(skewness([1, 1, 1, 1, 10])!).toBeGreaterThan(0);
  });

  it("is negative for a long left tail", () => {
    expect(skewness([1, 10, 10, 10, 10])!).toBeLessThan(0);
  });

  it("returns null below three points or with no spread", () => {
    expect(skewness([1, 2])).toBeNull();
    expect(skewness([2, 2, 2])).toBeNull();
  });
});

describe("outlierBounds", () => {
  it("places Tukey fences 1.5 IQR beyond the quartiles", () => {
    const bounds = outlierBounds([1, 2, 3, 4, 5])!;
    expect(bounds.lower).toBe(2 - 1.5 * 2);
    expect(bounds.upper).toBe(4 + 1.5 * 2);
  });

  it("honours a custom multiplier", () => {
    const bounds = outlierBounds([1, 2, 3, 4, 5], 3)!;
    expect(bounds.upper).toBe(4 + 3 * 2);
  });

  it("returns null when empty", () => {
    expect(outlierBounds([])).toBeNull();
  });
});

describe("linearRegression", () => {
  it("recovers an exact line", () => {
    const fit = linearRegression([
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
    ])!;
    expect(fit.slope).toBeCloseTo(2, 10);
    expect(fit.intercept).toBeCloseTo(1, 10);
    expect(fit.r2).toBeCloseTo(1, 10);
  });

  it("finds a negative slope for a declining series", () => {
    const fit = linearRegression([
      { x: 0, y: 10 },
      { x: 1, y: 8 },
      { x: 2, y: 5 },
    ])!;
    expect(fit.slope).toBeLessThan(0);
  });

  it("reports r2 of 1 for a flat series, since a flat line explains it exactly", () => {
    const fit = linearRegression([
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
    ])!;
    expect(fit.slope).toBeCloseTo(0, 10);
    expect(fit.r2).toBe(1);
  });

  it("returns null with too few points or no spread in x", () => {
    expect(linearRegression([{ x: 1, y: 1 }])).toBeNull();
    expect(
      linearRegression([
        { x: 1, y: 1 },
        { x: 1, y: 5 },
      ])
    ).toBeNull();
  });
});

describe("pearson", () => {
  it("is 1 for a perfect positive relationship", () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 10);
  });

  it("is -1 for a perfect inverse relationship", () => {
    expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1, 10);
  });

  it("returns null for mismatched lengths, thin data, or a constant series", () => {
    expect(pearson([1, 2], [1])).toBeNull();
    expect(pearson([1], [1])).toBeNull();
    expect(pearson([1, 2, 3], [4, 4, 4])).toBeNull();
  });
});

describe("rollingMean", () => {
  it("holds back nulls until the window is full", () => {
    expect(rollingMean([1, 2, 3, 4], 3)).toEqual([null, null, 2, 3]);
  });

  it("with a window of 1 returns the series unchanged", () => {
    expect(rollingMean([1, 2, 3], 1)).toEqual([1, 2, 3]);
  });

  it("returns all nulls for a nonsensical window", () => {
    expect(rollingMean([1, 2, 3], 0)).toEqual([null, null, null]);
  });
});

describe("percentChange", () => {
  it("computes growth and decline", () => {
    expect(percentChange(150, 100)).toBeCloseTo(50, 10);
    expect(percentChange(50, 100)).toBeCloseTo(-50, 10);
  });

  it("returns null when there is no baseline to compare against", () => {
    expect(percentChange(10, 0)).toBeNull();
  });
});
