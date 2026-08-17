import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppDashboard } from '@/components/AppDashboard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';
import { useSessionStatistics } from '@/hooks/useSessionStatistics';
import { Category } from '@/types/session';
import { StatsRangePreset, windowLengthInDays } from '@/lib/sessionSeries';
import {
  getCategoryGradient,
  getSmartCategoryDisplay,
  hasMultipleUnits,
} from '@/lib/utils';
import { StatsRangePicker } from '@/components/stats/StatsRangePicker';
import { TrendsSection } from '@/components/stats/TrendsSection';
import { ConsistencySection } from '@/components/stats/ConsistencySection';
import { TimingSection } from '@/components/stats/TimingSection';
import { DistributionSection } from '@/components/stats/DistributionSection';
import { getCategoryChartColor } from '@/components/stats/statsFormat';

const CATEGORY_META: Record<Category, { title: string; emoji: string }> = {
  weed: { title: 'Weed', emoji: '🌿' },
  cigs: { title: 'Cigarettes', emoji: '🚬' },
  vapes: { title: 'Vapes', emoji: '💨' },
  liquor: { title: 'Liquor', emoji: '🥃' },
};

interface CategoryStatsProps {
  category: Category;
}

export const CategoryStats = ({ category }: CategoryStatsProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { sessions, isLoading } = useSessions(category);

  const [preset, setPreset] = useState<StatsRangePreset>('90d');
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  const stats = useSessionStatistics(sessions, preset, customRange);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  const meta = CATEGORY_META[category];
  const gradient = getCategoryGradient(category);
  const color = getCategoryChartColor(category);

  // Label everything in the unit the maths actually ran in, so mixed-unit
  // categories (edibles in mg alongside joints in grams) aren't mislabelled.
  const unit = getSmartCategoryDisplay(category, 0, hasMultipleUnits(sessions));

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <AppDashboard
      title={`${meta.title} Statistics`}
      emoji="📊"
      category={category}
      onBackToCategories={() => navigate('/categories')}
    >
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/${category}`)}
            className="bg-white/50 dark:bg-gray-800/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to {meta.title}
          </Button>
          {stats && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(stats.window.from, 'MMM d, yyyy')} – {format(stats.window.to, 'MMM d, yyyy')}
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                {windowLengthInDays(stats.window)} days
              </span>
            </p>
          )}
        </div>

        <StatsRangePicker
          preset={preset}
          setPreset={setPreset}
          customRange={customRange}
          setCustomRange={setCustomRange}
          gradient={gradient}
        />

        {!stats ? (
          <div className="glass-card p-8 text-center">
            <div className="mb-3 text-4xl opacity-50" aria-hidden="true">
              {meta.emoji}
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-200">
              Nothing to analyse yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {preset === 'custom'
                ? 'Pick a start and end date to see statistics for that window.'
                : `Log some ${meta.title.toLowerCase()} sessions and your statistics will appear here.`}
            </p>
          </div>
        ) : !stats.hasData ? (
          <div className="glass-card p-8 text-center">
            <div className="mb-3 text-4xl opacity-50" aria-hidden="true">
              {meta.emoji}
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-200">
              No sessions in this range
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Try a wider range — there's nothing logged between{' '}
              {format(stats.window.from, 'MMM d')} and {format(stats.window.to, 'MMM d, yyyy')}.
            </p>
          </div>
        ) : (
          <>
            <TrendsSection stats={stats} unit={unit} color={color} gradient={gradient} />
            <ConsistencySection stats={stats} unit={unit} gradient={gradient} />
            <TimingSection stats={stats} unit={unit} color={color} gradient={gradient} />
            <DistributionSection stats={stats} unit={unit} gradient={gradient} />
          </>
        )}
      </div>
    </AppDashboard>
  );
};

export default CategoryStats;
