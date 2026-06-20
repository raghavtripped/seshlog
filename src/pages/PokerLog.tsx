// Log a new session: pick a preset (optional) to prefill, then fill the form.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PokerLayout } from "@/features/poker/components/PokerLayout";
import { PresetPicker } from "@/features/poker/components/PresetPicker";
import { SessionForm, type SessionFormInitial } from "@/features/poker/components/SessionForm";
import { usePokerSessions } from "@/features/poker/api/usePokerSessions";
import { usePokerProfile } from "@/features/poker/api/usePokerProfile";
import { normalizeVenue } from "@/features/poker/lib/metrics";
import type { Preset } from "@/features/poker/lib/types";

const PokerLog = () => {
  const navigate = useNavigate();
  const { createSession } = usePokerSessions();
  const { baseCurrency, defaultCurrency } = usePokerProfile();

  const [initial, setInitial] = useState<SessionFormInitial>({});
  // Bump to force the form to re-seed when a preset is applied.
  const [formKey, setFormKey] = useState(0);

  const applyPreset = (p: Preset) => {
    setInitial({
      // Fall back to the preset's label as the venue when no explicit venue is
      // set, so naming a preset after the venue ("Stake") carries through.
      venue: normalizeVenue(p.venue) ?? p.label,
      session_type: (p.session_type as SessionFormInitial["session_type"]) ?? undefined,
      game_type: (p.game_type as SessionFormInitial["game_type"]) ?? undefined,
      currency: p.currency ?? undefined,
      small_blind: p.small_blind ?? undefined,
      big_blind: p.big_blind ?? undefined,
      ante: p.ante,
      straddle: p.straddle,
      max_buyin: p.max_buyin,
      default_buyin: p.default_buyin,
    });
    setFormKey((k) => k + 1);
  };

  return (
    <PokerLayout title="Log session" subtitle="Fast entry">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">Presets</p>
        <PresetPicker defaultCurrency={defaultCurrency} onApply={applyPreset} />
      </div>

      <Card className="border-none bg-white/80 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <SessionForm
            key={formKey}
            mode="create"
            baseCurrency={baseCurrency}
            defaultCurrency={defaultCurrency}
            initial={initial}
            onCreate={createSession}
            onDone={(id) => navigate(id ? `/poker/sessions/${id}` : "/poker")}
          />
        </CardContent>
      </Card>
    </PokerLayout>
  );
};

export default PokerLog;
