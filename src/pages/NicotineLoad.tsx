import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppDashboard } from '@/components/AppDashboard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';
import { useNicotineLoad } from '@/hooks/useNicotineLoad';
import { StatsRangePreset } from '@/lib/sessionSeries';
import { StatsRangePicker } from '@/components/stats/StatsRangePicker';
import { NicotineLoadView } from '@/components/stats/NicotineLoadView';

const GRADIENT = 'from-cyan-500 to-blue-600';

export const NicotineLoad = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { sessions: cigSessions, isLoading: cigsLoading } = useSessions('cigs');
  const { sessions: vapeSessions, isLoading: vapesLoading } = useSessions('vapes');

  const [preset, setPreset] = useState<StatsRangePreset>('1y');
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [rateOverride, setRateOverride] = useState<number | undefined>(undefined);

  const sessions = useMemo(
    () => [...cigSessions, ...vapeSessions],
    [cigSessions, vapeSessions]
  );
  const analysis = useNicotineLoad(sessions, preset, customRange, rateOverride);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  if (authLoading || cigsLoading || vapesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <AppDashboard
      title="Nicotine Load"
      emoji="🚬"
      category="vapes"
      onBackToCategories={() => navigate('/categories')}
    >
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/categories')}
            className="bg-white/50 dark:bg-gray-800/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to categories
          </Button>
          {analysis?.hasData && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {analysis.weeks.length} weeks ·{' '}
              {format(analysis.weeks[0].date, 'MMM d, yyyy')} onward
            </p>
          )}
        </div>

        <StatsRangePicker
          preset={preset}
          setPreset={setPreset}
          customRange={customRange}
          setCustomRange={setCustomRange}
          gradient={GRADIENT}
        />

        {!analysis || !analysis.hasData ? (
          <div className="glass-card p-8 text-center">
            <div className="mb-3 text-4xl opacity-50" aria-hidden="true">
              🚬
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-200">
              No cigarette or vape sessions in this range
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This page combines both into a single load figure. Log some sessions, or widen the
              range.
            </p>
          </div>
        ) : (
          <NicotineLoadView
            analysis={analysis}
            rateOverride={rateOverride}
            setRateOverride={setRateOverride}
          />
        )}
      </div>
    </AppDashboard>
  );
};

export default NicotineLoad;
