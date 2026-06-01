// Poker dashboard: headline stats, cumulative profit graph, live banner,
// recent sessions, and a global filter that drives every aggregate.

import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, PlusCircle, ChevronRight } from "lucide-react";
import { PokerLayout } from "@/features/poker/components/PokerLayout";
import { StatCards } from "@/features/poker/components/StatCards";
import { ProfitChart } from "@/features/poker/components/ProfitChart";
import { FilterBar } from "@/features/poker/components/FilterBar";
import { LiveSessionBanner } from "@/features/poker/components/LiveSessionBanner";
import { usePokerSessions } from "@/features/poker/api/usePokerSessions";
import { usePokerProfile } from "@/features/poker/api/usePokerProfile";
import { aggregate, applyFilter } from "@/features/poker/lib/metrics";
import { formatMoney } from "@/features/poker/lib/currencies";
import type { PokerFilter, SessionWithStats } from "@/features/poker/lib/types";

function sessionDateLabel(s: SessionWithStats): string {
  if (!s.started_at) return "";
  return new Date(s.started_at).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PokerDashboard = () => {
  const navigate = useNavigate();
  const { sessions, liveSession, isLoading } = usePokerSessions();
  const { baseCurrency } = usePokerProfile();
  const [filter, setFilter] = useState<PokerFilter>({});

  const filtered = useMemo(() => applyFilter(sessions, filter), [sessions, filter]);
  const stats = useMemo(() => aggregate(filtered), [filtered]);
  const recent = filtered.slice(0, 8);

  return (
    <PokerLayout
      title="Poker"
      subtitle="Cash-game tracker"
      actions={
        <Button
          onClick={() => navigate("/poker/log")}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
        >
          <PlusCircle className="mr-1.5 h-4 w-4" /> New
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          {liveSession && <LiveSessionBanner session={liveSession} />}

          <FilterBar sessions={sessions} filter={filter} onChange={setFilter} />

          <StatCards stats={stats} baseCurrency={baseCurrency} />

          <ProfitChart sessions={filtered} baseCurrency={baseCurrency} />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Recent sessions</h2>
              <Link to="/poker/sessions" className="text-sm text-emerald-600">
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <Card className="border-none bg-white/80 shadow-sm">
                <CardContent className="p-6 text-center text-sm text-gray-400">
                  No sessions yet. Tap <span className="font-medium">New</span> to log one.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {recent.map((s) => {
                  const net = s.net_base;
                  return (
                    <Link key={s.id} to={`/poker/sessions/${s.id}`}>
                      <Card className="border-none bg-white/80 shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center justify-between p-3">
                          <div>
                            <p className="font-medium text-gray-800">
                              {s.venue || "Session"}{" "}
                              <span className="text-xs font-normal text-gray-400">
                                {s.small_blind}/{s.big_blind} {s.currency}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {sessionDateLabel(s)}
                              {!s.ended_at && s.cash_out === null && (
                                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                  live
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                net === null
                                  ? "text-gray-400"
                                  : net >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {net === null ? "—" : formatMoney(net, baseCurrency, { signed: true })}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-300" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </PokerLayout>
  );
};

export default PokerDashboard;
