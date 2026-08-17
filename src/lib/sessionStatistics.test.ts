import { describe as suite, it, expect } from "vitest";
import {
  computeSessionStatistics,
  consistencyBand,
  describe,
  THRESHOLDS,
} from "./sessionStatistics";
import type { DateWindow } from "./sessionSeries";
import { Session } from "@/types/session";

const session = (
  isoLocal: string,
  overrides: Partial<Session> = {}
): Session => ({
  id: isoLocal,
  user_id: "u1",
  category: "weed",
  session_type: "Joint",
  quantity: 1,
  participant_count: 1,
  is_social: false,
  notes: null,
  rating: null,
  session_date: isoLocal,
  created_at: isoLocal,
  updated_at: isoLocal,
  ...overrides,
});

const windowOf = (from: string, to: string): DateWindow => ({
  from: new Date(`${from}T00:00:00`),
  to: new Date(`${to}T00:00:00`),
});

/** One session a day, every day, from 2026-03-01 for `days` days. */
const dailySessions = (days: number, quantityAt: (i: number) => number) =>
  Array.from({ length: days }, (_, i) => {
    const date = new Date(2026, 2, 1 + i, 12, 0, 0);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}T12:00:00`;
    return session(iso, { quantity: quantityAt(i) });
  });

suite("describe", () => {
  it("reports the full descriptive set for a known series", () => {
    const d = describe([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(d.n).toBe(8);
    expect(d.sum).toBe(40);
    expect(d.mean).toBe(5);
    expect(d.median).toBe(4.5);
    expect(d.mode).toBe(4);
    expect(d.min).toBe(2);
    expect(d.max).toBe(9);
    expect(d.stdDev).toBeCloseTo(Math.sqrt(32 / 7), 10);
  });

  it("degrades to nulls rather than NaN on an empty series", () => {
    const d = describe([]);
    expect(d.n).toBe(0);
    expect(d.sum).toBe(0);
    expect(d.mean).toBeNull();
    expect(d.stdDev).toBeNull();
    expect(d.skew).toBeNull();
  });

  it("withholds skew below the minimum sample size", () => {
    expect(describe([1, 2]).skew).toBeNull();
    expect(describe([1, 2, 5]).skew).not.toBeNull();
  });
});

suite("consistencyBand", () => {
  it("labels the coefficient of variation in plain language", () => {
    expect(consistencyBand(0.1)).toBe("steady");
    expect(consistencyBand(0.45)).toBe("variable");
    expect(consistencyBand(0.9)).toBe("spiky");
  });

  it("puts the boundaries in the lower band", () => {
    expect(consistencyBand(0.3)).toBe("variable");
    expect(consistencyBand(0.6)).toBe("spiky");
  });
});

suite("computeSessionStatistics", () => {
  it("compares the window against the equally long window before it", () => {
    const stats = computeSessionStatistics(
      [
        // Previous window: 2026-03-01..03-10
        session("2026-03-02T12:00:00", { quantity: 2 }),
        // Current window: 2026-03-11..03-20
        session("2026-03-12T12:00:00", { quantity: 3 }),
        session("2026-03-13T12:00:00", { quantity: 3 }),
      ],
      windowOf("2026-03-11", "2026-03-20")
    );

    expect(stats.summary.total).toBe(6);
    expect(stats.previousSummary.total).toBe(2);
    expect(stats.comparison.total.change).toBeCloseTo(200, 10);
    expect(stats.comparison.sessionCount.current).toBe(2);
    expect(stats.comparison.sessionCount.previous).toBe(1);
  });

  it("returns a null percent change when the previous period was empty", () => {
    const stats = computeSessionStatistics(
      [session("2026-03-12T12:00:00")],
      windowOf("2026-03-11", "2026-03-20")
    );
    expect(stats.comparison.total.change).toBeNull();
  });

  it("detects a rising trend and expresses the slope per week", () => {
    // 28 days climbing by 0.1g/day => +0.7g per day, per week.
    const stats = computeSessionStatistics(
      dailySessions(28, (i) => 1 + i * 0.1),
      windowOf("2026-03-01", "2026-03-28")
    );

    expect(stats.trend).not.toBeNull();
    expect(stats.trend!.direction).toBe("up");
    expect(stats.trend!.slopePerWeek).toBeCloseTo(0.7, 6);
    expect(stats.trend!.r2).toBeCloseTo(1, 6);
  });

  it("detects a falling trend", () => {
    const stats = computeSessionStatistics(
      dailySessions(28, (i) => 5 - i * 0.1),
      windowOf("2026-03-01", "2026-03-28")
    );
    expect(stats.trend!.direction).toBe("down");
    expect(stats.trend!.slopePerWeek).toBeLessThan(0);
  });

  it("calls a level series flat", () => {
    const stats = computeSessionStatistics(
      dailySessions(28, () => 2),
      windowOf("2026-03-01", "2026-03-28")
    );
    expect(stats.trend!.direction).toBe("flat");
  });

  it("withholds the trend when the window is too short", () => {
    const stats = computeSessionStatistics(
      dailySessions(10, () => 2),
      windowOf("2026-03-01", "2026-03-10")
    );
    expect(stats.trend).toBeNull();
  });

  it("withholds the trend when there are too few sessions", () => {
    const stats = computeSessionStatistics(
      [session("2026-03-02T12:00:00"), session("2026-03-05T12:00:00")],
      windowOf("2026-03-01", "2026-03-28")
    );
    expect(stats.trend).toBeNull();
  });

  it("flags heavy sessions past the upper Tukey fence", () => {
    const sessions = [
      ...dailySessions(9, () => 1),
      session("2026-03-11T12:00:00", { quantity: 20 }),
    ];
    const stats = computeSessionStatistics(sessions, windowOf("2026-03-01", "2026-03-28"));

    expect(stats.outliers).not.toBeNull();
    expect(stats.outliers).toHaveLength(1);
    expect(stats.outliers![0].dose).toBe(20);
  });

  it("withholds outlier detection below the minimum sample size", () => {
    const stats = computeSessionStatistics(
      dailySessions(THRESHOLDS.outliers - 1, () => 1),
      windowOf("2026-03-01", "2026-03-28")
    );
    expect(stats.outliers).toBeNull();
  });

  it("returns an empty outlier list when the data is uniform", () => {
    const stats = computeSessionStatistics(
      dailySessions(10, () => 1),
      windowOf("2026-03-01", "2026-03-28")
    );
    expect(stats.outliers).toEqual([]);
  });

  it("summarises gaps between sessions", () => {
    const stats = computeSessionStatistics(
      [
        session("2026-03-01T10:00:00"),
        session("2026-03-01T16:00:00"),
        session("2026-03-03T16:00:00"),
      ],
      windowOf("2026-03-01", "2026-03-10")
    );

    expect(stats.gaps.medianHours).toBe(27);
    expect(stats.gaps.longestHours).toBe(48);
  });

  it("reports null gap stats for a single session", () => {
    const stats = computeSessionStatistics(
      [session("2026-03-01T10:00:00")],
      windowOf("2026-03-01", "2026-03-10")
    );
    expect(stats.gaps.medianHours).toBeNull();
    expect(stats.gaps.longestHours).toBeNull();
  });

  it("correlates dose against rating once enough sessions are rated", () => {
    const sessions = Array.from({ length: 6 }, (_, i) =>
      session(`2026-03-0${i + 1}T12:00:00`, { quantity: i + 1, rating: i + 1 })
    );
    const stats = computeSessionStatistics(sessions, windowOf("2026-03-01", "2026-03-10"));

    expect(stats.ratingCorrelation).toBeCloseTo(1, 10);
    expect(stats.averageRating).toBeCloseTo(3.5, 10);
  });

  it("withholds the rating correlation when too few sessions carry a rating", () => {
    const stats = computeSessionStatistics(
      [
        session("2026-03-01T12:00:00", { rating: 4 }),
        session("2026-03-02T12:00:00", { rating: 5 }),
      ],
      windowOf("2026-03-01", "2026-03-10")
    );
    expect(stats.ratingCorrelation).toBeNull();
  });

  it("compares social against solo doses", () => {
    const stats = computeSessionStatistics(
      [
        session("2026-03-01T12:00:00", { quantity: 6, participant_count: 2 }),
        session("2026-03-02T12:00:00", { quantity: 1 }),
      ],
      windowOf("2026-03-01", "2026-03-10")
    );

    expect(stats.social.socialAverage).toBe(3);
    expect(stats.social.soloAverage).toBe(1);
    expect(stats.social.difference).toBe(2);
  });

  it("reports a null social difference when one side has no sessions", () => {
    const stats = computeSessionStatistics(
      [session("2026-03-01T12:00:00")],
      windowOf("2026-03-01", "2026-03-10")
    );
    expect(stats.social.socialAverage).toBeNull();
    expect(stats.social.difference).toBeNull();
  });

  it("produces a safe, empty bundle when there is nothing logged", () => {
    const stats = computeSessionStatistics([], windowOf("2026-03-01", "2026-03-10"));

    expect(stats.hasData).toBe(false);
    expect(stats.summary.total).toBe(0);
    expect(stats.perSession.mean).toBeNull();
    expect(stats.perDay.mean).toBe(0);
    expect(stats.trend).toBeNull();
    expect(stats.outliers).toBeNull();
    expect(stats.streaks.longestActive).toBe(0);
  });
});
