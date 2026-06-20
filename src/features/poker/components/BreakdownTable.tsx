// A grouped performance breakdown (by venue / stake / type / etc.).

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { groupBy } from "../lib/metrics";
import { formatMoney } from "../lib/currencies";
import { MetricHint } from "./MetricHint";
import type { GroupByKey, SessionWithStats } from "../lib/types";

interface BreakdownTableProps {
  title: string;
  sessions: SessionWithStats[];
  groupKey: GroupByKey;
  baseCurrency: string;
}

// Compact cell styling so all columns fit inside the card without sideways scroll.
const headCls = "h-8 px-2 text-xs";
const cellCls = "px-2 py-1.5 text-xs whitespace-nowrap";

export function BreakdownTable({ title, sessions, groupKey, baseCurrency }: BreakdownTableProps) {
  const rows = groupBy(sessions, groupKey);

  return (
    <Card className="border-none bg-white/80 shadow-sm">
      <CardHeader className="px-3 pb-1 pt-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">No data.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={headCls}>
                  <MetricHint label="Group" hint="The category this row aggregates — depending on the table, that's a venue, stake level, game type, weekday or currency. Every figure to the right is summed across just that group's sessions." />
                </TableHead>
                <TableHead className={cn(headCls, "text-right")}>
                  <MetricHint label="Net" hint="Total profit or loss for this group, summed across all its sessions. Sessions in other currencies are converted to your base currency at each session's exchange rate, so the totals stay comparable." />
                </TableHead>
                <TableHead className={cn(headCls, "text-right")}>
                  <MetricHint label="BB/100" hint="Big blinds won per 100 hands — poker's standard win rate. It divides winnings by the big blind and scales to 100 hands, so results compare fairly across stakes and session lengths. Positive means winning; for online cash, roughly 5+ bb/100 is a solid rate." />
                </TableHead>
                <TableHead className={cn(headCls, "text-right")}>
                  <MetricHint label="Hours" hint="Total time spent playing in this group, summed from each session's start and end times. It's the denominator behind the hourly rate." />
                </TableHead>
                <TableHead className={cn(headCls, "text-right")}>
                  <MetricHint label="/hr" hint="Your hourly rate — net result divided by hours played, in your base currency. Shows how much you win or lose per hour at the table. It swings wildly over a small number of hours, so treat short samples with caution." />
                </TableHead>
                <TableHead className={cn(headCls, "text-right")}>
                  <MetricHint label="#" hint="Number of sessions in this group — your sample size. The smaller it is, the noisier the win rate and hourly figures are." />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.key}>
                  <TableCell className={cn(cellCls, "font-medium")}>{r.key}</TableCell>
                  <TableCell className={cn(cellCls, "text-right font-semibold", r.netBase >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {formatMoney(r.netBase, baseCurrency, { signed: true })}
                  </TableCell>
                  <TableCell className={cn(cellCls, "text-right")}>{r.bbPer100 === null ? "—" : r.bbPer100.toFixed(1)}</TableCell>
                  <TableCell className={cn(cellCls, "text-right")}>{r.hours.toFixed(1)}</TableCell>
                  <TableCell className={cn(cellCls, "text-right")}>{r.perHour === null ? "—" : formatMoney(r.perHour, baseCurrency, { signed: true })}</TableCell>
                  <TableCell className={cn(cellCls, "text-right")}>{r.sessionCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default BreakdownTable;
