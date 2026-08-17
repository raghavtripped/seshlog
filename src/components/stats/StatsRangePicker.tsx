import { useState } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatsRangePreset } from '@/lib/sessionSeries';

const PRESETS: { value: Exclude<StatsRangePreset, 'custom'>; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'all', label: 'All time' },
];

interface StatsRangePickerProps {
  preset: StatsRangePreset;
  setPreset: (preset: StatsRangePreset) => void;
  customRange: DateRange | undefined;
  setCustomRange: (range: DateRange | undefined) => void;
  gradient: string;
}

export const StatsRangePicker = ({
  preset,
  setPreset,
  customRange,
  setCustomRange,
  gradient,
}: StatsRangePickerProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const customLabel = customRange?.from
    ? customRange.to
      ? `${format(customRange.from, 'MMM d')} – ${format(customRange.to, 'MMM d, yyyy')}`
      : format(customRange.from, 'MMM d, yyyy')
    : 'Custom';

  return (
    <div className="glass-card flex flex-wrap items-center gap-2 p-3">
      <span className="mr-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Range
      </span>

      {PRESETS.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={preset === option.value ? 'default' : 'outline'}
          onClick={() => setPreset(option.value)}
          className={
            preset === option.value
              ? `bg-gradient-to-r ${gradient} border-transparent text-white hover:opacity-90`
              : 'bg-white/50 dark:bg-gray-800/50'
          }
        >
          {option.label}
        </Button>
      ))}

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant={preset === 'custom' ? 'default' : 'outline'}
            className={
              preset === 'custom'
                ? `bg-gradient-to-r ${gradient} border-transparent text-white hover:opacity-90`
                : 'bg-white/50 dark:bg-gray-800/50'
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            {preset === 'custom' ? customLabel : 'Custom'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={customRange?.from}
            selected={customRange}
            onSelect={(range) => {
              setCustomRange(range);
              if (range?.from) setPreset('custom');
              if (range?.from && range?.to) setCalendarOpen(false);
            }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
