import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { mean } from '@/lib/stats';
import { SessionStatistics } from '@/lib/sessionStatistics';
import { StatsSection, StatTile } from './StatTile';
import { EM_DASH, decimalsForUnit, formatHours, formatWithUnit } from './statsFormat';

interface TimingSectionProps {
  stats: SessionStatistics;
  unit: string;
  color: string;
  gradient: string;
}

const BucketTooltip = ({
  active,
  payload,
  unit,
  decimals,
}: {
  active?: boolean;
  payload?: { payload?: { label: string; count: number; average: number | null } }[];
  unit: string;
  decimals: number;
}) => {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800/95">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.label}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-semibold tabular-nums">{row.count}</span>{' '}
        session{row.count === 1 ? '' : 's'}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        avg{' '}
        <span className="font-semibold tabular-nums">
          {row.average === null ? EM_DASH : `${row.average.toFixed(decimals)} ${unit}`}
        </span>
      </p>
    </div>
  );
};

export const TimingSection = ({ stats, unit, color, gradient }: TimingSectionProps) => {
  const decimals = decimalsForUnit(unit);
  const { series, gaps, social } = stats;

  const weekdayData = useMemo(
    () =>
      series.weekdays.map((bucket) => ({
        ...bucket,
        short: bucket.label.slice(0, 3),
      })),
    [series.weekdays]
  );

  const hourData = useMemo(
    () =>
      series.hours.map((bucket) => ({
        ...bucket,
        short: String(bucket.index).padStart(2, '0'),
      })),
    [series.hours]
  );

  const busiestWeekday = useMemo(
    () =>
      series.weekdays.reduce(
        (best, bucket) => (bucket.count > (best?.count ?? -1) ? bucket : best),
        series.weekdays[0]
      ),
    [series.weekdays]
  );

  const busiestHour = useMemo(
    () =>
      series.hours.reduce(
        (best, bucket) => (bucket.count > (best?.count ?? -1) ? bucket : best),
        series.hours[0]
      ),
    [series.hours]
  );

  // Weekday indices 0 (Sunday) and 6 (Saturday) are the weekend.
  const weekendCount = series.weekdays[0].count + series.weekdays[6].count;
  const weekdayCount = series.sessions.length - weekendCount;
  const weekendAverage = mean(
    [series.weekdays[0], series.weekdays[6]].flatMap((b) =>
      b.count > 0 ? [b.total / b.count] : []
    )
  );

  // Sessions in the darkest bar carry the fullest hue; quieter bars fade towards
  // the surface, so magnitude reads as intensity in a single hue.
  const maxWeekday = Math.max(...series.weekdays.map((b) => b.count), 1);
  const maxHour = Math.max(...series.hours.map((b) => b.count), 1);
  const opacityFor = (count: number, maxCount: number) =>
    count === 0 ? 0.12 : 0.35 + 0.65 * (count / maxCount);

  return (
    <StatsSection
      title="Timing & context"
      description="When sessions happen, how far apart, and who you're with"
      emoji="🕒"
      gradient={gradient}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Busiest day"
          value={busiestWeekday.count > 0 ? busiestWeekday.label : EM_DASH}
          hint={busiestWeekday.count > 0 ? `${busiestWeekday.count} sessions` : undefined}
        />
        <StatTile
          label="Peak hour"
          value={busiestHour.count > 0 ? `${busiestHour.label}` : EM_DASH}
          hint={busiestHour.count > 0 ? `${busiestHour.count} sessions` : undefined}
        />
        <StatTile
          label="Typical gap"
          value={formatHours(gaps.medianHours)}
          hint="median between sessions"
        />
        <StatTile
          label="Longest gap"
          value={formatHours(gaps.longestHours)}
          hint="in this range"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-4 sm:p-6">
          <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-gray-100">
            By day of week
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
                <XAxis dataKey="short" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} allowDecimals={false} />
                <Tooltip
                  cursor={{ fillOpacity: 0.08 }}
                  content={<BucketTooltip unit={unit} decimals={decimals} />}
                />
                <Bar dataKey="count" name="Sessions" radius={[4, 4, 0, 0]}>
                  {weekdayData.map((bucket) => (
                    <Cell
                      key={bucket.index}
                      fill={color}
                      fillOpacity={opacityFor(bucket.count, maxWeekday)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-gray-100">
            By hour of day
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
                <XAxis dataKey="short" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} width={40} allowDecimals={false} />
                <Tooltip
                  cursor={{ fillOpacity: 0.08 }}
                  content={<BucketTooltip unit={unit} decimals={decimals} />}
                />
                <Bar dataKey="count" name="Sessions" radius={[4, 4, 0, 0]}>
                  {hourData.map((bucket) => (
                    <Cell
                      key={bucket.index}
                      fill={color}
                      fillOpacity={opacityFor(bucket.count, maxHour)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Weekend vs weekday"
          value={`${weekendCount} / ${weekdayCount}`}
          hint={
            weekendAverage === null
              ? 'sessions Sat+Sun / Mon–Fri'
              : `weekend avg ${formatWithUnit(weekendAverage, unit, decimals)}`
          }
        />
        <StatTile
          label="Social sessions"
          value={
            series.sessions.length === 0
              ? EM_DASH
              : `${((social.socialCount / series.sessions.length) * 100).toFixed(0)}%`
          }
          hint={`${social.socialCount} social · ${social.soloCount} solo`}
        />
        <StatTile
          label="Avg dose — social"
          value={formatWithUnit(social.socialAverage, unit, decimals)}
          hint={
            social.difference === null
              ? undefined
              : social.difference > 0
                ? `${formatWithUnit(social.difference, unit, decimals)} more than solo`
                : `${formatWithUnit(Math.abs(social.difference), unit, decimals)} less than solo`
          }
        />
        <StatTile
          label="Avg dose — solo"
          value={formatWithUnit(social.soloAverage, unit, decimals)}
          hint={`${social.soloCount} session${social.soloCount === 1 ? '' : 's'}`}
        />
      </div>
    </StatsSection>
  );
};
