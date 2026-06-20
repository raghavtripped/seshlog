import { describe, it, expect } from "vitest";
import {
  netNative,
  netBase,
  bbWon,
  bbPer100,
  durationHours,
  perHour,
  roi,
  totalBuyIn,
  sessionDurationMinutes,
  stakeKey,
  normalizeVenue,
  applyFilter,
  isCompleted,
  aggregate,
  groupBy,
  cumulativeProfitSeries,
  bucketByReflection,
} from "./metrics";
import type { SessionWithStats } from "./types";

// Helper to build a stats-view row with sensible defaults.
function s(partial: Partial<SessionWithStats>): SessionWithStats {
  return {
    id: "id",
    user_id: "u",
    venue: null,
    session_type: null,
    game_type: null,
    currency: "INR",
    fx_rate_to_base: 1,
    small_blind: 1,
    big_blind: 2,
    ante: null,
    straddle: null,
    max_buyin: null,
    cash_out: null,
    est_hands: null,
    started_at: "2026-05-01T18:00:00.000Z",
    ended_at: null,
    mood: null,
    focus: null,
    sleep_hours: null,
    tilt: null,
    notes: null,
    created_at: "2026-05-01T18:00:00.000Z",
    total_buyin_native: 0,
    net_native: null,
    net_base: null,
    duration_minutes: null,
    bb_won: null,
    ...partial,
  } as SessionWithStats;
}

describe("per-session primitives", () => {
  it("netNative = cashOut - totalBuyIn", () => {
    expect(netNative(200, 120)).toBe(80);
    expect(netNative(50, 120)).toBe(-70);
  });

  it("netBase applies the fx rate", () => {
    expect(netBase(2, 83)).toBe(166); // 2 USD net * 83 = 166 INR
    expect(netBase(80, 1)).toBe(80);
  });

  it("bbWon divides by big blind, guards zero", () => {
    expect(bbWon(120, 2)).toBe(60);
    expect(bbWon(-10, 2)).toBe(-5);
    expect(bbWon(120, 0)).toBeNull();
  });

  it("bbPer100 scales per 100 hands, guards zero", () => {
    expect(bbPer100(60, 300)).toBe(20); // 60bb / 300 hands * 100
    expect(bbPer100(60, 0)).toBeNull();
  });

  it("durationHours converts minutes", () => {
    expect(durationHours(90)).toBe(1.5);
  });

  it("perHour guards zero hours", () => {
    expect(perHour(150, 3)).toBe(50);
    expect(perHour(150, 0)).toBeNull();
  });

  it("roi guards zero buy-in", () => {
    expect(roi(80, 120)).toBeCloseTo(0.6667, 4);
    expect(roi(80, 0)).toBeNull();
  });

  it("totalBuyIn sums amounts", () => {
    expect(totalBuyIn([{ amount: 100 }, { amount: 50 }, { amount: 25 }])).toBe(175);
    expect(totalBuyIn([])).toBe(0);
  });

  it("sessionDurationMinutes handles incomplete sessions", () => {
    expect(
      sessionDurationMinutes("2026-05-01T18:00:00Z", "2026-05-01T18:30:00Z")
    ).toBe(30);
    expect(sessionDurationMinutes("2026-05-01T18:00:00Z", null)).toBeNull();
  });

  it("stakeKey formats SB/BB", () => {
    expect(stakeKey({ small_blind: 1, big_blind: 2 })).toBe("1/2");
  });

  it("normalizeVenue trims, collapses inner whitespace, and nulls out blanks", () => {
    expect(normalizeVenue("Stake")).toBe("Stake");
    expect(normalizeVenue("  Stake ")).toBe("Stake");
    expect(normalizeVenue("Rahul's  place")).toBe("Rahul's place");
    expect(normalizeVenue("")).toBeNull();
    expect(normalizeVenue("   ")).toBeNull();
    expect(normalizeVenue(null)).toBeNull();
    expect(normalizeVenue(undefined)).toBeNull();
  });
});

describe("filtering", () => {
  const sessions = [
    s({ id: "a", venue: "Stake", session_type: "online", currency: "USD", started_at: "2026-05-01T10:00:00Z" }),
    s({ id: "b", venue: "Rahul's", session_type: "home", currency: "INR", started_at: "2026-05-10T10:00:00Z" }),
    s({ id: "c", venue: "Stake", session_type: "online", currency: "USD", started_at: "2026-05-20T10:00:00Z" }),
  ];

  it("filters by venue", () => {
    expect(applyFilter(sessions, { venue: "Stake" }).map((x) => x.id)).toEqual(["a", "c"]);
  });

  it("filters by session type", () => {
    expect(applyFilter(sessions, { sessionType: "home" }).map((x) => x.id)).toEqual(["b"]);
  });

  it("filters by date range inclusive", () => {
    const out = applyFilter(sessions, { from: "2026-05-05", to: "2026-05-15" });
    expect(out.map((x) => x.id)).toEqual(["b"]);
  });

  it("'all' sentinels are no-ops", () => {
    expect(applyFilter(sessions, { venue: "all", sessionType: "all" })).toHaveLength(3);
  });

  it("matches venue regardless of case and surrounding whitespace", () => {
    const dirty = [
      s({ id: "a", venue: "Stake" }),
      s({ id: "b", venue: "stake " }),
      s({ id: "c", venue: " STAKE" }),
      s({ id: "d", venue: "Rahul's" }),
    ];
    expect(applyFilter(dirty, { venue: "Stake" }).map((x) => x.id)).toEqual(["a", "b", "c"]);
  });
});

describe("isCompleted", () => {
  it("is true only when net_base is present", () => {
    expect(isCompleted(s({ net_base: 100 }))).toBe(true);
    expect(isCompleted(s({ net_base: null }))).toBe(false);
  });
});

describe("aggregate", () => {
  it("sums net, hours, hands and finds extremes; mixes currencies via net_base", () => {
    const sessions = [
      // USD session: +2 USD net = +166 base, 30 min, 40 hands, +60 bb
      s({ net_base: 166, net_native: 2, duration_minutes: 30, est_hands: 40, bb_won: 60 }),
      // INR session: -500 base, 120 min, 200 hands, -250 bb
      s({ net_base: -500, net_native: -500, duration_minutes: 120, est_hands: 200, bb_won: -250 }),
      // live session (no result) should be ignored for money but counted in sessionCount
      s({ net_base: null }),
    ];
    const stats = aggregate(sessions);
    expect(stats.netBase).toBe(-334);
    expect(stats.hours).toBeCloseTo(2.5, 5);
    expect(stats.totalHands).toBe(240);
    expect(stats.sessionCount).toBe(3);
    expect(stats.biggestWin).toBe(166);
    expect(stats.biggestLoss).toBe(-500);
    // bbPer100 = (60 - 250) / 240 * 100
    expect(stats.bbPer100).toBeCloseTo((-190 / 240) * 100, 5);
    // perHour = -334 / 2.5
    expect(stats.perHour).toBeCloseTo(-133.6, 5);
  });

  it("excludes sessions missing est_hands from bbPer100 only", () => {
    const sessions = [
      s({ net_base: 100, duration_minutes: 60, est_hands: 100, bb_won: 50 }),
      s({ net_base: 100, duration_minutes: 60, est_hands: null, bb_won: 50 }),
    ];
    const stats = aggregate(sessions);
    expect(stats.totalHands).toBe(100);
    expect(stats.bbPer100).toBe(50); // only the first session contributes
    expect(stats.netBase).toBe(200); // both contribute to money
  });

  it("returns nulls for empty set extremes", () => {
    const stats = aggregate([]);
    expect(stats.netBase).toBe(0);
    expect(stats.biggestWin).toBeNull();
    expect(stats.biggestLoss).toBeNull();
    expect(stats.perHour).toBeNull();
    expect(stats.bbPer100).toBeNull();
  });
});

describe("groupBy", () => {
  it("groups by session type and sorts most profitable first", () => {
    const sessions = [
      s({ session_type: "home", net_base: -300, duration_minutes: 60, est_hands: 100, bb_won: -150 }),
      s({ session_type: "online", net_base: 200, duration_minutes: 30, est_hands: 40, bb_won: 100 }),
      s({ session_type: "online", net_base: 50, duration_minutes: 30, est_hands: 40, bb_won: 25 }),
    ];
    const rows = groupBy(sessions, "session_type");
    expect(rows.map((r) => r.key)).toEqual(["online", "home"]);
    expect(rows[0].netBase).toBe(250);
    expect(rows[0].sessionCount).toBe(2);
    expect(rows[1].netBase).toBe(-300);
  });

  it("collapses venue case/whitespace variants into one row", () => {
    const sessions = [
      s({ venue: "Stake", net_base: 100, duration_minutes: 60, est_hands: 100, bb_won: 50 }),
      s({ venue: "stake ", net_base: 200, duration_minutes: 60, est_hands: 100, bb_won: 50 }),
      s({ venue: " STAKE", net_base: -50, duration_minutes: 60, est_hands: 100, bb_won: -25 }),
    ];
    const rows = groupBy(sessions, "venue");
    expect(rows).toHaveLength(1);
    expect(rows[0].key).toBe("Stake"); // first-seen display label
    expect(rows[0].sessionCount).toBe(3);
    expect(rows[0].netBase).toBe(250);
  });
});

describe("cumulativeProfitSeries", () => {
  it("builds a running total in chronological order (base mode)", () => {
    const sessions = [
      s({ started_at: "2026-05-20T10:00:00Z", net_base: 50, bb_won: 25 }),
      s({ started_at: "2026-05-01T10:00:00Z", net_base: 100, bb_won: 50 }),
      s({ started_at: "2026-05-10T10:00:00Z", net_base: -40, bb_won: -20 }),
      s({ started_at: "2026-05-25T10:00:00Z", net_base: null }), // live, excluded
    ];
    const pts = cumulativeProfitSeries(sessions, "base");
    expect(pts.map((p) => p.cumulative)).toEqual([100, 60, 110]);
  });

  it("uses bb_won in bb mode", () => {
    const sessions = [
      s({ started_at: "2026-05-01T10:00:00Z", net_base: 100, bb_won: 50 }),
      s({ started_at: "2026-05-02T10:00:00Z", net_base: -40, bb_won: -20 }),
    ];
    const pts = cumulativeProfitSeries(sessions, "bb");
    expect(pts.map((p) => p.cumulative)).toEqual([50, 30]);
  });
});

describe("bucketByReflection", () => {
  it("averages net by mood bucket", () => {
    const sessions = [
      s({ mood: 5, net_base: 100 }),
      s({ mood: 5, net_base: 200 }),
      s({ mood: 2, net_base: -300 }),
      s({ mood: null, net_base: 50 }), // excluded (no mood)
    ];
    const rows = bucketByReflection(sessions, "mood");
    const five = rows.find((r) => r.bucket === "5");
    const two = rows.find((r) => r.bucket === "2");
    expect(five?.avgNetBase).toBe(150);
    expect(five?.sessionCount).toBe(2);
    expect(two?.avgNetBase).toBe(-300);
  });

  it("buckets tilt as boolean", () => {
    const rows = bucketByReflection(
      [s({ tilt: true, net_base: -100 }), s({ tilt: false, net_base: 200 })],
      "tilt"
    );
    expect(rows.find((r) => r.bucket === "Tilted")?.avgNetBase).toBe(-100);
    expect(rows.find((r) => r.bucket === "Not tilted")?.avgNetBase).toBe(200);
  });

  it("buckets sleep into ranges", () => {
    const rows = bucketByReflection(
      [s({ sleep_hours: 4, net_base: -50 }), s({ sleep_hours: 8, net_base: 100 })],
      "sleep_hours"
    );
    expect(rows.find((r) => r.bucket === "<5h")?.avgNetBase).toBe(-50);
    expect(rows.find((r) => r.bucket === "7–9h")?.avgNetBase).toBe(100);
  });
});
