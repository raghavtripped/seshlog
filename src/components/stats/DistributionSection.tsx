import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Descriptive, SessionStatistics, THRESHOLDS } from '@/lib/sessionStatistics';
import { StatsSection, StatTile } from './StatTile';
import { EM_DASH, decimalsForUnit, formatNumber } from './statsFormat';

interface Row {
  label: string;
  hint: string;
  /** Pulls the value out of a Descriptive; null renders an em dash. */
  get: (d: Descriptive) => number | null;
  /** Unitless quantities (counts, ratios, skew) use their own precision. */
  decimals?: number;
  unitless?: boolean;
}

const ROWS: Row[] = [
  { label: 'Count (n)', hint: 'How many values went into the column', get: (d) => d.n, decimals: 0, unitless: true },
  { label: 'Sum', hint: 'Total across the period', get: (d) => d.sum },
  { label: 'Mean', hint: 'The arithmetic average', get: (d) => d.mean },
  { label: 'Median', hint: 'The middle value — unmoved by extremes', get: (d) => d.median },
  { label: 'Mode', hint: 'Most frequently repeated value', get: (d) => d.mode },
  { label: 'Std deviation', hint: 'Typical distance from the mean (sample, n−1)', get: (d) => d.stdDev },
  { label: 'Variance', hint: 'Std deviation squared', get: (d) => d.variance },
  { label: 'Coeff. of variation', hint: 'Std deviation ÷ mean — spread on a comparable scale', get: (d) => d.cv, decimals: 2, unitless: true },
  { label: 'Minimum', hint: 'Smallest value', get: (d) => d.min },
  { label: 'Q1 (25th pct)', hint: 'A quarter of values fall below this', get: (d) => d.q1 },
  { label: 'Q3 (75th pct)', hint: 'Three quarters of values fall below this', get: (d) => d.q3 },
  { label: 'IQR', hint: 'Q3 − Q1, the spread of the middle half', get: (d) => d.iqr },
  { label: 'Maximum', hint: 'Largest value', get: (d) => d.max },
  { label: '90th percentile', hint: 'Only 10% of values exceed this', get: (d) => d.p90 },
  { label: '95th percentile', hint: 'Only 5% of values exceed this', get: (d) => d.p95 },
  { label: 'Skew', hint: 'Positive means a long tail of unusually large values', get: (d) => d.skew, decimals: 2, unitless: true },
];

interface DistributionSectionProps {
  stats: SessionStatistics;
  unit: string;
  gradient: string;
}

export const DistributionSection = ({ stats, unit, gradient }: DistributionSectionProps) => {
  const decimals = decimalsForUnit(unit);

  const render = (row: Row, d: Descriptive) => {
    const value = row.get(d);
    if (value === null) return EM_DASH;
    return formatNumber(value, row.decimals ?? decimals);
  };

  const { ratingCorrelation, averageRating } = stats;

  return (
    <StatsSection
      title="All statistics"
      description="The full descriptive picture, per session and per day"
      emoji="🔬"
      gradient={gradient}
    >
      <div className="glass-card overflow-x-auto p-2 sm:p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Statistic</TableHead>
              <TableHead className="text-right">Per session ({unit})</TableHead>
              <TableHead className="text-right">Per day ({unit})</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                  {row.label}
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-500">
                    {row.hint}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {render(row, stats.perSession)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {render(row, stats.perDay)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 px-2 text-xs text-gray-500 dark:text-gray-500">
          "Per day" covers every calendar day in the range, including days with no sessions.
          "Per session" covers only logged sessions. Amounts are your individual share,
          normalized to {unit}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatTile
          label="Average rating"
          value={averageRating === null ? EM_DASH : formatNumber(averageRating, 1)}
          hint="across rated sessions"
        />
        <StatTile
          label="Dose ↔ rating"
          value={ratingCorrelation === null ? EM_DASH : formatNumber(ratingCorrelation, 2)}
          hint={
            ratingCorrelation === null
              ? `needs ${THRESHOLDS.correlation}+ rated sessions`
              : ratingCorrelation > 0.3
                ? 'bigger sessions tend to rate higher'
                : ratingCorrelation < -0.3
                  ? 'bigger sessions tend to rate lower'
                  : 'little relationship between size and rating'
          }
        />
      </div>
    </StatsSection>
  );
};
