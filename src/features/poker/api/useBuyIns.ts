// Buy-ins for a session (initial + re-buys / top-ups / add-ons).

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { BuyIn, BuyInKind } from "../lib/types";

export function useBuyIns(sessionId: string | undefined) {
  const { user } = useAuth();
  const [buyIns, setBuyIns] = useState<BuyIn[]>([]);
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
        .from("poker_buy_ins")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (dbError) throw dbError;
      setBuyIns(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load buy-ins");
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const addBuyIn = async (amount: number, kind: BuyInKind, note?: string) => {
    if (!user || !sessionId) throw new Error("Not authenticated");
    const { data, error: dbError } = await supabase
      .from("poker_buy_ins")
      .insert({ session_id: sessionId, user_id: user.id, amount, kind, note: note ?? null })
      .select()
      .single();
    if (dbError) throw dbError;
    setBuyIns((prev) => [...prev, data]);
    return data;
  };

  const deleteBuyIn = async (id: string) => {
    const prev = buyIns;
    setBuyIns((b) => b.filter((x) => x.id !== id));
    const { error: dbError } = await supabase
      .from("poker_buy_ins")
      .delete()
      .eq("id", id);
    if (dbError) {
      setBuyIns(prev);
      throw dbError;
    }
  };

  const total = buyIns.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  return { buyIns, total, isLoading, error, addBuyIn, deleteBuyIn, refetch: load };
}
