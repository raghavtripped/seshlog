// Notable-hands editor for a session.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useKeyHands } from "../api/useKeyHands";
import { formatMoney } from "../lib/currencies";
import { KEY_HAND_TAGS, type KeyHandTag } from "../lib/types";

interface KeyHandListProps {
  sessionId: string;
  currency: string;
}

const tagColors: Record<string, string> = {
  bluff: "bg-purple-100 text-purple-700",
  value: "bg-emerald-100 text-emerald-700",
  cooler: "bg-blue-100 text-blue-700",
  mistake: "bg-red-100 text-red-700",
  fold: "bg-gray-100 text-gray-600",
  other: "bg-amber-100 text-amber-700",
};

export function KeyHandList({ sessionId, currency }: KeyHandListProps) {
  const { keyHands, addKeyHand, deleteKeyHand } = useKeyHands(sessionId);
  const [open, setOpen] = useState(false);
  const [holeCards, setHoleCards] = useState("");
  const [board, setBoard] = useState("");
  const [position, setPosition] = useState("");
  const [potSize, setPotSize] = useState("");
  const [resultAmount, setResultAmount] = useState("");
  const [tag, setTag] = useState<KeyHandTag>("other");
  const [note, setNote] = useState("");

  const reset = () => {
    setHoleCards(""); setBoard(""); setPosition(""); setPotSize(""); setResultAmount(""); setTag("other"); setNote("");
  };

  const add = async () => {
    try {
      await addKeyHand({
        hole_cards: holeCards || null,
        board: board || null,
        position: position || null,
        pot_size: potSize === "" ? null : Number(potSize),
        result_amount: resultAmount === "" ? null : Number(resultAmount),
        tag,
        note: note || null,
      });
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add hand");
    }
  };

  return (
    <Card className="border-none bg-white/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Key hands</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {keyHands.map((h) => (
          <div key={h.id} className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {h.tag && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tagColors[h.tag] ?? tagColors.other}`}>
                    {h.tag}
                  </span>
                )}
                <span className="font-mono font-semibold">{h.hole_cards || "?"}</span>
                {h.board && <span className="font-mono text-gray-500">on {h.board}</span>}
                {h.position && <span className="text-gray-400">({h.position})</span>}
              </div>
              <button onClick={() => deleteKeyHand(h.id).catch(() => toast.error("Delete failed"))} className="text-gray-300 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {(h.result_amount !== null || h.pot_size !== null) && (
              <p className="mt-1 text-xs text-gray-500">
                {h.result_amount !== null && (
                  <span className={Number(h.result_amount) >= 0 ? "text-emerald-600" : "text-red-600"}>
                    {formatMoney(Number(h.result_amount), currency, { signed: true })}
                  </span>
                )}
                {h.pot_size !== null && <span> · pot {formatMoney(Number(h.pot_size), currency)}</span>}
              </p>
            )}
            {h.note && <p className="mt-1 text-gray-600">{h.note}</p>}
          </div>
        ))}
        {keyHands.length === 0 && !open && <p className="text-sm text-gray-400">No hands logged.</p>}

        {open && (
          <div className="space-y-3 rounded-lg border border-dashed border-gray-300 p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Hole cards</Label>
                <Input value={holeCards} onChange={(e) => setHoleCards(e.target.value)} placeholder="AhKs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Board</Label>
                <Input value={board} onChange={(e) => setBoard(e.target.value)} placeholder="Kc7d2s" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Position</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="BTN" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tag</Label>
                <Select value={tag} onValueChange={(v) => setTag(v as KeyHandTag)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KEY_HAND_TAGS.map((t) => (<SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pot size</Label>
                <Input type="number" step="any" value={potSize} onChange={(e) => setPotSize(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Result (±)</Label>
                <Input type="number" step="any" value={resultAmount} onChange={(e) => setResultAmount(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Note</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end">
              <Button onClick={add} size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                Save hand
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default KeyHandList;
