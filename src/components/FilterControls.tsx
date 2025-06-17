'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter, SortDesc, ArrowUpDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useState } from "react";

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

export const FilterControls = ({
  sortBy,
  setSortBy,
  periodFilter,
  setPeriodFilter,
  dateRange,
  setDateRange,
}: FilterControlsProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "Pick a date range";
    if (!range.to) return format(range.from, "PPP");
    return `${format(range.from, "PPP")} - ${format(range.to, "PPP")}`;
  };

  const clearDateRange = () => {
    setDateRange(undefined);
    setCalendarOpen(false);
  };

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
    <div className="glass-card-secondary p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filter Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="heading-md text-gray-800 dark:text-gray-200">Filter</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 Date Range
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">{formatDateRange(dateRange)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-card-secondary border-slate-200 dark:border-gray-700" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    className="rounded-md"
                  />
                  <div className="p-3 border-t border-slate-200 dark:border-gray-700">
                    <Button
                      onClick={clearDateRange}
                      variant="outline"
                      size="sm"
                      className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Clear Date Range
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🌟 Quick Filters
              </label>
              <Select value={periodFilter} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card-secondary border-slate-200 dark:border-gray-700 rounded-xl">
                  <SelectItem value="all_time" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">🌟 All Time</SelectItem>
                  <SelectItem value="today" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">📅 Today</SelectItem>
                  <SelectItem value="week" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">📅 This Week</SelectItem>
                  <SelectItem value="month" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">📅 This Month</SelectItem>
                  <SelectItem value="year" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">📅 This Year</SelectItem>
                  <SelectItem value="past_year" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">📅 Past Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Sort Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 text-white" />
            </div>
            <h3 className="heading-md text-gray-800 dark:text-gray-200">Sort</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📊 Sort By
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card-secondary border-slate-200 dark:border-gray-700 rounded-xl">
                <SelectItem value="date-desc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">🕒 Newest First</SelectItem>
                <SelectItem value="date-asc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">🕒 Oldest First</SelectItem>
                <SelectItem value="rating-desc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">⭐ Highest Rated</SelectItem>
                <SelectItem value="rating-asc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">⭐ Lowest Rated</SelectItem>
                <SelectItem value="individual-desc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">🎯 Most Individual</SelectItem>
                <SelectItem value="individual-asc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">🎯 Least Individual</SelectItem>
                <SelectItem value="type" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">🔤 By Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};