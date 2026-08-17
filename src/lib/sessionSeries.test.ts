import { describe, it, expect } from "vitest";
import {
  buildSessionSeries,
  computeStreaks,
  previousWindow,
  resolveWindow,
  sessionsInWindow,
  summarisePeriod,
  windowLengthInDays,
  type DateWindow,
} from "./sessionSeries";
import { Session } from "@/types/session";

// Builds a weed session at a local wall-clock time. Weed sessions of type
// 'Joint' normalize as quantity / participant_count, in grams.
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

describe("windowLengthInDays", () => {
  it("counts both endpoints", () => {
    expect(windowLengthInDays(windowOf("2026-03-01", "2026-03-01"))).toBe(1);
    expect(windowLengthInDays(windowOf("2026-03-01", "2026-03-30"))).toBe(30);
  });

  it("counts calendar days across a DST boundary", () => {
    // US DST starts 2026-03-08; a naive 24h division would give 29.96 days.
    expect(windowLengthInDays(windowOf("2026-03-01", "2026-03-31"))).toBe(31);
  });
});

describe("previousWindow", () => {
  it("returns the equally long window ending the day before", () => {
    const prev = previousWindow(windowOf("2026-03-11", "2026-03-20"));
    expect(prev.from.toDateString()).toBe(new Date("2026-03-01T00:00:00").toDateString());
    expect(prev.to.toDateString()).toBe(new Date("2026-03-10T00:00:00").toDateString());
    expect(windowLengthInDays(prev)).toBe(10);
  });
});

describe("resolveWindow", () => {
  it("spans the requested number of days including today", () => {
    const w = resolveWindow("30d", [])!;
    expect(windowLengthInDays(w)).toBe(30);
  });

  it("starts 'all' at the earliest session and runs to today", () => {
    const w = resolveWindow("all", [
      session("2026-01-15T12:00:00"),
      session("2025-06-02T12:00:00"),
      session("2026-02-01T12:00:00"),
    ])!;
    expect(w.from.toDateString()).toBe(new Date("2025-06-02T00:00:00").toDateString());
    expect(w.to.toDateString()).toBe(new Date().toDateString());
  });

  it("returns null for 'all' with no sessions and for custom with no start", () => {
    expect(resolveWindow("all", [])).toBeNull();
    expect(resolveWindow("custom", [], {})).toBeNull();
  });

  it("normalizes a backwards custom range", () => {
    const w = resolveWindow("custom", [], {
      from: new Date("2026-03-20T00:00:00"),
      to: new Date("2026-03-10T00:00:00"),
    })!;
    expect(w.from.toDateString()).toBe(new Date("2026-03-10T00:00:00").toDateString());
    expect(w.to.toDateString()).toBe(new Date("2026-03-20T00:00:00").toDateString());
  });

  it("treats a single-day custom range as one whole day", () => {
    const w = resolveWindow("custom", [], { from: new Date("2026-03-10T00:00:00") })!;
    expect(windowLengthInDays(w)).toBe(1);
  });
});

describe("sessionsInWindow", () => {
  const sessions = [
    session("2026-03-05T09:00:00"),
    session("2026-02-28T23:30:00"),
    session("2026-03-10T23:59:00"),
    session("2026-03-11T00:30:00"),
  ];

  it("includes the whole of the last day and excludes anything outside", () => {
    const inRange = sessionsInWindow(sessions, windowOf("2026-03-01", "2026-03-10"));
    expect(inRange.map((s) => s.id)).toEqual([
      "2026-03-05T09:00:00",
      "2026-03-10T23:59:00",
    ]);
  });

  it("returns results in chronological order regardless of input order", () => {
    const inRange = sessionsInWindow(sessions, windowOf("2026-01-01", "2026-12-31"));
    expect(inRange.map((s) => s.id)).toEqual([
      "2026-02-28T23:30:00",
      "2026-03-05T09:00:00",
      "2026-03-10T23:59:00",
      "2026-03-11T00:30:00",
    ]);
  });
});

describe("buildSessionSeries", () => {
  it("zero-fills days with no sessions", () => {
    const series = buildSessionSeries(
      [session("2026-03-01T10:00:00"), session("2026-03-03T10:00:00")],
      windowOf("2026-03-01", "2026-03-04")
    );

    expect(series.days).toHaveLength(4);
    expect(series.dailyTotals).toEqual([1, 0, 1, 0]);
    expect(series.days.map((d) => d.count)).toEqual([1, 0, 1, 0]);
  });

  it("produces one day point per calendar day across a DST boundary", () => {
    const series = buildSessionSeries([], windowOf("2026-03-06", "2026-03-10"));
    expect(series.days.map((d) => d.key)).toEqual([
      "2026-03-06",
      "2026-03-07",
      "2026-03-08",
      "2026-03-09",
      "2026-03-10",
    ]);
  });

  it("sums multiple sessions in a day and divides shared sessions by participants", () => {
    const series = buildSessionSeries(
      [
        session("2026-03-01T10:00:00", { quantity: 2, participant_count: 2 }),
        session("2026-03-01T20:00:00", { quantity: 1 }),
      ],
      windowOf("2026-03-01", "2026-03-01")
    );

    expect(series.perSession).toEqual([1, 1]);
    expect(series.dailyTotals).toEqual([2]);
  });

  it("normalizes mixed units, converting edible mg to grams", () => {
    const series = buildSessionSeries(
      [
        session("2026-03-01T10:00:00", { session_type: "Edible", quantity: 500 }),
        session("2026-03-01T20:00:00", { quantity: 1 }),
      ],
      windowOf("2026-03-01", "2026-03-01")
    );

    expect(series.perSession).toEqual([0.5, 1]);
  });

  it("measures gaps between consecutive sessions in hours", () => {
    const series = buildSessionSeries(
      [
        session("2026-03-01T10:00:00"),
        session("2026-03-01T16:00:00"),
        session("2026-03-03T16:00:00"),
      ],
      windowOf("2026-03-01", "2026-03-04")
    );

    expect(series.gapHours).toEqual([6, 48]);
  });

  it("has no gaps to report for a single session", () => {
    const series = buildSessionSeries(
      [session("2026-03-01T10:00:00")],
      windowOf("2026-03-01", "2026-03-04")
    );
    expect(series.gapHours).toEqual([]);
  });

  it("buckets by weekday and hour with per-bucket averages", () => {
    // 2026-03-02 is a Monday.
    const series = buildSessionSeries(
      [
        session("2026-03-02T09:00:00", { quantity: 1 }),
        session("2026-03-02T09:30:00", { quantity: 3 }),
      ],
      windowOf("2026-03-01", "2026-03-07")
    );

    const monday = series.weekdays[1];
    expect(monday.label).toBe("Monday");
    expect(monday.count).toBe(2);
    expect(monday.total).toBe(4);
    expect(monday.average).toBe(2);

    expect(series.hours[9].count).toBe(2);
    expect(series.weekdays[0].average).toBeNull();
    expect(series.hours).toHaveLength(24);
  });

  it("splits social from solo, counting multi-participant sessions as social", () => {
    const series = buildSessionSeries(
      [
        session("2026-03-01T10:00:00", { quantity: 4, participant_count: 4 }),
        session("2026-03-01T12:00:00", { is_social: true }),
        session("2026-03-01T14:00:00"),
      ],
      windowOf("2026-03-01", "2026-03-01")
    );

    expect(series.socialDoses).toEqual([1, 1]);
    expect(series.soloDoses).toEqual([1]);
  });

  it("collects only sessions that carry a rating", () => {
    const series = buildSessionSeries(
      [
        session("2026-03-01T10:00:00", { rating: 4 }),
        session("2026-03-01T12:00:00"),
      ],
      windowOf("2026-03-01", "2026-03-01")
    );

    expect(series.ratingPairs).toEqual([{ dose: 1, rating: 4 }]);
  });

  it("returns an empty but well-formed series when nothing is logged", () => {
    const series = buildSessionSeries([], windowOf("2026-03-01", "2026-03-03"));
    expect(series.perSession).toEqual([]);
    expect(series.dailyTotals).toEqual([0, 0, 0]);
    expect(series.weekdays).toHaveLength(7);
  });
});

describe("computeStreaks", () => {
  const days = (pattern: number[]) =>
    pattern.map((count, i) => ({
      key: `d${i}`,
      label: `d${i}`,
      date: new Date(2026, 2, i + 1),
      total: count,
      count,
    }));

  it("finds the longest active and clean runs", () => {
    const s = computeStreaks(days([1, 1, 0, 0, 0, 1, 1, 1]));
    expect(s.longestActive).toBe(3);
    expect(s.longestClean).toBe(3);
  });

  it("reports the trailing run as current", () => {
    const active = computeStreaks(days([0, 1, 1]));
    expect(active.currentActive).toBe(2);
    expect(active.currentClean).toBe(0);

    const clean = computeStreaks(days([1, 0, 0]));
    expect(clean.currentClean).toBe(2);
    expect(clean.currentActive).toBe(0);
  });

  it("handles all-active, all-clean and empty inputs", () => {
    expect(computeStreaks(days([1, 1, 1])).longestActive).toBe(3);
    expect(computeStreaks(days([0, 0, 0])).longestClean).toBe(3);
    expect(computeStreaks([])).toEqual({
      currentActive: 0,
      currentClean: 0,
      longestActive: 0,
      longestClean: 0,
    });
  });
});

describe("summarisePeriod", () => {
  it("averages over every day in the window, not just active ones", () => {
    const series = buildSessionSeries(
      [session("2026-03-01T10:00:00", { quantity: 2 })],
      windowOf("2026-03-01", "2026-03-04")
    );
    const summary = summarisePeriod(series);

    expect(summary.total).toBe(2);
    expect(summary.dayCount).toBe(4);
    expect(summary.activeDays).toBe(1);
    expect(summary.averagePerDay).toBe(0.5);
    expect(summary.averagePerSession).toBe(2);
    expect(summary.sessionsPerDay).toBe(0.25);
  });

  it("reports null average per session when there are no sessions", () => {
    const summary = summarisePeriod(
      buildSessionSeries([], windowOf("2026-03-01", "2026-03-04"))
    );
    expect(summary.averagePerSession).toBeNull();
    expect(summary.total).toBe(0);
  });
});
