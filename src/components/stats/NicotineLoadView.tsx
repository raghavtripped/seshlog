import { useMemo } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { rollingMean } from '@/lib/stats';
import { RATE_SEARCH, type NicotineLoadAnalysis } from '@/lib/nicotineLoad';
import { StatsSection, StatTile } from './StatTile';
import { EM_DASH, formatNumber } from './statsFormat';

// Validated against both light and dark surfaces: chroma, colour-vision
// separation and contrast all pass, so the two sources stay distinguishable in
// either theme. The app's usual grey for cigs fails the chroma floor — it reads
// as "no series" rather than as an identity — so this page uses red instead.
const CIG_COLOR = '#dc2626';
const VAPE_COLOR = '#0891b2';
const TREND_COLOR = '#7c3aed';
const GRADIENT = 'from-cyan-500 to-blue-600';
const ROLLING_WINDOW = 4;

interface ChartRow {
  label: string;
  fromCigs: number;
  fromVapes: number;
  total: number;
  rolling: number | null;
}

const LoadTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload?: ChartRow }[];
  label?: string;
}) => {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800/95">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Week of {label}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <span
          className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
          style={{ backgroundColor: CIG_COLOR }}
          aria-hidden="true"
        />
        From cigarettes:{' '}
        <span className="font-semibold tabular-nums">{row.fromCigs.toFixed(1)}</span>
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <span
          className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
          style={{ backgroundColor: VAPE_COLOR }}
          aria-hidden="true"
        />
        From vaping: <span className="font-semibold tabular-nums">{row.fromVapes.toFixed(1)}</span>
      </p>
      <p className="mt-1 border-t border-gray-200 pt-1 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
        Total {row.total.toFixed(1)} cig-equivalents
      </p>
    </div>
  );
};

const TrendBanner = ({ analysis }: { analysis: NicotineLoadAnalysis }) => {
  const { trend, substitution } = analysis;
  if (!trend) return null;

  const rising = trend.direction === 'up';
  const change =
    trend.earlyMean === 0 ? null : ((trend.lateMean - trend.earlyMean) / trend.earlyMean) * 100;

  return (
    <div
      className={`glass-card border-l-4 p-4 sm:p-5 ${
        rising ? 'border-l-rose-500' : 'border-l-emerald-500'
      }`}
    >
      <div className="flex items-start gap-3">
        {rising && (
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400"
            aria-hidden="true"
          />
        )}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {rising
              ? 'Your combined nicotine load is rising'
              : trend.direction === 'down'
                ? 'Your combined nicotine load is falling'
                : 'Your combined nicotine load is holding steady'}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            The first quarter of this range averaged{' '}
            <span className="font-semibold tabular-nums">{trend.earlyMean.toFixed(1)}</span>{' '}
            cig-equivalents a week; the last quarter averaged{' '}
            <span className="font-semibold tabular-nums">{trend.lateMean.toFixed(1)}</span>
            {change !== null && (
              <>
                {' '}
                — a change of{' '}
                <span className="font-semibold tabular-nums">
                  {change > 0 ? '+' : ''}
                  {change.toFixed(0)}%
                </span>
              </>
            )}
            .
          </p>
          {substitution?.isSubstituting && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Cigarettes and vaping trade off against each other here (correlation{' '}
              <span className="font-semibold tabular-nums">{formatNumber(substitution.r, 2)}</span>
              ), so neither category on its own shows this. Only the combined figure does.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface NicotineLoadViewProps {
  analysis: NicotineLoadAnalysis;
  rateOverride: number | undefined;
  setRateOverride: (rate: number | undefined) => void;
}

export const NicotineLoadView = ({
  analysis,
  rateOverride,
  setRateOverride,
}: NicotineLoadViewProps) => {
  const chartData = useMemo<ChartRow[]>(() => {
    const rolling = rollingMean(analysis.load, ROLLING_WINDOW);
    return analysis.weeks.map((week, i) => ({
      label: week.label,
      fromCigs: week.cigs,
      fromVapes: week.puffs / analysis.rate,
      total: analysis.load[i],
      rolling: rolling[i],
    }));
  }, [analysis]);

  return (
    <div className="space-y-8">
      <TrendBanner analysis={analysis} />

      <StatsSection
        title="Combined load"
        description="Cigarettes and vaping on one scale, so switching between them can't hide the total"
        emoji="🧮"
        gradient={GRADIENT}
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile
            label="Avg per week"
            value={formatNumber(analysis.meanLoad, 1)}
            hint="cig-equivalents"
          />
          <StatTile
            label="Total in range"
            value={formatNumber(analysis.totalLoad, 0)}
            hint={`over ${analysis.weeks.length} weeks`}
          />
          <StatTile
            label="Weekly trend"
            value={
              analysis.trend
                ? `${analysis.trend.slopePerWeek > 0 ? '+' : ''}${analysis.trend.slopePerWeek.toFixed(2)}`
                : EM_DASH
            }
            hint={
              analysis.trend
                ? `per week · R² ${formatNumber(analysis.trend.r2, 2)}`
                : 'needs more weeks'
            }
          />
          <StatTile
            label="Cigs ↔ vapes"
            value={analysis.substitution ? formatNumber(analysis.substitution.r, 2) : EM_DASH}
            hint={
              !analysis.substitution
                ? 'needs more weeks'
                : analysis.substitution.isSubstituting
                  ? 'they substitute for each other'
                  : 'they move together'
            }
          />
        </div>

        <div className="glass-card p-4 sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
            Weekly load by source (cig-equivalents)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  minTickGap={24}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11 }} width={48} />
                <Tooltip cursor={{ fillOpacity: 0.08 }} content={<LoadTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {/*
                  Stacked, so bar height is the total while the split stays visible.
                  Entry animation is off deliberately: hovering re-renders the chart,
                  and any change in data identity restarts the animation, which leaves
                  the marks stuck near zero height. A static chart is also easier to
                  read across ~50 weeks of bars.
                */}
                <Bar
                  dataKey="fromVapes"
                  name="From vaping"
                  stackId="load"
                  fill={VAPE_COLOR}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="fromCigs"
                  name="From cigarettes"
                  stackId="load"
                  fill={CIG_COLOR}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="rolling"
                  name={`${ROLLING_WINDOW}-week average`}
                  stroke={TREND_COLOR}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </StatsSection>

      <StatsSection
        title="Exchange rate"
        description="How many puffs count as one cigarette — the assumption everything above rests on"
        emoji="⚖️"
        gradient={GRADIENT}
      >
        <div className="glass-card space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-2xl font-bold tabular-nums text-gray-800 dark:text-gray-100">
              {analysis.rate} <span className="text-base font-medium">puffs = 1 cigarette</span>
            </p>
            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {analysis.rateSource === 'fitted'
                ? 'fitted to your data'
                : analysis.rateSource === 'override'
                  ? 'your override'
                  : 'default — not enough data to fit'}
            </span>
          </div>

          <Slider
            value={[analysis.rate]}
            min={RATE_SEARCH.min}
            max={RATE_SEARCH.max}
            step={RATE_SEARCH.step}
            onValueChange={([value]) => setRateOverride(value)}
            aria-label="Puffs per cigarette"
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRateOverride(undefined)}
              disabled={rateOverride === undefined}
              className="bg-white/50 dark:bg-gray-800/50"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              Back to fitted rate
            </Button>
            {analysis.fit && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Best fit {analysis.fit.rate} puffs/cig
              </p>
            )}
          </div>

          {analysis.fit && (
            <div className="rounded-lg bg-gray-100/60 p-3 text-sm text-gray-600 dark:bg-gray-800/40 dark:text-gray-400">
              <p>
                This rate is the one that makes your weekly combined load most stable. At it,
                combined load varies by{' '}
                <span className="font-semibold tabular-nums">{formatNumber(analysis.fit.cv, 2)}</span>{' '}
                (coefficient of variation), against{' '}
                <span className="font-semibold tabular-nums">
                  {formatNumber(analysis.fit.cvCigsAlone, 2)}
                </span>{' '}
                for cigarettes alone and{' '}
                <span className="font-semibold tabular-nums">
                  {formatNumber(analysis.fit.cvPuffsAlone, 2)}
                </span>{' '}
                for puffs alone. The combined figure being the steadiest is what says these two are
                substituting rather than varying independently.
              </p>
              <p className="mt-2">
                It is an estimate fitted to your own logs, not a clinical measure. Drag the slider
                to see how much your conclusions depend on it.
              </p>
            </div>
          )}
        </div>
      </StatsSection>
    </div>
  );
};
