// Headline metric cards for the dashboard. All money in base currency.

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney } from "../lib/currencies";
import type { DashboardStats } from "../lib/types";

interface StatCardsProps {
  stats: DashboardStats;
  baseCurrency: string;
}

function fmtNum(v: number | null, decimals = 1, suffix = ""): string {
  if (v === null || Number.isNaN(v)) return "—";
  return `${v.toFixed(decimals)}${suffix}`;
}

export function StatCards({ stats, baseCurrency }: StatCardsProps) {
  const cards: { label: string; value: string; tone?: "pos" | "neg" | "neutral" }[] = [
    {
      label: "Net profit",
      value: formatMoney(stats.netBase, baseCurrency, { signed: true }),
      tone: stats.netBase > 0 ? "pos" : stats.netBase < 0 ? "neg" : "neutral",
    },
    { label: "Hours", value: fmtNum(stats.hours, 1) },
    {
      label: `${baseCurrency}/hour`,
      value: stats.perHour === null ? "—" : formatMoney(stats.perHour, baseCurrency, { signed: true }),
      tone: (stats.perHour ?? 0) > 0 ? "pos" : (stats.perHour ?? 0) < 0 ? "neg" : "neutral",
    },
    {
      label: "BB/100",
      value: fmtNum(stats.bbPer100, 2),
      tone: (stats.bbPer100 ?? 0) > 0 ? "pos" : (stats.bbPer100 ?? 0) < 0 ? "neg" : "neutral",
    },
    { label: "Hands", value: stats.totalHands.toLocaleString() },
    { label: "Sessions", value: String(stats.sessionCount) },
    {
      label: "Biggest win",
      value: formatMoney(stats.biggestWin, baseCurrency, { signed: true }),
      tone: "pos",
    },
    {
      label: "Biggest loss",
      value: formatMoney(stats.biggestLoss, baseCurrency, { signed: true }),
      tone: "neg",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="border-none bg-white/80 shadow-sm backdrop-blur">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-500">{c.label}</p>
            <p
              className={cn(
                "mt-1 text-lg font-bold sm:text-xl",
                c.tone === "pos" && "text-emerald-600",
                c.tone === "neg" && "text-red-600",
                (!c.tone || c.tone === "neutral") && "text-gray-800"
              )}
            >
              {c.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default StatCards;
