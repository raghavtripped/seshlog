// Domain types for the poker session tracker.
// Row/Insert/Update types come straight from the auto-generated Supabase types
// so the data layer stays in sync with the database schema.

import type { Database } from "@/integrations/supabase/types";

export type PokerProfile = Database["public"]["Tables"]["poker_profiles"]["Row"];
export type PokerProfileUpdate = Database["public"]["Tables"]["poker_profiles"]["Update"];

export type Preset = Database["public"]["Tables"]["poker_presets"]["Row"];
export type PresetInsert = Database["public"]["Tables"]["poker_presets"]["Insert"];

export type PokerSession = Database["public"]["Tables"]["poker_sessions"]["Row"];
export type PokerSessionInsert = Database["public"]["Tables"]["poker_sessions"]["Insert"];
export type PokerSessionUpdate = Database["public"]["Tables"]["poker_sessions"]["Update"];

export type BuyIn = Database["public"]["Tables"]["poker_buy_ins"]["Row"];
export type BuyInInsert = Database["public"]["Tables"]["poker_buy_ins"]["Insert"];

export type KeyHand = Database["public"]["Tables"]["poker_key_hands"]["Row"];
export type KeyHandInsert = Database["public"]["Tables"]["poker_key_hands"]["Insert"];

// The stats view exposes the session row plus derived fields.
export type SessionWithStats =
  Database["public"]["Views"]["poker_sessions_with_stats"]["Row"];

export type SessionType = "online" | "home" | "casino";
export type GameType = "NLHE" | "PLO" | "PLO5" | "Other";
export type BuyInKind = "initial" | "rebuy" | "topup" | "addon";
export type KeyHandTag =
  | "bluff"
  | "value"
  | "cooler"
  | "mistake"
  | "fold"
  | "other";

export const SESSION_TYPES: SessionType[] = ["online", "home", "casino"];
export const GAME_TYPES: GameType[] = ["NLHE", "PLO", "PLO5", "Other"];
export const BUYIN_KINDS: BuyInKind[] = ["initial", "rebuy", "topup", "addon"];
export const KEY_HAND_TAGS: KeyHandTag[] = [
  "bluff",
  "value",
  "cooler",
  "mistake",
  "fold",
  "other",
];

// Dashboard / analytics filter applied across all aggregates.
export interface PokerFilter {
  from?: string; // ISO date
  to?: string; // ISO date
  venue?: string;
  sessionType?: SessionType | "all";
  gameType?: string | "all";
  currency?: string | "all";
  stake?: string | "all"; // formatted "SB/BB" key
}

// Aggregated headline stats for the dashboard (all money in base currency).
export interface DashboardStats {
  netBase: number;
  hours: number;
  perHour: number | null;
  bbPer100: number | null;
  totalHands: number;
  sessionCount: number;
  biggestWin: number | null;
  biggestLoss: number | null;
}

// One row of a grouped breakdown (by venue / stake / type / etc.).
export interface BreakdownRow {
  key: string;
  netBase: number;
  bbPer100: number | null;
  hours: number;
  perHour: number | null;
  sessionCount: number;
}

export type GroupByKey =
  | "venue"
  | "stake"
  | "game_type"
  | "session_type"
  | "currency"
  | "day_of_week";
