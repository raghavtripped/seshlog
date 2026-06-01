// Post-session reflection: mood, focus, sleep, tilt, free notes.
// Saves directly via the provided onSave (wired to updateSession).

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PokerSession, PokerSessionUpdate } from "../lib/types";

interface ReflectionFormProps {
  session: PokerSession;
  onSave: (patch: PokerSessionUpdate) => Promise<void>;
}

function Scale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "h-9 w-9 rounded-lg text-sm font-semibold transition",
            value === n
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export function ReflectionForm({ session, onSave }: ReflectionFormProps) {
  const [mood, setMood] = useState<number | null>(session.mood ?? null);
  const [focus, setFocus] = useState<number | null>(session.focus ?? null);
  const [sleep, setSleep] = useState(session.sleep_hours?.toString() ?? "");
  const [tilt, setTilt] = useState<boolean>(session.tilt ?? false);
  const [notes, setNotes] = useState(session.notes ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({
        mood,
        focus,
        sleep_hours: sleep === "" ? null : Number(sleep),
        tilt,
        notes: notes || null,
      });
      toast.success("Reflection saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-none bg-white/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Reflection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Mood</Label>
          <Scale value={mood} onChange={setMood} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Focus</Label>
          <Scale value={focus} onChange={setFocus} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Sleep (hours)</Label>
          <Input
            type="number"
            step="any"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            className="w-24"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Felt tilted</Label>
          <Switch checked={tilt} onCheckedChange={setTilt} />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            Save reflection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReflectionForm;
