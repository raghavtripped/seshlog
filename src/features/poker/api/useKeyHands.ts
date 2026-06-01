// Notable hands attached to a session.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { KeyHand, KeyHandInsert } from "../lib/types";

export function useKeyHands(sessionId: string | undefined) {
  const { user } = useAuth();
  const [keyHands, setKeyHands] = useState<KeyHand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !sessionId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("poker_key_hands")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (dbError) throw dbError;
      setKeyHands(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load key hands");
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const addKeyHand = async (hand: Omit<KeyHandInsert, "user_id" | "session_id">) => {
    if (!user || !sessionId) throw new Error("Not authenticated");
    const { data, error: dbError } = await supabase
      .from("poker_key_hands")
      .insert({ ...hand, session_id: sessionId, user_id: user.id })
      .select()
      .single();
    if (dbError) throw dbError;
    setKeyHands((prev) => [...prev, data]);
    return data;
  };

  const deleteKeyHand = async (id: string) => {
    const prev = keyHands;
    setKeyHands((k) => k.filter((x) => x.id !== id));
    const { error: dbError } = await supabase
      .from("poker_key_hands")
      .delete()
      .eq("id", id);
    if (dbError) {
      setKeyHands(prev);
      throw dbError;
    }
  };

  return { keyHands, isLoading, error, addKeyHand, deleteKeyHand, refetch: load };
}
