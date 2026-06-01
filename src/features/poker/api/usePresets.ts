// Saved stake configurations for one-tap session logging.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Preset, PresetInsert } from "../lib/types";

export function usePresets() {
  const { user } = useAuth();
  const [presets, setPresets] = useState<Preset[]>([]);
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
        .from("poker_presets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (dbError) throw dbError;
      setPresets(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load presets");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const createPreset = async (preset: Omit<PresetInsert, "user_id">) => {
    if (!user) throw new Error("Not authenticated");
    const { data, error: dbError } = await supabase
      .from("poker_presets")
      .insert({ ...preset, user_id: user.id })
      .select()
      .single();
    if (dbError) throw dbError;
    setPresets((prev) => [data, ...prev]);
    return data;
  };

  const deletePreset = async (id: string) => {
    const prev = presets;
    setPresets((p) => p.filter((x) => x.id !== id));
    const { error: dbError } = await supabase
      .from("poker_presets")
      .delete()
      .eq("id", id);
    if (dbError) {
      setPresets(prev);
      throw dbError;
    }
  };

  return { presets, isLoading, error, createPreset, deletePreset, refetch: load };
}
