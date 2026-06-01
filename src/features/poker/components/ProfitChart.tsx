// Cumulative profit line chart (base currency ↔ big blinds toggle).
// Uses recharts, already a dependency used elsewhere in the app.

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cumulativeProfitSeries } from "../lib/metrics";
import { formatMoney, formatBB } from "../lib/currencies";
import type { SessionWithStats } from "../lib/types";

interface ProfitChartProps {
  sessions: SessionWithStats[];
  baseCurrency: string;
}

export function ProfitChart({ sessions, baseCurrency }: ProfitChartProps) {
  const [mode, setMode] = useState<"base" | "bb">("base");
  const data = useMemo(() => cumulativeProfitSeries(sessions, mode), [sessions, mode]);

  const last = data.length ? data[data.length - 1].cumulative : 0;
  const positive = last >= 0;
  const stroke = positive ? "#059669" : "#dc2626";
  const fmt = (v: number) =>
    mode === "bb" ? formatBB(v) : formatMoney(v, baseCurrency, { signed: true });

  return (
    <Card className="border-none bg-white/80 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-gray-800">
          Cumulative profit
        </CardTitle>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5">
          {(["base", "bb"] as const).map((m) => (
            <Button
              key={m}
              size="sm"
              variant="ghost"
              onClick={() => setMode(m)}
              className={cn(
                "h-7 px-2 text-xs",
                mode === m && "bg-white shadow text-gray-900"
              )}
            >
              {m === "base" ? baseCurrency : "BB"}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-gray-400">
            No completed sessions yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#9ca3af"
                width={56}
                tickFormatter={(v) =>
                  mode === "bb" ? `${v}` : new Intl.NumberFormat().format(v as number)
                }
              />
              <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="2 2" />
              <Tooltip
                formatter={(value: number) => [fmt(value), "Cumulative"]}
                labelFormatter={(l) => `Session @ ${l}`}
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={stroke}
                strokeWidth={2}
                fill="url(#profitFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfitChart;
