// Shared formatting for the stats page. Every numeric formatter accepts null and
// renders an em dash, so a stat that can't be computed honestly reads as absent
// rather than as zero.

export const EM_DASH = '—';

export const formatNumber = (
  value: number | null | undefined,
  decimals = 2
): string => (value === null || value === undefined ? EM_DASH : value.toFixed(decimals));

export const formatWithUnit = (
  value: number | null | undefined,
  unit: string,
  decimals = 2
): string =>
  value === null || value === undefined ? EM_DASH : `${value.toFixed(decimals)} ${unit}`;

export const formatSignedPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return EM_DASH;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

/** Hours rendered as the largest sensible unit: "3.5h", "2.1 days". */
export const formatHours = (hours: number | null | undefined): string => {
  if (hours === null || hours === undefined) return EM_DASH;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)} days`;
};

export const formatDays = (days: number): string =>
  `${days} ${days === 1 ? 'day' : 'days'}`;

/** Decimal places appropriate to a unit — grams need two, puffs need none. */
export const decimalsForUnit = (unit: string): number => {
  if (unit.startsWith('mg')) return 1;
  if (unit.startsWith('g')) return 2;
  if (unit.startsWith('ml')) return 0;
  return unit.startsWith('cigs') || unit.startsWith('puffs') ? 1 : 2;
};

/** The chart hue for a trend/rolling-average line, distinct from every category color. */
export const TREND_COLOR = '#7c3aed';

export const getCategoryChartColor = (category: string): string => {
  switch (category) {
    case 'weed':
      return '#10b981';
    case 'cigs':
      return '#6b7280';
    case 'vapes':
      return '#06b6d4';
    case 'liquor':
      return '#f59e0b';
    default:
      return '#3b82f6';
  }
};
