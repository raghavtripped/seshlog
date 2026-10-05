import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useSoberCounters, type SoberCounter, type SoberCounterKey } from '@/hooks/useSoberCounters';
import { formatSoberDuration } from '@/lib/soberCounter';
import { useIsMobile } from '@/hooks/use-mobile';

const META: Record<SoberCounterKey, { label: string; emoji: string; gradient: string }> = {
  smoke: { label: 'Smoke-free', emoji: '🌬️', gradient: 'from-emerald-500 to-teal-600' },
  cigs: { label: 'Cigarettes', emoji: '🚬', gradient: 'from-gray-500 to-slate-600' },
  vapes: { label: 'Vapes', emoji: '💨', gradient: 'from-cyan-500 to-blue-600' },
  weed: { label: 'Weed', emoji: '🌿', gradient: 'from-green-500 to-emerald-600' },
  liquor: { label: 'Liquor', emoji: '🥃', gradient: 'from-amber-500 to-orange-600' },
  gum: { label: 'Nicotine Gum', emoji: '🍬', gradient: 'from-pink-500 to-rose-600' },
};

// One day: below this a current streak is "just started", and the longest-streak
// reminder is worth surfacing.
const DAY_MS = 24 * 60 * 60 * 1000;

const FreeDays = ({ counter }: { counter: SoberCounter }) => {
  const { freeDays, windowDays } = counter.status;
  return (
    <span>
      {freeDays}/{windowDays} days free
      {windowDays < 30 ? ` (since you started logging)` : ' in last 30'}
    </span>
  );
};

const HeadlineCounter = ({ counter }: { counter: SoberCounter }) => {
  const { status } = counter;
  const meta = META[counter.key];
  const isMobile = useIsMobile();

  if (status.currentMs === null) return null;

  const showBest = status.longestMs !== null && status.longestMs > status.currentMs && status.longestMs >= DAY_MS;

  return (
    <div className={`glass-card ${isMobile ? 'p-5' : 'p-8'} text-center`}>
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        <span>{meta.emoji}</span>
        <span>{meta.label}</span>
        <span className="text-xs text-gray-500">· no cigs or vapes</span>
      </div>
      <div
        className={`mt-2 bg-gradient-to-r ${meta.gradient} bg-clip-text font-bold tabular-nums text-transparent ${isMobile ? 'text-4xl' : 'text-6xl'}`}
      >
        {formatSoberDuration(status.currentMs)}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
        <span>Longest: {formatSoberDuration(status.longestMs ?? 0)}</span>
        <FreeDays counter={counter} />
      </div>
      {showBest && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          A slip isn't a reset — you've already gone {formatSoberDuration(status.longestMs!)} before.
        </p>
      )}
    </div>
  );
};

const CategoryCounter = ({ counter }: { counter: SoberCounter }) => {
  const { status } = counter;
  const meta = META[counter.key];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
        <span>{meta.emoji}</span>
        <span>{meta.label}</span>
      </div>
      {status.currentMs === null ? (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">Nothing logged</div>
      ) : (
        <>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-gray-800 dark:text-gray-200">
            {formatSoberDuration(status.currentMs)}
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
            <div>Longest: {formatSoberDuration(status.longestMs ?? 0)}</div>
            <div>
              <FreeDays counter={counter} />
            </div>
            {status.lastAt && <div>Last: {format(status.lastAt, 'd MMM, HH:mm')}</div>}
          </div>
        </>
      )}
    </div>
  );
};

export const SoberCounters = () => {
  const { counters, isLoading, error } = useSoberCounters();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }
  if (error) {
    return <p className="text-center text-sm text-rose-600 dark:text-rose-400">Couldn't load counters: {error}</p>;
  }

  const headline = counters.find((c) => c.key === 'smoke')!;
  const rest = counters.filter((c) => c.key !== 'smoke');

  return (
    <section className={`mx-auto ${isMobile ? 'mb-6 max-w-sm space-y-3' : 'mb-12 max-w-6xl space-y-4'}`}>
      <HeadlineCounter counter={headline} />
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-5 gap-4'}`}>
        {rest.map((counter) => (
          <CategoryCounter key={counter.key} counter={counter} />
        ))}
      </div>
    </section>
  );
};
