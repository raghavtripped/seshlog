// Saved stake presets: tap a chip to prefill the log form; create/delete presets.

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { CURRENCIES } from "../lib/currencies";
import { usePresets } from "../api/usePresets";
import {
  GAME_TYPES,
  SESSION_TYPES,
  type GameType,
  type Preset,
  type SessionType,
} from "../lib/types";

interface PresetPickerProps {
  defaultCurrency: string;
  onApply: (preset: Preset) => void;
}

export function PresetPicker({ defaultCurrency, onApply }: PresetPickerProps) {
  const { presets, createPreset, deletePreset } = usePresets();
  const [open, setOpen] = useState(false);

  const [label, setLabel] = useState("");
  const [venue, setVenue] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("online");
  const [gameType, setGameType] = useState<GameType>("NLHE");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [sb, setSb] = useState("");
  const [bb, setBb] = useState("");
  const [defaultBuyin, setDefaultBuyin] = useState("");
  const [maxBuyin, setMaxBuyin] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setLabel(""); setVenue(""); setSb(""); setBb(""); setDefaultBuyin(""); setMaxBuyin("");
  };

  const save = async () => {
    if (!label || !sb || !bb) {
      toast.error("Label, small blind and big blind are required.");
      return;
    }
    setSaving(true);
    try {
      await createPreset({
        label,
        venue: venue || null,
        session_type: sessionType,
        game_type: gameType,
        currency,
        small_blind: Number(sb),
        big_blind: Number(bb),
        default_buyin: defaultBuyin === "" ? null : Number(defaultBuyin),
        max_buyin: maxBuyin === "" ? null : Number(maxBuyin),
      });
      toast.success("Preset saved");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save preset");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((p) => (
        <div
          key={p.id}
          className="group flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm ring-1 ring-gray-200"
        >
          <button onClick={() => onApply(p)} className="font-medium text-gray-700">
            {p.label}
          </button>
          <button
            onClick={() => deletePreset(p.id).catch(() => toast.error("Delete failed"))}
            className="text-gray-300 transition hover:text-red-500"
            aria-label={`Delete ${p.label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            <Plus className="mr-1 h-4 w-4" /> New preset
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New stake preset</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Stake $0.01/$0.02" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Venue</Label>
              <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={sessionType} onValueChange={(v) => setSessionType(v as SessionType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SESSION_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Game</Label>
              <Select value={gameType} onValueChange={(v) => setGameType(v as GameType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GAME_TYPES.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (<SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Small blind</Label>
              <Input type="number" step="any" value={sb} onChange={(e) => setSb(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Big blind</Label>
              <Input type="number" step="any" value={bb} onChange={(e) => setBb(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Default buy-in</Label>
              <Input type="number" step="any" value={defaultBuyin} onChange={(e) => setDefaultBuyin(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max buy-in</Label>
              <Input type="number" step="any" value={maxBuyin} onChange={(e) => setMaxBuyin(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              Save preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PresetPicker;
