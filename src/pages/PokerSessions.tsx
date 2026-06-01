// Full filterable list of sessions.

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ChevronRight } from "lucide-react";
import { PokerLayout } from "@/features/poker/components/PokerLayout";
import { FilterBar } from "@/features/poker/components/FilterBar";
import { usePokerSessions } from "@/features/poker/api/usePokerSessions";
import { usePokerProfile } from "@/features/poker/api/usePokerProfile";
import { applyFilter } from "@/features/poker/lib/metrics";
import { formatMoney, formatBB } from "@/features/poker/lib/currencies";
import type { PokerFilter } from "@/features/poker/lib/types";

const PokerSessions = () => {
  const { sessions, isLoading } = usePokerSessions();
  const { baseCurrency } = usePokerProfile();
  const [filter, setFilter] = useState<PokerFilter>({});

  const filtered = useMemo(() => applyFilter(sessions, filter), [sessions, filter]);

  return (
    <PokerLayout title="Sessions" subtitle={`${filtered.length} session${filtered.length === 1 ? "" : "s"}`}>
      <FilterBar sessions={sessions} filter={filter} onChange={setFilter} />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-none bg-white/80 shadow-sm">
          <CardContent className="p-6 text-center text-sm text-gray-400">No sessions match.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const net = s.net_base;
            const live = !s.ended_at && s.cash_out === null;
            return (
              <Link key={s.id} to={`/poker/sessions/${s.id}`}>
                <Card className="border-none bg-white/80 shadow-sm transition hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        {s.venue || "Session"}{" "}
                        <span className="text-xs font-normal capitalize text-gray-400">· {s.session_type} · {s.game_type}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.started_at && new Date(s.started_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        {" · "}
                        {s.small_blind}/{s.big_blind} {s.currency}
                        {live && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">live</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <p className={`font-semibold ${net === null ? "text-gray-400" : net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {net === null ? "—" : formatMoney(net, baseCurrency, { signed: true })}
                        </p>
                        {s.bb_won !== null && <p className="text-xs text-gray-400">{formatBB(s.bb_won)}</p>}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </PokerLayout>
  );
};

export default PokerSessions;
