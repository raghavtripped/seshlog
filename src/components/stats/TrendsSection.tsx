import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { rollingMean } from '@/lib/stats';
import { SessionStatistics, THRESHOLDS } from '@/lib/sessionStatistics';
import { StatsSection, StatTile } from './StatTile';
import {
  EM_DASH,
  TREND_COLOR,
  decimalsForUnit,
  formatDays,
  formatNumber,
  formatWithUnit,
} from './statsFormat';

const ROLLING_WINDOW = 7;

interface TrendsSectionProps {
  stats: SessionStatistics;
  unit: string;
  color: string;
  gradient: string;
}

interface ChartRow {
  label: string;
  daily: number;
  rolling: number | null;
}

const TrendTooltip = ({
  active,
  payload,
  label,
  unit,
  decimals,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | null; color?: string }[];
  label?: string;
  unit: string;
  decimals: number;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800/95">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm text-gray-600 dark:text-gray-400">
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          {entry.name}:{' '}
          <span className="font-semibold tabular-nums">
            {entry.value === null || entry.value === undefined
              ? EM_DASH
              : `${entry.value.toFixed(decimals)} ${unit}`}
          </span>
        </p>
      ))}
    </div>
  );
};

export const TrendsSection = ({ stats, unit, color, gradient }: TrendsSectionProps) => {
  const decimals = decimalsForUnit(unit);

  const chartData = useMemo<ChartRow[]>(() => {
    const rolling = rollingMean(stats.series.dailyTotals, ROLLING_WINDOW);
    return stats.series.days.map((day, i) => ({
      label: day.label,
      daily: day.total,
      rolling: rolling[i],
    }));
  }, [stats.series]);

  const { summary, comparison, trend, streaks } = stats;

  return (
    <StatsSection
      title="Trends"
      description="Where your usage is heading, and how this period compares to the last one"
      emoji="📈"
      gradient={gradient}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Total this period"
          value={formatWithUnit(summary.total, unit, decimals)}
          change={comparison.total.change}
          hint={`over ${formatDays(summary.dayCount)}`}
        />
        <StatTile
          label="Sessions"
          value={String(summary.sessionCount)}
          change={comparison.sessionCount.change}
          hint={`${formatNumber(summary.sessionsPerDay, 2)} per day`}
        />
        <StatTile
          label="Avg per day"
          value={formatWithUnit(summary.averagePerDay, unit, decimals)}
          hint="counting days with none"
        />
        <StatTile
          label="Avg per session"
          value={formatWithUnit(summary.averagePerSession, unit, decimals)}
          change={comparison.averagePerSession.change}
          hint="typical dose size"
        />
      </div>

      <div className="glass-card p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Daily total ({unit})
          </h3>
          {trend && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {trend.direction === 'flat' ? (
                'Holding steady'
              ) : (
                <>
                  Trending {trend.direction}{' '}
                  <span className="font-semibold tabular-nums">
                    {trend.slopePerWeek > 0 ? '+' : ''}
                    {trend.slopePerWeek.toFixed(decimals)} {unit}/day per week
                  </span>
                </>
              )}
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                R² {formatNumber(trend.r2, 2)}
              </span>
            </p>
          )}
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="statsDailyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.55} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                minTickGap={24}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11 }} width={48} />
              <Tooltip content={<TrendTooltip unit={unit} decimals={decimals} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="daily"
                name="Daily total"
                stroke={color}
                strokeWidth={2}
                fill="url(#statsDailyFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="rolling"
                name={`${ROLLING_WINDOW}-day average`}
                stroke={TREND_COLOR}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {!trend && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
            A trend line needs at least {THRESHOLDS.trendDays} days and{' '}
            {THRESHOLDS.trendSessions} sessions in range.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Current streak"
          value={
            streaks.currentActive > 0
              ? formatDays(streaks.currentActive)
              : formatDays(streaks.currentClean)
          }
          hint={streaks.currentActive > 0 ? 'consecutive days used' : 'consecutive days clean'}
        />
        <StatTile
          label="Longest clean streak"
          value={formatDays(streaks.longestClean)}
          hint="in this range"
        />
        <StatTile
          label="Longest run of use"
          value={formatDays(streaks.longestActive)}
          hint="consecutive days"
        />
        <StatTile
          label="Days used"
          value={`${summary.activeDays} / ${summary.dayCount}`}
          hint={`${((summary.activeDays / Math.max(summary.dayCount, 1)) * 100).toFixed(0)}% of days`}
        />
      </div>
    </StatsSection>
  );
};
