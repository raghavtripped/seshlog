// Poker sessions data layer. Lists read from the `poker_sessions_with_stats`
// view (derived net/bb/duration come pre-computed); writes go to the base
// `poker_sessions` table. Creating a session also writes its initial buy-in.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type {
  SessionWithStats,
  PokerSession,
  PokerSessionInsert,
  PokerSessionUpdate,
} from "../lib/types";

export function usePokerSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("poker_sessions_with_stats")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });
      if (dbError) throw dbError;
      setSessions((data ?? []) as SessionWithStats[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  /** Create a session plus its initial buy-in. Returns the new session id. */
  const createSession = async (
    sessionData: Omit<PokerSessionInsert, "user_id">,
    initialBuyIn: number
  ) => {
    if (!user) throw new Error("Not authenticated");
    const { data: created, error: dbError } = await supabase
      .from("poker_sessions")
      .insert({ ...sessionData, user_id: user.id })
      .select()
      .single();
    if (dbError) throw dbError;

    if (initialBuyIn && initialBuyIn > 0) {
      const { error: buyErr } = await supabase.from("poker_buy_ins").insert({
        session_id: created.id,
        user_id: user.id,
        amount: initialBuyIn,
        kind: "initial",
      });
      if (buyErr) throw buyErr;
    }
    await load();
    return created.id as string;
  };

  const updateSession = async (id: string, patch: PokerSessionUpdate) => {
    const { error: dbError } = await supabase
      .from("poker_sessions")
      .update(patch)
      .eq("id", id);
    if (dbError) throw dbError;
    await load();
  };

  const deleteSession = async (id: string) => {
    const prev = sessions;
    setSessions((s) => s.filter((x) => x.id !== id));
    const { error: dbError } = await supabase
      .from("poker_sessions")
      .delete()
      .eq("id", id);
    if (dbError) {
      setSessions(prev);
      throw dbError;
    }
  };

  const liveSession = sessions.find((s) => !s.ended_at && s.cash_out === null) ?? null;

  return {
    sessions,
    liveSession,
    isLoading,
    error,
    createSession,
    updateSession,
    deleteSession,
    refetch: load,
  };
}

/** Fetch a single session's base row (for editing). */
export function useSession(id: string | undefined) {
  const { user } = useAuth();
  const [session, setSession] = useState<PokerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("poker_sessions")
        .select("*")
        .eq("id", id)
        .single();
      if (dbError) throw dbError;
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setIsLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateSession = async (patch: PokerSessionUpdate) => {
    if (!id) throw new Error("No session id");
    const { data, error: dbError } = await supabase
      .from("poker_sessions")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (dbError) throw dbError;
    setSession(data);
    return data;
  };

  const deleteSession = async () => {
    if (!id) throw new Error("No session id");
    const { error: dbError } = await supabase
      .from("poker_sessions")
      .delete()
      .eq("id", id);
    if (dbError) throw dbError;
  };

  return { session, isLoading, error, refetch: load, updateSession, deleteSession };
}
