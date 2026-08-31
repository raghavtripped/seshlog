import { describe, it, expect } from "vitest";
import {
  analyseNicotineLoad,
  analyseSubstitution,
  analyseTrend,
  bucketByWeek,
  DEFAULT_MG_PER_CIG,
  DEFAULT_PUFFS_PER_CIG,
  fitExchangeRate,
  loadAtRates,
  THRESHOLDS,
  type ExchangeRates,
  type WeekBucket,
} from "./nicotineLoad";
import type { DateWindow } from "./sessionSeries";
import { Session } from "@/types/session";

const defaultType = (category: "cigs" | "vapes" | "gum") =>
  category === "cigs" ? "Regular" : category === "vapes" ? "Disposable" : "2mg";

const session = (
  isoLocal: string,
  category: "cigs" | "vapes" | "gum",
  quantity: number,
  overrides: Partial<Session> = {}
): Session => ({
  id: `${isoLocal}-${category}-${quantity}`,
  user_id: "u1",
  category,
  session_type: defaultType(category),
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

const week = (key: string, cigs: number, puffs: number, gumMg = 0): WeekBucket => ({
  key,
  label: key,
  date: new Date(`${key}T00:00:00`),
  cigs,
  puffs,
  gumMg,
});

const rates = (puffsPerCig: number, mgPerCig = DEFAULT_MG_PER_CIG): ExchangeRates => ({
  puffsPerCig,
  mgPerCig,
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

  it("counts the whole of the first week, including days before window.from", () => {
    // Window starts Wed 2026-03-04, so its week bucket begins Sun 2026-03-01.
    // Both sessions belong to that bucket and both must be counted; dropping the
    // earlier one would understate the first week and inflate any upward trend.
    const weeks = bucketByWeek(
      [
        session("2026-03-02T12:00:00", "cigs", 5),
        session("2026-03-05T12:00:00", "cigs", 5),
      ],
      windowOf("2026-03-04", "2026-03-18")
    );

    expect(weeks[0].key).toBe("2026-03-01");
    expect(weeks[0].cigs).toBe(10);
  });

  it("excludes sessions past the end of the final week", () => {
    // Window ends Wed 2026-03-18; the last bucket is the week of Sun 2026-03-15,
    // which ends Sat 2026-03-21. A session the following Monday is out of range.
    const weeks = bucketByWeek(
      [session("2026-03-23T12:00:00", "cigs", 7)],
      windowOf("2026-03-01", "2026-03-18")
    );

    expect(weeks[weeks.length - 1].cigs).toBe(0);
  });

  it("includes a session after window.to that still falls in the final week", () => {
    const weeks = bucketByWeek(
      [session("2026-03-20T12:00:00", "cigs", 7)],
      windowOf("2026-03-01", "2026-03-18")
    );

    expect(weeks[weeks.length - 1].key).toBe("2026-03-15");
    expect(weeks[weeks.length - 1].cigs).toBe(7);
  });

  it("ignores categories that are not a nicotine source", () => {
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

describe("loadAtRates", () => {
  it("converts puffs into cigarette-equivalents and adds them", () => {
    expect(loadAtRates([week("w", 2, 40)], rates(20))).toEqual([4]);
  });

  it("a higher rate makes the same puffs count for less", () => {
    expect(loadAtRates([week("w", 0, 100)], rates(50))).toEqual([2]);
  });

  it("converts gum milligrams into cigarette-equivalents too", () => {
    expect(loadAtRates([week("w", 0, 0, 8)], rates(20, 2))).toEqual([4]);
  });

  it("sums all three sources into one figure", () => {
    expect(loadAtRates([week("w", 1, 40, 6)], rates(20, 2))).toEqual([6]);
  });
});

describe("fitExchangeRate", () => {
  it("recovers the true rate from a clean substitution pattern", () => {
    // Weeks alternate: 10 cigs, then 250 puffs. A rate of 25 makes both weeks
    // equal 10 cig-equivalents, so combined load is perfectly flat there.
    const fit = fitExchangeRate(alternating(12, 10, 25))!;
    expect(fit.rates.puffsPerCig).toBeCloseTo(25, 1);
    expect(fit.cv).toBeCloseTo(0, 6);
  });

  it("leaves the gum rate at its default and unfitted when no gum is logged", () => {
    const fit = fitExchangeRate(alternating(12, 10, 25))!;
    expect(fit.fitted).toEqual({ puffsPerCig: true, mgPerCig: false });
    expect(fit.rates.mgPerCig).toBe(DEFAULT_MG_PER_CIG);
  });

  it("recovers a gum rate when cigs and gum trade off", () => {
    // Weeks alternate: 10 cigs, then 30mg of gum. 3mg per cig makes both weeks
    // equal 10 cig-equivalents.
    const weeks = Array.from({ length: 12 }, (_, i) =>
      i % 2 === 0 ? week(`w${i}`, 10, 0, 0) : week(`w${i}`, 0, 0, 30)
    );
    const fit = fitExchangeRate(weeks)!;
    expect(fit.rates.mgPerCig).toBeCloseTo(3, 1);
    expect(fit.fitted).toEqual({ puffsPerCig: false, mgPerCig: true });
    expect(fit.cv).toBeCloseTo(0, 6);
  });

  it("fits both rates at once from a three-way rotation", () => {
    // 10 cigs, then 250 puffs, then 30mg of gum, repeating: 25 puffs/cig and
    // 3mg/cig make every week 10 cig-equivalents.
    const weeks = Array.from({ length: 12 }, (_, i) =>
      i % 3 === 0
        ? week(`w${i}`, 10, 0, 0)
        : i % 3 === 1
          ? week(`w${i}`, 0, 250, 0)
          : week(`w${i}`, 0, 0, 30)
    );
    const fit = fitExchangeRate(weeks)!;
    expect(fit.rates.puffsPerCig).toBeCloseTo(25, 1);
    expect(fit.rates.mgPerCig).toBeCloseTo(3, 1);
    expect(fit.fitted).toEqual({ puffsPerCig: true, mgPerCig: true });
    expect(fit.cv).toBeCloseTo(0, 6);
  });

  it("pins gum to the default rather than fitting it from a couple of weeks", () => {
    // Two gum weeks is below the threshold: any mg rate would smooth the total
    // about as well, so the optimizer must not be handed that axis.
    const weeks = alternating(12, 10, 25);
    weeks[0].gumMg = 10;
    weeks[2].gumMg = 40;
    const fit = fitExchangeRate(weeks)!;
    expect(fit.fitted.mgPerCig).toBe(false);
    expect(fit.rates.mgPerCig).toBe(DEFAULT_MG_PER_CIG);
  });

  it("returns null when there are cigs but nothing to exchange against", () => {
    const weeks = Array.from({ length: 12 }, (_, i) => week(`w${i}`, 5 + i, 0, 0));
    expect(fitExchangeRate(weeks)).toBeNull();
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
    expect(fit.rates.puffsPerCig).toBeGreaterThanOrEqual(2);
    expect(fit.rates.puffsPerCig).toBeLessThanOrEqual(100);
  });
});

describe("analyseSubstitution", () => {
  it("reports a strong negative correlation when cigs and vapes trade off", () => {
    const result = analyseSubstitution(alternating(12, 10, 25)).cigsVapes!;
    expect(result.r).toBeLessThan(-0.9);
    expect(result.isSubstituting).toBe(true);
  });

  it("reports gum displacing cigarettes", () => {
    const weeks = Array.from({ length: 12 }, (_, i) =>
      i % 2 === 0 ? week(`w${i}`, 10, 0, 0) : week(`w${i}`, 0, 0, 30)
    );
    const result = analyseSubstitution(weeks).cigsGum!;
    expect(result.r).toBeLessThan(-0.9);
    expect(result.isSubstituting).toBe(true);
  });

  it("reports a positive correlation when both rise together", () => {
    const weeks = Array.from({ length: 12 }, (_, i) => week(`w${i}`, i, i * 20));
    const result = analyseSubstitution(weeks).cigsVapes!;
    expect(result.r).toBeGreaterThan(0.9);
    expect(result.isSubstituting).toBe(false);
  });

  it("returns null per pairing with too few weeks or a constant series", () => {
    expect(analyseSubstitution(alternating(4, 10, 25)).cigsVapes).toBeNull();
    const flat = Array.from({ length: 12 }, (_, i) => week(`w${i}`, 5, 100));
    expect(analyseSubstitution(flat).cigsVapes).toBeNull();
    // No gum logged at all, so that pairing has nothing to correlate.
    expect(analyseSubstitution(alternating(12, 10, 25)).cigsGum).toBeNull();
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
    expect(analysis.rateSource.puffsPerCig).toBe("fitted");
    expect(analysis.rates.puffsPerCig).toBeCloseTo(25, 1);
    expect(analysis.hasData).toBe(true);
  });

  it("leaves the gum rate on its default when no gum is logged", () => {
    const analysis = analyseNicotineLoad(sessions, win);
    expect(analysis.rateSource.mgPerCig).toBe("default");
    expect(analysis.rates.mgPerCig).toBe(DEFAULT_MG_PER_CIG);
    expect(analysis.hasGum).toBe(false);
  });

  it("honours an explicit override", () => {
    const analysis = analyseNicotineLoad(sessions, win, { puffsPerCig: 50 });
    expect(analysis.rates.puffsPerCig).toBe(50);
    expect(analysis.rateSource.puffsPerCig).toBe("override");
    // Same puffs, double the rate, so vape weeks contribute half as much.
    expect(Math.max(...analysis.load)).toBeCloseTo(10, 6);
  });

  it("overrides one rate without disturbing the other", () => {
    const analysis = analyseNicotineLoad(sessions, win, { mgPerCig: 4 });
    expect(analysis.rates.mgPerCig).toBe(4);
    expect(analysis.rateSource.mgPerCig).toBe("override");
    expect(analysis.rateSource.puffsPerCig).toBe("fitted");
    expect(analysis.rates.puffsPerCig).toBeCloseTo(25, 1);
  });

  it("falls back to the default rate when it cannot fit one", () => {
    const analysis = analyseNicotineLoad(
      [session("2026-01-06T12:00:00", "cigs", 5)],
      windowOf("2026-01-04", "2026-03-22")
    );
    expect(analysis.rateSource.puffsPerCig).toBe("default");
    expect(analysis.rates.puffsPerCig).toBe(DEFAULT_PUFFS_PER_CIG);
  });

  it("flattens combined load even though each series swings wildly", () => {
    const analysis = analyseNicotineLoad(sessions, win);
    expect(analysis.load.every((x) => Math.abs(x - 10) < 1e-6)).toBe(true);
    expect(analysis.substitution.cigsVapes!.isSubstituting).toBe(true);
  });

  it("reports cig share as 1 in cig weeks, 0 in vape weeks", () => {
    const analysis = analyseNicotineLoad(sessions, win);
    expect(analysis.cigShare[0]).toBeCloseTo(1, 6);
    expect(analysis.cigShare[1]).toBeCloseTo(0, 6);
  });

  it("produces a safe empty result with no sessions", () => {
    const analysis = analyseNicotineLoad([], win);
    expect(analysis.hasData).toBe(false);
    expect(analysis.hasGum).toBe(false);
    expect(analysis.totalLoad).toBe(0);
    expect(analysis.fit).toBeNull();
    expect(analysis.substitution.cigsVapes).toBeNull();
    expect(analysis.substitution.cigsGum).toBeNull();
  });

  it("reads gum strength off the session type", () => {
    // Four 4mg pieces is 16mg, which at the default 2mg/cig is 8 cig-equivalents.
    const analysis = analyseNicotineLoad(
      [session("2026-01-06T12:00:00", "gum", 4, { session_type: "4mg" })],
      windowOf("2026-01-04", "2026-01-10")
    );
    expect(analysis.weeks[0].gumMg).toBe(16);
    expect(analysis.load[0]).toBeCloseTo(8, 6);
    expect(analysis.hasGum).toBe(true);
  });

  it("shows total load falling as gum replaces cigarettes", () => {
    // A taper: cigs fall by one a week while gum rises by less than the
    // equivalent, so each series alone tells only half the story.
    const taper: Session[] = [];
    for (let i = 0; i < 12; i++) {
      const day = new Date(2026, 0, 4 + i * 7, 12, 0, 0);
      const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(
        day.getDate()
      ).padStart(2, "0")}T12:00:00`;
      taper.push(session(iso, "cigs", 20 - i));
      taper.push(session(`${iso.slice(0, 11)}18:00:00`, "gum", i));
    }
    const analysis = analyseNicotineLoad(taper, windowOf("2026-01-04", "2026-03-22"), {
      puffsPerCig: DEFAULT_PUFFS_PER_CIG,
      mgPerCig: DEFAULT_MG_PER_CIG,
    });
    // Week i is (20 - i) cigs + i pieces x 2mg / 2mg-per-cig = 20, so the naive
    // reading is "no progress" — the load is genuinely flat, and the page should
    // say so rather than let the falling cig count imply success.
    expect(analysis.trend!.direction).toBe("flat");
    expect(analysis.substitution.cigsGum!.isSubstituting).toBe(true);
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
    const analysis = analyseNicotineLoad(rising, windowOf("2026-01-04", "2026-04-19"), {
      puffsPerCig: 25,
    });
    expect(analysis.trend!.direction).toBe("up");
    expect(analysis.trend!.lateMean).toBeGreaterThan(analysis.trend!.earlyMean);
  });
});
