// Session form — used both to log a new session (fast path) and to edit an
// existing one. Plain controlled state (matching the app's lightweight style),
// shadcn inputs, live BB-equivalent readout, FX auto-suggest, and a
// live-timer vs backfill toggle on create.

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CURRENCIES, formatMoney } from "../lib/currencies";
import { fetchSuggestedRate } from "../api/fx";
import {
  GAME_TYPES,
  SESSION_TYPES,
  type GameType,
  type PokerSession,
  type PokerSessionInsert,
  type PokerSessionUpdate,
  type SessionType,
} from "../lib/types";

export interface SessionFormInitial {
  venue?: string;
  session_type?: SessionType;
  game_type?: GameType;
  currency?: string;
  small_blind?: number;
  big_blind?: number;
  ante?: number | null;
  straddle?: number | null;
  max_buyin?: number | null;
  default_buyin?: number | null;
}

interface SessionFormProps {
  mode: "create" | "edit";
  baseCurrency: string;
  defaultCurrency: string;
  initial?: SessionFormInitial;
  existing?: PokerSession; // edit mode
  onCreate?: (data: Omit<PokerSessionInsert, "user_id">, initialBuyIn: number) => Promise<string>;
  onUpdate?: (patch: PokerSessionUpdate) => Promise<void>;
  onDone: (id?: string) => void;
}

const numOrNull = (v: string): number | null => (v === "" ? null : Number(v));
const numOr = (v: string, fallback: number): number => (v === "" ? fallback : Number(v));

// ISO <-> <input type="datetime-local"> helpers (local time).
function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function localInputToIso(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

export function SessionForm({
  mode,
  baseCurrency,
  defaultCurrency,
  initial,
  existing,
  onCreate,
  onUpdate,
  onDone,
}: SessionFormProps) {
  const seed = existing ?? initial ?? {};

  const [venue, setVenue] = useState(seed.venue ?? "");
  const [sessionType, setSessionType] = useState<SessionType>(
    (seed.session_type as SessionType) ?? "online"
  );
  const [gameType, setGameType] = useState<GameType>((seed.game_type as GameType) ?? "NLHE");
  const [currency, setCurrency] = useState(seed.currency ?? defaultCurrency);
  const [smallBlind, setSmallBlind] = useState(seed.small_blind?.toString() ?? "");
  const [bigBlind, setBigBlind] = useState(seed.big_blind?.toString() ?? "");
  const [ante, setAnte] = useState(seed.ante?.toString() ?? "");
  const [straddle, setStraddle] = useState(seed.straddle?.toString() ?? "");
  const [maxBuyin, setMaxBuyin] = useState(seed.max_buyin?.toString() ?? "");
  const [fxRate, setFxRate] = useState(
    existing?.fx_rate_to_base?.toString() ?? (currency === baseCurrency ? "1" : "")
  );
  const [fxLoading, setFxLoading] = useState(false);

  // Create-only state
  const [initialBuyin, setInitialBuyin] = useState(
    (initial as SessionFormInitial)?.default_buyin?.toString() ?? ""
  );
  const [entryMode, setEntryMode] = useState<"live" | "backfill">("live");
  const [startedAt, setStartedAt] = useState(isoToLocalInput(existing?.started_at));
  const [endedAt, setEndedAt] = useState(isoToLocalInput(existing?.ended_at));

  // Edit-only result fields
  const [cashOut, setCashOut] = useState(existing?.cash_out?.toString() ?? "");
  const [estHands, setEstHands] = useState(existing?.est_hands?.toString() ?? "");

  const [submitting, setSubmitting] = useState(false);

  // Suggest an FX rate when currency differs from base and the field is blank.
  useEffect(() => {
    let cancelled = false;
    if (currency === baseCurrency) {
      setFxRate("1");
      return;
    }
    if (fxRate !== "" && fxRate !== "1") return; // don't clobber a manual value
    setFxLoading(true);
    fetchSuggestedRate(currency, baseCurrency).then((r) => {
      if (cancelled) return;
      setFxLoading(false);
      if (r !== null) setFxRate(r.toString());
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, baseCurrency]);

  const bbEquivalent = useMemo(() => {
    const bb = Number(bigBlind);
    const buyin = Number(initialBuyin);
    if (!bb || !buyin) return null;
    return buyin / bb;
  }, [bigBlind, initialBuyin]);

  // Net for a backfilled session = cash-out − initial buy-in (re-buys are
  // added later on the detail page). Shown so wins/losses are obvious.
  const backfillNet = useMemo(() => {
    if (cashOut === "" || initialBuyin === "") return null;
    return Number(cashOut) - Number(initialBuyin);
  }, [cashOut, initialBuyin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smallBlind || !bigBlind) {
      toast.error("Small blind and big blind are required.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "create") {
        if (!onCreate) throw new Error("onCreate missing");
        const data: Omit<PokerSessionInsert, "user_id"> = {
          venue: venue || null,
          session_type: sessionType,
          game_type: gameType,
          currency,
          fx_rate_to_base: numOr(fxRate, 1),
          small_blind: Number(smallBlind),
          big_blind: Number(bigBlind),
          ante: numOrNull(ante),
          straddle: numOrNull(straddle),
          max_buyin: numOrNull(maxBuyin),
          started_at:
            entryMode === "live"
              ? new Date().toISOString()
              : localInputToIso(startedAt) ?? new Date().toISOString(),
          ended_at: entryMode === "backfill" ? localInputToIso(endedAt) : null,
          // Backfilled (already-finished) sessions capture the final cash-out
          // and hands up front; live sessions fill these in on cash-out.
          cash_out: entryMode === "backfill" ? numOrNull(cashOut) : null,
          est_hands:
            entryMode === "backfill" && estHands !== ""
              ? Math.round(Number(estHands))
              : null,
        };
        const id = await onCreate(data, Number(initialBuyin) || 0);
        toast.success(entryMode === "live" ? "Session started" : "Session logged");
        onDone(id);
      } else {
        if (!onUpdate) throw new Error("onUpdate missing");
        const patch: PokerSessionUpdate = {
          venue: venue || null,
          session_type: sessionType,
          game_type: gameType,
          currency,
          fx_rate_to_base: numOr(fxRate, 1),
          small_blind: Number(smallBlind),
          big_blind: Number(bigBlind),
          ante: numOrNull(ante),
          straddle: numOrNull(straddle),
          max_buyin: numOrNull(maxBuyin),
          started_at: localInputToIso(startedAt) ?? existing?.started_at,
          ended_at: localInputToIso(endedAt),
          cash_out: numOrNull(cashOut),
          est_hands: estHands === "" ? null : Math.round(Number(estHands)),
        };
        await onUpdate(patch);
        toast.success("Session updated");
        onDone(existing?.id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label: string, node: React.ReactNode) => (
    <div className="space-y-1">
      <Label className="text-xs text-gray-600">{label}</Label>
      {node}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {field(
          "Venue",
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Stake, Rahul's place…" />
        )}
        {field(
          "Type",
          <Select value={sessionType} onValueChange={(v) => setSessionType(v as SessionType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {field(
          "Game",
          <Select value={gameType} onValueChange={(v) => setGameType(v as GameType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GAME_TYPES.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </SelectContent>
          </Select>
        )}
        {field(
          "Currency",
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.code} · {c.symbol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {field("Small blind", <Input type="number" inputMode="decimal" step="any" value={smallBlind} onChange={(e) => setSmallBlind(e.target.value)} />)}
        {field("Big blind", <Input type="number" inputMode="decimal" step="any" value={bigBlind} onChange={(e) => setBigBlind(e.target.value)} />)}
        {field("Ante (opt)", <Input type="number" inputMode="decimal" step="any" value={ante} onChange={(e) => setAnte(e.target.value)} />)}
        {field("Straddle (opt)", <Input type="number" inputMode="decimal" step="any" value={straddle} onChange={(e) => setStraddle(e.target.value)} />)}
        {field("Max buy-in (opt)", <Input type="number" inputMode="decimal" step="any" value={maxBuyin} onChange={(e) => setMaxBuyin(e.target.value)} />)}
        {currency !== baseCurrency &&
          field(
            `FX → ${baseCurrency}`,
            <div className="relative">
              <Input type="number" inputMode="decimal" step="any" value={fxRate} onChange={(e) => setFxRate(e.target.value)} />
              {fxLoading && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
            </div>
          )}
      </div>

      {mode === "create" && (
        <>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Initial buy-in ({currency})</Label>
            <Input type="number" inputMode="decimal" step="any" value={initialBuyin} onChange={(e) => setInitialBuyin(e.target.value)} />
            {bbEquivalent !== null && (
              <p className="text-xs font-medium text-emerald-600">
                {initialBuyin} {currency} = {bbEquivalent.toFixed(1)} BB
              </p>
            )}
          </div>

          <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
            {(["live", "backfill"] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setEntryMode(m)}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                  entryMode === m ? "bg-white shadow text-gray-900" : "text-gray-500"
                }`}
              >
                {m === "live" ? "Start live timer" : "Backfill finished"}
              </button>
            ))}
          </div>

          {entryMode === "backfill" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {field("Started", <Input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />)}
                {field("Ended", <Input type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} />)}
                {field(
                  `Cash out (${currency})`,
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={cashOut}
                    onChange={(e) => setCashOut(e.target.value)}
                    placeholder="0 if you lost it all"
                  />
                )}
                {field("Est. hands", <Input type="number" inputMode="numeric" value={estHands} onChange={(e) => setEstHands(e.target.value)} />)}
              </div>
              {backfillNet !== null && (
                <p
                  className={`text-sm font-semibold ${
                    backfillNet >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  Net: {formatMoney(backfillNet, currency, { signed: true })}
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (cash-out − initial buy-in; re-buys added later)
                  </span>
                </p>
              )}
            </>
          )}
        </>
      )}

      {mode === "edit" && (
        <div className="grid grid-cols-2 gap-3">
          {field("Started", <Input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />)}
          {field("Ended", <Input type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} />)}
          {field(`Cash out (${currency})`, <Input type="number" inputMode="decimal" step="any" value={cashOut} onChange={(e) => setCashOut(e.target.value)} />)}
          {field("Est. hands", <Input type="number" inputMode="numeric" value={estHands} onChange={(e) => setEstHands(e.target.value)} />)}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => onDone()} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? (entryMode === "live" ? "Start session" : "Log session") : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export default SessionForm;
