// Banner shown on the dashboard when a session is currently live (no end yet).
// Shows a running timer and a quick link to end/cash out on the detail page.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Radio } from "lucide-react";
import type { SessionWithStats } from "../lib/types";

function elapsed(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function LiveSessionBanner({ session }: { session: SessionWithStats }) {
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  // Re-render every 30s so the timer stays current.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <Radio className="h-5 w-5 animate-pulse" />
        <div>
          <p className="text-sm font-semibold">
            Live at {session.venue || "table"} · {session.started_at ? elapsed(session.started_at) : ""}
          </p>
          <p className="text-xs text-white/80">
            {session.small_blind}/{session.big_blind} {session.currency}
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(`/poker/sessions/${session.id}`)}
        className="bg-white text-emerald-700 hover:bg-white/90"
      >
        Cash out / End
      </Button>
    </div>
  );
}

export default LiveSessionBanner;
