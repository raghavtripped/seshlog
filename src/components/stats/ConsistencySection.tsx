import { format, parseISO } from 'date-fns';
import { consistencyBand, SessionStatistics, THRESHOLDS } from '@/lib/sessionStatistics';
import { NotEnoughData, StatsSection, StatTile } from './StatTile';
import { EM_DASH, decimalsForUnit, formatNumber, formatWithUnit } from './statsFormat';

const BAND_COPY: Record<string, string> = {
  steady: 'Steady — your sessions are close to the same size each time.',
  variable: 'Variable — session sizes move around a fair bit.',
  spiky: 'Spiky — a few sessions are far bigger than the rest.',
};

interface ConsistencySectionProps {
  stats: SessionStatistics;
  unit: string;
  gradient: string;
}

export const ConsistencySection = ({ stats, unit, gradient }: ConsistencySectionProps) => {
  const decimals = decimalsForUnit(unit);
  const { perSession, perDay, outliers } = stats;

  const band = perSession.cv === null ? null : consistencyBand(perSession.cv);

  return (
    <StatsSection
      title="Consistency"
      description="How much your sessions vary — the spread, not just the average"
      emoji="⚖️"
      gradient={gradient}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Std dev (per session)"
          value={formatWithUnit(perSession.stdDev, unit, decimals)}
          hint={`mean ${formatWithUnit(perSession.mean, unit, decimals)}`}
        />
        <StatTile
          label="Std dev (per day)"
          value={formatWithUnit(perDay.stdDev, unit, decimals)}
          hint={`mean ${formatWithUnit(perDay.mean, unit, decimals)}`}
        />
        <StatTile
          label="Consistency"
          value={band ? band[0].toUpperCase() + band.slice(1) : EM_DASH}
          hint={
            perSession.cv === null
              ? `needs ${THRESHOLDS.spread}+ sessions`
              : `CV ${formatNumber(perSession.cv, 2)}`
          }
        />
        <StatTile
          label="Typical range"
          value={
            perSession.q1 === null || perSession.q3 === null
              ? EM_DASH
              : `${perSession.q1.toFixed(decimals)}–${perSession.q3.toFixed(decimals)}`
          }
          hint={`middle 50% of sessions, ${unit}`}
        />
      </div>

      {band && (
        <p className="glass-card p-4 text-sm text-gray-700 dark:text-gray-300">
          {BAND_COPY[band]}
          {perSession.mean !== null &&
            perSession.median !== null &&
            perSession.mean > perSession.median * 1.15 && (
              <>
                {' '}
                Your average ({formatWithUnit(perSession.mean, unit, decimals)}) sits above your
                median ({formatWithUnit(perSession.median, unit, decimals)}), which means a
                handful of heavy sessions are pulling it up.
              </>
            )}
        </p>
      )}

      <div className="glass-card p-4 sm:p-6">
        <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-gray-100">
          Heavy sessions
        </h3>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-500">
          Sessions more than 1.5× the interquartile range above your upper quartile — statistical
          outliers against your own baseline.
        </p>

        {outliers === null ? (
          <NotEnoughData need={`Outlier detection needs ${THRESHOLDS.outliers}+ sessions in range.`} />
        ) : outliers.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            None — no session in this range stands out from the rest.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {outliers.slice(0, 8).map(({ session, dose }) => (
              <li key={session.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {format(parseISO(session.session_date), 'MMM d, yyyy · HH:mm')}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                    {session.session_type}
                  </span>
                </span>
                <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-100">
                  {dose.toFixed(decimals)} {unit}
                </span>
              </li>
            ))}
            {outliers.length > 8 && (
              <li className="pt-2 text-xs text-gray-500 dark:text-gray-500">
                and {outliers.length - 8} more
              </li>
            )}
          </ul>
        )}
      </div>
    </StatsSection>
  );
};
