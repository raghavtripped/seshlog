// Pure metric math for the poker tracker — the correctness core.
// No Supabase, no React: just numbers in, numbers out, so it can be unit-tested
// in isolation. All "money" values here are already in a single currency unless
// a function name says otherwise; cross-currency summing happens via net_base.

import type {
  BreakdownRow,
  DashboardStats,
  GroupByKey,
  PokerFilter,
  SessionWithStats,
} from "./types";

/** Coerce a possibly-null/string numeric into a finite number or null. */
function num(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : null;
}

// ── Per-session primitives ──────────────────────────────────────────

/** net (native) = cash_out − total buy-in. */
export function netNative(cashOut: number, totalBuyIn: number): number {
  return cashOut - totalBuyIn;
}

/** Convert a native net into base currency using the stored FX rate. */
export function netBase(netNativeValue: number, fxRateToBase: number): number {
  return netNativeValue * fxRateToBase;
}

/** Big blinds won/lost. Returns null when the big blind is missing/zero. */
export function bbWon(netNativeValue: number, bigBlind: number): number | null {
  if (!bigBlind || bigBlind <= 0) return null;
  return netNativeValue / bigBlind;
}

/** BB/100. Returns null when there are no hands to divide by. */
export function bbPer100(totalBbWon: number, totalHands: number): number | null {
  if (!totalHands || totalHands <= 0) return null;
  return (totalBbWon / totalHands) * 100;
}

/** Minutes → hours. */
export function durationHours(minutes: number): number {
  return minutes / 60;
}

/** Profit per hour. Returns null when there are no hours played. */
export function perHour(netBaseValue: number, hours: number): number | null {
  if (!hours || hours <= 0) return null;
  return netBaseValue / hours;
}

/** ROI = net / buy-in (per session, single currency). Null when no buy-in. */
export function roi(netNativeValue: number, totalBuyIn: number): number | null {
  if (!totalBuyIn || totalBuyIn <= 0) return null;
  return netNativeValue / totalBuyIn;
}

/** Sum of buy-in amounts. */
export function totalBuyIn(buyIns: { amount: number }[]): number {
  return buyIns.reduce((sum, b) => sum + (num(b.amount) ?? 0), 0);
}

/** Duration in minutes between two ISO timestamps, or null if incomplete. */
export function sessionDurationMinutes(
  startedAt: string | null,
  endedAt: string | null
): number | null {
  if (!startedAt || !endedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return (end - start) / 60000;
}

// ── Filtering ───────────────────────────────────────────────────────

export function stakeKey(s: Pick<SessionWithStats, "small_blind" | "big_blind">): string {
  const sb = num(s.small_blind);
  const bb = num(s.big_blind);
  return `${sb ?? "?"}/${bb ?? "?"}`;
}

// Canonical display form for a free-text venue: trims and collapses inner
// whitespace so "Stake", " Stake " and "Stake  " don't become distinct groups.
// Case is preserved (for display); use venueMatchKey for case-insensitive matching.
export function normalizeVenue(venue: string | null | undefined): string | null {
  if (!venue) return null;
  const cleaned = venue.trim().replace(/\s+/g, " ");
  return cleaned === "" ? null : cleaned;
}

// Key for grouping/filtering venues so case variants collapse too
// (e.g. "Stake" and "stake" are the same place).
function venueMatchKey(venue: string | null | undefined): string | null {
  return normalizeVenue(venue)?.toLowerCase() ?? null;
}

export function applyFilter(
  sessions: SessionWithStats[],
  filter: PokerFilter
): SessionWithStats[] {
  return sessions.filter((s) => {
    if (filter.from) {
      const from = new Date(filter.from);
      from.setHours(0, 0, 0, 0);
      if (s.started_at && new Date(s.started_at) < from) return false;
    }
    if (filter.to) {
      const to = new Date(filter.to);
      to.setHours(23, 59, 59, 999);
      if (s.started_at && new Date(s.started_at) > to) return false;
    }
    if (filter.venue && filter.venue !== "all" && venueMatchKey(s.venue) !== venueMatchKey(filter.venue)) return false;
    if (
      filter.sessionType &&
      filter.sessionType !== "all" &&
      s.session_type !== filter.sessionType
    )
      return false;
    if (filter.gameType && filter.gameType !== "all" && s.game_type !== filter.gameType)
      return false;
    if (filter.currency && filter.currency !== "all" && s.currency !== filter.currency)
      return false;
    if (filter.stake && filter.stake !== "all" && stakeKey(s) !== filter.stake)
      return false;
    return true;
  });
}

/** A session counts as "completed" once it has a net result. */
export function isCompleted(s: SessionWithStats): boolean {
  return num(s.net_base) !== null;
}

// ── Aggregation ─────────────────────────────────────────────────────

interface CoreStats {
  netBase: number;
  hours: number;
  perHour: number | null;
  bbPer100: number | null;
  totalHands: number;
  sessionCount: number;
  biggestWin: number | null;
  biggestLoss: number | null;
}

function computeCore(sessions: SessionWithStats[]): CoreStats {
  let netBaseSum = 0;
  let minutes = 0;
  let handsForBb = 0;
  let bbWonForBb = 0;
  let totalHands = 0;
  let biggestWin: number | null = null;
  let biggestLoss: number | null = null;

  for (const s of sessions) {
    const nb = num(s.net_base);
    if (nb !== null) {
      netBaseSum += nb;
      biggestWin = biggestWin === null ? nb : Math.max(biggestWin, nb);
      biggestLoss = biggestLoss === null ? nb : Math.min(biggestLoss, nb);
    }
    const dur = num(s.duration_minutes);
    if (dur !== null) minutes += dur;

    const hands = num(s.est_hands);
    const bw = num(s.bb_won);
    if (hands !== null && hands > 0) {
      totalHands += hands;
      if (bw !== null) {
        handsForBb += hands;
        bbWonForBb += bw;
      }
    }
  }

  const hours = durationHours(minutes);
  return {
    netBase: netBaseSum,
    hours,
    perHour: perHour(netBaseSum, hours),
    bbPer100: bbPer100(bbWonForBb, handsForBb),
    totalHands,
    sessionCount: sessions.length,
    biggestWin,
    biggestLoss,
  };
}

export function aggregate(sessions: SessionWithStats[]): DashboardStats {
  return computeCore(sessions);
}

function groupKeyFor(s: SessionWithStats, key: GroupByKey): string {
  switch (key) {
    case "venue":
      return normalizeVenue(s.venue) ?? "Unknown";
    case "stake":
      return stakeKey(s);
    case "game_type":
      return s.game_type ?? "Unknown";
    case "session_type":
      return s.session_type ?? "Unknown";
    case "currency":
      return s.currency ?? "Unknown";
    case "day_of_week": {
      if (!s.started_at) return "Unknown";
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[new Date(s.started_at).getDay()] ?? "Unknown";
    }
    default:
      return "Unknown";
  }
}

export function groupBy(
  sessions: SessionWithStats[],
  key: GroupByKey
): BreakdownRow[] {
  // Map keyed by a (possibly case-folded) match key, while keeping the first
  // display label we see so venues like "Stake"/"stake " collapse to one row.
  const groups = new Map<string, { display: string; items: SessionWithStats[] }>();
  for (const s of sessions) {
    const display = groupKeyFor(s, key);
    const matchKey = key === "venue" ? display.toLowerCase() : display;
    const entry = groups.get(matchKey);
    if (entry) entry.items.push(s);
    else groups.set(matchKey, { display, items: [s] });
  }
  const rows: BreakdownRow[] = [];
  for (const { display, items } of groups.values()) {
    const core = computeCore(items);
    rows.push({
      key: display,
      netBase: core.netBase,
      bbPer100: core.bbPer100,
      hours: core.hours,
      perHour: core.perHour,
      sessionCount: core.sessionCount,
    });
  }
  // Most profitable first.
  return rows.sort((a, b) => b.netBase - a.netBase);
}

// ── Cumulative profit series (for the chart) ────────────────────────

export interface ProfitPoint {
  date: string; // ISO of the session
  label: string; // short display label
  value: number; // this session's net (base or bb)
  cumulative: number; // running total
}

export function cumulativeProfitSeries(
  sessions: SessionWithStats[],
  mode: "base" | "bb"
): ProfitPoint[] {
  const completed = sessions
    .filter(isCompleted)
    .filter((s) => !!s.started_at)
    .sort(
      (a, b) =>
        new Date(a.started_at as string).getTime() -
        new Date(b.started_at as string).getTime()
    );

  let running = 0;
  const points: ProfitPoint[] = [];
  for (const s of completed) {
    const value = mode === "bb" ? num(s.bb_won) ?? 0 : num(s.net_base) ?? 0;
    running += value;
    const d = new Date(s.started_at as string);
    points.push({
      date: s.started_at as string,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      value,
      cumulative: running,
    });
  }
  return points;
}

// ── Reflection correlation ──────────────────────────────────────────

export type ReflectionDimension = "mood" | "focus" | "tilt" | "sleep_hours";

export interface ReflectionBucket {
  bucket: string;
  avgNetBase: number | null;
  sessionCount: number;
}

export function bucketByReflection(
  sessions: SessionWithStats[],
  dimension: ReflectionDimension
): ReflectionBucket[] {
  const buckets = new Map<string, number[]>();

  const labelFor = (s: SessionWithStats): string | null => {
    if (dimension === "tilt") {
      if (s.tilt === null || s.tilt === undefined) return null;
      return s.tilt ? "Tilted" : "Not tilted";
    }
    if (dimension === "sleep_hours") {
      const h = num(s.sleep_hours);
      if (h === null) return null;
      if (h < 5) return "<5h";
      if (h < 7) return "5–7h";
      if (h < 9) return "7–9h";
      return "9h+";
    }
    // mood / focus: 1–5 scale
    const v = num(s[dimension] as number | null);
    return v === null ? null : String(v);
  };

  for (const s of sessions) {
    const nb = num(s.net_base);
    if (nb === null) continue;
    const label = labelFor(s);
    if (label === null) continue;
    const arr = buckets.get(label) ?? [];
    arr.push(nb);
    buckets.set(label, arr);
  }

  return Array.from(buckets.entries())
    .map(([bucket, vals]) => ({
      bucket,
      avgNetBase: vals.length
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : null,
      sessionCount: vals.length,
    }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket));
}
