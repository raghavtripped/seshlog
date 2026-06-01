// Per-user poker settings (base currency, default currency, timezone).
// Mirrors the plain useState + supabase pattern used elsewhere in the app
// (see src/hooks/useSessions.tsx). Lazily creates the row on first use.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { PokerProfile, PokerProfileUpdate } from "../lib/types";

const DEFAULT_PROFILE = {
  base_currency: "INR",
  default_currency: "INR",
  timezone: "Asia/Kolkata",
};

export function usePokerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PokerProfile | null>(null);
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
        .from("poker_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (dbError) throw dbError;

      if (data) {
        setProfile(data);
      } else {
        // Create the default row the first time.
        const { data: created, error: insErr } = await supabase
          .from("poker_profiles")
          .insert({ user_id: user.id, ...DEFAULT_PROFILE })
          .select()
          .single();
        if (insErr) throw insErr;
        setProfile(created);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const updateProfile = async (patch: PokerProfileUpdate) => {
    if (!user) throw new Error("Not authenticated");
    const { data, error: dbError } = await supabase
      .from("poker_profiles")
      .update(patch)
      .eq("user_id", user.id)
      .select()
      .single();
    if (dbError) throw dbError;
    setProfile(data);
    return data;
  };

  const baseCurrency = profile?.base_currency ?? DEFAULT_PROFILE.base_currency;
  const defaultCurrency =
    profile?.default_currency ?? DEFAULT_PROFILE.default_currency;

  return {
    profile,
    baseCurrency,
    defaultCurrency,
    isLoading,
    error,
    updateProfile,
    refetch: load,
  };
}
