// Global filter bar applied across dashboard + analytics aggregates.
// Options are derived from the sessions currently loaded.

import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { stakeKey } from "../lib/metrics";
import type { PokerFilter, SessionWithStats, SessionType } from "../lib/types";

interface FilterBarProps {
  sessions: SessionWithStats[];
  filter: PokerFilter;
  onChange: (filter: PokerFilter) => void;
}

const ALL = "all";

export function FilterBar({ sessions, filter, onChange }: FilterBarProps) {
  const { venues, stakes, games, currencies } = useMemo(() => {
    const venues = new Set<string>();
    const stakes = new Set<string>();
    const games = new Set<string>();
    const currencies = new Set<string>();
    for (const s of sessions) {
      if (s.venue) venues.add(s.venue);
      stakes.add(stakeKey(s));
      if (s.game_type) games.add(s.game_type);
      if (s.currency) currencies.add(s.currency);
    }
    return {
      venues: [...venues].sort(),
      stakes: [...stakes].sort(),
      games: [...games].sort(),
      currencies: [...currencies].sort(),
    };
  }, [sessions]);

  const set = (patch: Partial<PokerFilter>) => onChange({ ...filter, ...patch });
  const hasFilters =
    filter.from || filter.to ||
    [filter.venue, filter.sessionType, filter.gameType, filter.currency, filter.stake].some(
      (v) => v && v !== ALL
    );

  const selectField = (
    label: string,
    value: string | undefined,
    options: string[],
    key: keyof PokerFilter
  ) => (
    <div className="min-w-[120px] flex-1">
      <Label className="text-xs text-gray-500">{label}</Label>
      <Select value={value ?? ALL} onValueChange={(v) => set({ [key]: v } as Partial<PokerFilter>)}>
        <SelectTrigger className="h-9 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="rounded-xl bg-white/70 p-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[130px] flex-1">
          <Label className="text-xs text-gray-500">From</Label>
          <Input
            type="date"
            value={filter.from ?? ""}
            onChange={(e) => set({ from: e.target.value || undefined })}
            className="h-9 bg-white"
          />
        </div>
        <div className="min-w-[130px] flex-1">
          <Label className="text-xs text-gray-500">To</Label>
          <Input
            type="date"
            value={filter.to ?? ""}
            onChange={(e) => set({ to: e.target.value || undefined })}
            className="h-9 bg-white"
          />
        </div>
        {selectField("Venue", filter.venue, venues, "venue")}
        {selectField("Stake", filter.stake, stakes, "stake")}
        {selectField("Game", filter.gameType, games, "gameType")}
        {selectField("Currency", filter.currency, currencies, "currency")}
        <div className="min-w-[120px] flex-1">
          <Label className="text-xs text-gray-500">Type</Label>
          <Select
            value={filter.sessionType ?? ALL}
            onValueChange={(v) => set({ sessionType: v as SessionType | "all" })}
          >
            <SelectTrigger className="h-9 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="casino">Casino</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({})}
            className="h-9 text-gray-500"
          >
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
