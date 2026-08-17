import { ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EM_DASH, formatSignedPercent } from './statsFormat';

interface StatTileProps {
  label: string;
  value: string;
  /** Small clarifying line under the value — what it's measured over, or a caveat. */
  hint?: ReactNode;
  /** Percentage change vs the previous period; omit when there's nothing to compare. */
  change?: number | null;
  /**
   * Whether an increase is a good thing. For consumption tracking it usually
   * isn't, so the default is neutral coloring — the arrow shows direction and
   * the user decides what it means.
   */
  emphasis?: 'neutral' | 'positive-up' | 'positive-down';
}

export const StatTile = ({
  label,
  value,
  hint,
  change,
  emphasis = 'neutral',
}: StatTileProps) => {
  const hasChange = change !== null && change !== undefined;
  const Arrow = !hasChange ? ArrowRight : change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : ArrowRight;

  const changeTone = (() => {
    if (!hasChange || change === 0 || emphasis === 'neutral') {
      return 'text-gray-600 dark:text-gray-400';
    }
    const isGood = emphasis === 'positive-up' ? change > 0 : change < 0;
    return isGood
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400';
  })();

  return (
    <div className="glass-card p-4 sm:p-5">
      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">
        {value}
      </p>
      {hasChange && (
        <p className={cn('mt-1 flex items-center gap-1 text-xs sm:text-sm font-medium', changeTone)}>
          <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          {formatSignedPercent(change)} vs previous period
        </p>
      )}
      {hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{hint}</p>
      )}
    </div>
  );
};

interface StatsSectionProps {
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  children: ReactNode;
}

export const StatsSection = ({
  title,
  description,
  emoji,
  gradient,
  children,
}: StatsSectionProps) => (
  <section className="space-y-4">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r ${gradient} shadow-lg`}
        aria-hidden="true"
      >
        <span className="text-lg">{emoji}</span>
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

/** Shown in place of a stat that needs more data than the user has logged. */
export const NotEnoughData = ({ need }: { need: string }) => (
  <div className="glass-card p-6 text-center">
    <p className="text-sm text-gray-600 dark:text-gray-400">
      <span className="mr-1 text-base" aria-hidden="true">
        {EM_DASH}
      </span>
      Not enough data yet. {need}
    </p>
  </div>
);
