// Analytics: grouped breakdowns, reflection correlation, settings, data export.

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PokerLayout } from "@/features/poker/components/PokerLayout";
import { FilterBar } from "@/features/poker/components/FilterBar";
import { BreakdownTable } from "@/features/poker/components/BreakdownTable";
import { MetricHint } from "@/features/poker/components/MetricHint";
import { usePokerSessions } from "@/features/poker/api/usePokerSessions";
import { usePokerProfile } from "@/features/poker/api/usePokerProfile";
import { applyFilter, bucketByReflection, type ReflectionDimension } from "@/features/poker/lib/metrics";
import { CURRENCIES, formatMoney } from "@/features/poker/lib/currencies";
import type { PokerFilter, SessionWithStats } from "@/features/poker/lib/types";

function ReflectionTable({
  title,
  sessions,
  dimension,
  baseCurrency,
}: {
  title: string;
  sessions: SessionWithStats[];
  dimension: ReflectionDimension;
  baseCurrency: string;
}) {
  const rows = bucketByReflection(sessions, dimension);
  return (
    <Card className="border-none bg-white/80 shadow-sm">
      <CardHeader className="px-3 pb-1 pt-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">No data.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 px-2 text-xs">Bucket</TableHead>
                <TableHead className="h-8 px-2 text-right text-xs">
                  <MetricHint
                    label="Avg net"
                    hint="Average net per session for sessions in this bucket — a per-session mean, not a total or your best session. Averaging keeps buckets comparable even when they have very different session counts."
                  />
                </TableHead>
                <TableHead className="h-8 px-2 text-right text-xs">
                  <MetricHint label="#" hint="Number of sessions in this bucket." />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.bucket}>
                  <TableCell className="whitespace-nowrap px-2 py-1.5 text-xs">{r.bucket}</TableCell>
                  <TableCell className={`whitespace-nowrap px-2 py-1.5 text-right text-xs font-semibold ${(r.avgNetBase ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {r.avgNetBase === null ? "—" : formatMoney(r.avgNetBase, baseCurrency, { signed: true })}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-1.5 text-right text-xs">{r.sessionCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

const PokerAnalytics = () => {
  const { sessions, isLoading } = usePokerSessions();
  const { profile, baseCurrency, defaultCurrency, updateProfile } = usePokerProfile();
  const [filter, setFilter] = useState<PokerFilter>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const filtered = useMemo(() => applyFilter(sessions, filter), [sessions, filter]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poker-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${sessions.length} sessions`);
  };

  const saveSettings = async (patch: Parameters<typeof updateProfile>[0]) => {
    setSavingSettings(true);
    try {
      await updateProfile(patch);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <PokerLayout title="Analytics" subtitle="Breakdowns & leaks">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          <FilterBar sessions={sessions} filter={filter} onChange={setFilter} />

          <div className="grid gap-4 md:grid-cols-2">
            <BreakdownTable title="By venue" sessions={filtered} groupKey="venue" baseCurrency={baseCurrency} />
            <BreakdownTable title="By stake" sessions={filtered} groupKey="stake" baseCurrency={baseCurrency} />
            <BreakdownTable title="By session type" sessions={filtered} groupKey="session_type" baseCurrency={baseCurrency} />
            <BreakdownTable title="By game type" sessions={filtered} groupKey="game_type" baseCurrency={baseCurrency} />
            <BreakdownTable title="By day of week" sessions={filtered} groupKey="day_of_week" baseCurrency={baseCurrency} />
            <BreakdownTable title="By currency" sessions={filtered} groupKey="currency" baseCurrency={baseCurrency} />
          </div>

          <h2 className="flex items-center pt-2 text-sm font-semibold text-gray-700">
            <MetricHint
              label="Reflection correlation"
              hint="How your self-rated mood, focus, sleep, and tilt relate to results. Values are average net per session, so a bucket isn't ranked higher just because it has more sessions."
            />
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ReflectionTable title="By mood" sessions={filtered} dimension="mood" baseCurrency={baseCurrency} />
            <ReflectionTable title="By focus" sessions={filtered} dimension="focus" baseCurrency={baseCurrency} />
            <ReflectionTable title="By sleep" sessions={filtered} dimension="sleep_hours" baseCurrency={baseCurrency} />
            <ReflectionTable title="By tilt" sessions={filtered} dimension="tilt" baseCurrency={baseCurrency} />
          </div>

          {/* Settings */}
          <h2 className="pt-2 text-sm font-semibold text-gray-700">Settings</h2>
          <Card className="border-none bg-white/80 shadow-sm">
            <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Base currency</Label>
                <Select value={baseCurrency} onValueChange={(v) => saveSettings({ base_currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (<SelectItem key={c.code} value={c.code}>{c.code} · {c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Default currency</Label>
                <Select value={defaultCurrency} onValueChange={(v) => saveSettings({ default_currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (<SelectItem key={c.code} value={c.code}>{c.code} · {c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Timezone</Label>
                <Input
                  defaultValue={profile?.timezone ?? "Asia/Kolkata"}
                  onBlur={(e) => {
                    if (e.target.value && e.target.value !== profile?.timezone) {
                      saveSettings({ timezone: e.target.value });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={exportJson} disabled={savingSettings}>
              <Download className="mr-2 h-4 w-4" /> Export sessions (JSON)
            </Button>
          </div>
        </>
      )}
    </PokerLayout>
  );
};

export default PokerAnalytics;
