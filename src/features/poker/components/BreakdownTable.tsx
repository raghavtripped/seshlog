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
import type { GroupByKey, SessionWithStats } from "../lib/types";

interface BreakdownTableProps {
  title: string;
  sessions: SessionWithStats[];
  groupKey: GroupByKey;
  baseCurrency: string;
}

export function BreakdownTable({ title, sessions, groupKey, baseCurrency }: BreakdownTableProps) {
  const rows = groupBy(sessions, groupKey);

  return (
    <Card className="border-none bg-white/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">No data.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Group</TableHead>
                <TableHead className="text-right text-xs">Net</TableHead>
                <TableHead className="text-right text-xs">BB/100</TableHead>
                <TableHead className="text-right text-xs">Hours</TableHead>
                <TableHead className="text-right text-xs">/hr</TableHead>
                <TableHead className="text-right text-xs">#</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.key}>
                  <TableCell className="font-medium">{r.key}</TableCell>
                  <TableCell className={cn("text-right font-semibold", r.netBase >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {formatMoney(r.netBase, baseCurrency, { signed: true })}
                  </TableCell>
                  <TableCell className="text-right">{r.bbPer100 === null ? "—" : r.bbPer100.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{r.hours.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{r.perHour === null ? "—" : formatMoney(r.perHour, baseCurrency, { signed: true })}</TableCell>
                  <TableCell className="text-right">{r.sessionCount}</TableCell>
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
