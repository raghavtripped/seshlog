'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterControlsProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  periodFilter: string;
  setPeriodFilter: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

export function FilterControls({
  sortBy,
  setSortBy,
  periodFilter,
  setPeriodFilter,
  dateRange,
  setDateRange
}: FilterControlsProps) {
  
  const handlePeriodChange = (value: string) => {
    // When a preset is chosen, clear the custom date range
    setDateRange(undefined);
    setPeriodFilter(value);
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // When a custom date is chosen, set the dropdown to a "custom" state
    if (range?.from) {
      setPeriodFilter('custom');
    } else {
      // If the date range is cleared, revert to the last known preset (or a default)
      if (periodFilter === 'custom') {
        setPeriodFilter('all_time'); 
      }
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter by:</span>
        {/* Custom Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[260px] justify-start text-left font-normal bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        {/* Preset Period Dropdown */}
        <Select value={periodFilter} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-40 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="past_year">Past Year</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
            {periodFilter === 'custom' && <SelectItem value="custom" disabled>Custom Range</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</span>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="rating-desc">Highest Rated</SelectItem>
            <SelectItem value="rating-asc">Lowest Rated</SelectItem>
            <SelectItem value="individual-desc">Most Individual</SelectItem>
            <SelectItem value="individual-asc">Least Individual</SelectItem>
            <SelectItem value="type">By Type</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}