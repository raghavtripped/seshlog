import { describe, it, expect } from "vitest";
import {
  analyseNicotineLoad,
  analyseSubstitution,
  analyseTrend,
  bucketByWeek,
  DEFAULT_PUFFS_PER_CIG,
  fitExchangeRate,
  loadAtRate,
  THRESHOLDS,
  type WeekBucket,
} from "./nicotineLoad";
import type { DateWindow } from "./sessionSeries";
import { Session } from "@/types/session";

const session = (
  isoLocal: string,
  category: "cigs" | "vapes",
  quantity: number,
  overrides: Partial<Session> = {}
): Session => ({
  id: `${isoLocal}-${category}-${quantity}`,
  user_id: "u1",
  category,
  session_type: category === "cigs" ? "Regular" : "Disposable",
  quantity,
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

const week = (key: string, cigs: number, puffs: number): WeekBucket => ({
  key,
  label: key,
  date: new Date(`${key}T00:00:00`),
  cigs,
  puffs,
});

/** n weeks alternating between pure-cig and pure-vape at a fixed exchange rate. */
const alternating = (n: number, cigsPerWeek: number, rate: number): WeekBucket[] =>
  Array.from({ length: n }, (_, i) =>
    i % 2 === 0
      ? week(`w${i}`, cigsPerWeek, 0)
      : week(`w${i}`, 0, cigsPerWeek * rate)
  );

describe("bucketByWeek", () => {
  it("splits the two categories into separate columns of the same week", () => {
    // 2026-03-02 is a Monday; startOfWeek defaults to Sunday 2026-03-01.
    const weeks = bucketByWeek(
      [
        session("2026-03-02T12:00:00", "cigs", 3),
        session("2026-03-04T12:00:00", "vapes", 200),
      ],
      windowOf("2026-03-01", "2026-03-07")
    );

    expect(weeks).toHaveLength(1);
    expect(weeks[0].cigs).toBe(3);
    expect(weeks[0].puffs).toBe(200);
  });

  it("zero-fills weeks with nothing logged", () => {
    const weeks = bucketByWeek(
      [session("2026-03-02T12:00:00", "cigs", 3)],
      windowOf("2026-03-01", "2026-03-21")
    );

    expect(weeks).toHaveLength(3);
    expect(weeks.map((w) => w.cigs)).toEqual([3, 0, 0]);
    expect(weeks.map((w) => w.puffs)).toEqual([0, 0, 0]);
  });

  it("divides shared sessions by participant count", () => {
    const weeks = bucketByWeek(
      [session("2026-03-02T12:00:00", "cigs", 4, { participant_count: 4 })],
      windowOf("2026-03-01", "2026-03-07")
    );
    expect(weeks[0].cigs).toBe(1);
  });

  it("ignores categories that are not cigs or vapes", () => {
    const weeks = bucketByWeek(
      [
        { ...session("2026-03-02T12:00:00", "cigs", 3), category: "weed" } as Session,
        session("2026-03-02T12:00:00", "cigs", 2),
      ],
      windowOf("2026-03-01", "2026-03-07")
    );
    expect(weeks[0].cigs).toBe(2);
  });
});

describe("loadAtRate", () => {
  it("converts puffs into cigarette-equivalents and adds them", () => {
    expect(loadAtRate([week("w", 2, 40)], 20)).toEqual([4]);
  });

  it("a higher rate makes the same puffs count for less", () => {
    expect(loadAtRate([week("w", 0, 100)], 50)).toEqual([2]);
  });
});

describe("fitExchangeRate", () => {
  it("recovers the true rate from a clean substitution pattern", () => {
    // Weeks alternate: 10 cigs, then 250 puffs. A rate of 25 makes both weeks
    // equal 10 cig-equivalents, so combined load is perfectly flat there.
    const fit = fitExchangeRate(alternating(12, 10, 25))!;
    expect(fit.rate).toBeCloseTo(25, 1);
    expect(fit.cv).toBeCloseTo(0, 6);
  });

  it("shows that combining beats either series alone", () => {
    const fit = fitExchangeRate(alternating(12, 10, 25))!;
    expect(fit.cv).toBeLessThan(fit.cvCigsAlone!);
    expect(fit.cv).toBeLessThan(fit.cvPuffsAlone!);
  });

  it("returns null with too few weeks", () => {
    expect(fitExchangeRate(alternating(THRESHOLDS.fitWeeks - 1, 10, 25))).toBeNull();
  });

  it("returns null when one series barely appears, since any rate would fit", () => {
    const weeks = Array.from({ length: 12 }, (_, i) => week(`w${i}`, 5, 0));
    weeks[0].puffs = 100;
    expect(fitExchangeRate(weeks)).toBeNull();
  });

  it("keeps the fitted rate inside the searched range", () => {
    const fit = fitExchangeRate(alternating(12, 10, 25))!;
    expect(fit.rate).toBeGreaterThanOrEqual(2);
    expect(fit.rate).toBeLessThanOrEqual(100);
  });
});

describe("analyseSubstitution", () => {
  it("reports a strong negative correlation when the two trade off", () => {
    const result = analyseSubstitution(alternating(12, 10, 25))!;
    expect(result.r).toBeLessThan(-0.9);
    expect(result.isSubstituting).toBe(true);
  });

  it("reports a positive correlation when both rise together", () => {
    const weeks = Array.from({ length: 12 }, (_, i) => week(`w${i}`, i, i * 20));
    const result = analyseSubstitution(weeks)!;
    expect(result.r).toBeGreaterThan(0.9);
    expect(result.isSubstituting).toBe(false);
  });

  it("returns null with too few weeks or a constant series", () => {
    expect(analyseSubstitution(alternating(4, 10, 25))).toBeNull();
    const flat = Array.from({ length: 12 }, (_, i) => week(`w${i}`, 5, 100));
    expect(analyseSubstitution(flat)).toBeNull();
  });
});

describe("analyseTrend", () => {
  it("detects a rising load and compares the ends of the window", () => {
    const trend = analyseTrend([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])!;
    expect(trend.direction).toBe("up");
    expect(trend.slopePerWeek).toBeCloseTo(1, 6);
    expect(trend.lateMean).toBeGreaterThan(trend.earlyMean);
  });

  it("detects a falling load", () => {
    const trend = analyseTrend([20, 19, 18, 17, 16, 15, 14, 13, 12, 11])!;
    expect(trend.direction).toBe("down");
  });

  it("calls a level series flat", () => {
    expect(analyseTrend(Array(12).fill(15))!.direction).toBe("flat");
  });

  it("returns null below the minimum number of weeks", () => {
    expect(analyseTrend([1, 2, 3])).toBeNull();
  });
});

describe("analyseNicotineLoad", () => {
  // 12 weeks from 2026-01-04 (a Sunday), alternating cig-only and vape-only weeks.
  const sessions: Session[] = [];
  for (let i = 0; i < 12; i++) {
    const day = new Date(2026, 0, 4 + i * 7, 12, 0, 0);
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(
      day.getDate()
    ).padStart(2, "0")}T12:00:00`;
    sessions.push(
      i % 2 === 0 ? session(iso, "cigs", 10) : session(iso, "vapes", 250)
    );
  }
  const win = windowOf("2026-01-04", "2026-03-22");

  it("fits a rate from the data and reports where it came from", () => {
    const analysis = analyseNicotineLoad(sessions, win);
    expect(analysis.rateSource).toBe("fitted");
    expect(analysis.rate).toBeCloseTo(25, 1);
    expect(analysis.hasData).toBe(true);
  });

  it("honours an explicit override", () => {
    const analysis = analyseNicotineLoad(sessions, win, 50);
    expect(analysis.rate).toBe(50);
    expect(analysis.rateSource).toBe("override");
    // Same puffs, double the rate, so vape weeks contribute half as much.
    expect(Math.max(...analysis.load)).toBeCloseTo(10, 6);
  });

  it("falls back to the default rate when it cannot fit one", () => {
    const analysis = analyseNicotineLoad(
      [session("2026-01-06T12:00:00", "cigs", 5)],
      windowOf("2026-01-04", "2026-03-22")
    );
    expect(analysis.rateSource).toBe("default");
    expect(analysis.rate).toBe(DEFAULT_PUFFS_PER_CIG);
  });

  it("flattens combined load even though each series swings wildly", () => {
    const analysis = analyseNicotineLoad(sessions, win);
    expect(analysis.load.every((x) => Math.abs(x - 10) < 1e-6)).toBe(true);
    expect(analysis.substitution!.isSubstituting).toBe(true);
  });

  it("reports cig share as 1 in cig weeks, 0 in vape weeks", () => {
    const analysis = analyseNicotineLoad(sessions, win);
    expect(analysis.cigShare[0]).toBeCloseTo(1, 6);
    expect(analysis.cigShare[1]).toBeCloseTo(0, 6);
  });

  it("produces a safe empty result with no sessions", () => {
    const analysis = analyseNicotineLoad([], win);
    expect(analysis.hasData).toBe(false);
    expect(analysis.totalLoad).toBe(0);
    expect(analysis.fit).toBeNull();
    expect(analysis.substitution).toBeNull();
  });

  it("surfaces a rising total even when neither series trends on its own", () => {
    // Cigs and vapes alternate, but each cycle is larger than the last: the
    // individual series look like noise, the combined one climbs.
    const rising: Session[] = [];
    for (let i = 0; i < 16; i++) {
      const day = new Date(2026, 0, 4 + i * 7, 12, 0, 0);
      const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(
        day.getDate()
      ).padStart(2, "0")}T12:00:00`;
      const size = 5 + i;
      rising.push(
        i % 2 === 0 ? session(iso, "cigs", size) : session(iso, "vapes", size * 25)
      );
    }
    const analysis = analyseNicotineLoad(rising, windowOf("2026-01-04", "2026-04-19"), 25);
    expect(analysis.trend!.direction).toBe("up");
    expect(analysis.trend!.lateMean).toBeGreaterThan(analysis.trend!.earlyMean);
  });
});
