'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter, ArrowUpDown, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useState } from "react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/session';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterControlsProps {
  selectedType: string;
  setSelectedType: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  category: Category;
}

export const FilterControls = ({
  selectedType,
  setSelectedType,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
  category,
}: FilterControlsProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const getSessionTypesForCategory = (category: Category) => {
    switch (category) {
      case 'weed':
        return [
          { value: 'All', label: '🌟 All Types' },
          { value: 'Joint', label: '🌿 Joint' },
          { value: 'Bong', label: '💨 Bong' },
          { value: 'Vape', label: '💨 Vape' },
          { value: 'Edible', label: '🍪 Edible' },
          { value: 'Other', label: '🔄 Other' }
        ];
      case 'cigs':
        return [
          { value: 'All', label: '🌟 All Types' },
          { value: 'Regular', label: '🚬 Regular' },
          { value: 'Light', label: '🚬 Light' },
          { value: 'Menthol', label: '🌿 Menthol' },
          { value: 'E-Cigarette', label: '💨 E-Cigarette' },
          { value: 'Other', label: '🔄 Other' }
        ];
      case 'vapes':
        return [
          { value: 'All', label: '🌟 All Types' },
          { value: 'Disposable', label: '💨 Disposable' },
          { value: 'Pod', label: '🔋 Pod' },
          { value: 'Mod', label: '🔧 Mod' },
          { value: 'Pen', label: '✏️ Pen' },
          { value: 'Other', label: '🔄 Other' }
        ];
      case 'liquor':
        return [
          { value: 'All', label: '🌟 All Types' },
          { value: 'Beer', label: '🍺 Beer' },
          { value: 'Wine', label: '🍷 Wine' },
          { value: 'Spirits', label: '🥃 Spirits' },
          { value: 'Cocktail', label: '🍸 Cocktail' },
          { value: 'Other', label: '🔄 Other' }
        ];
      default:
        return [{ value: 'All', label: '🌟 All Types' }];
    }
  };

  const getCategoryGradient = (category: Category) => {
    switch (category) {
      case 'weed': return 'from-green-500 to-emerald-600';
      case 'cigs': return 'from-gray-500 to-slate-600';
      case 'vapes': return 'from-cyan-500 to-blue-600';
      case 'liquor': return 'from-amber-500 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const sessionTypes = getSessionTypesForCategory(category);
  const gradient = getCategoryGradient(category);

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "Pick a date range";
    if (!range.to) return format(range.from, "MMM d");
    return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d")}`;
  };

  const clearDateRange = () => {
    setDateRange(undefined);
    setCalendarOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedType('All');
    setDateRange(undefined);
    setSortBy('date-desc');
    setCalendarOpen(false);
  };

  const hasActiveFilters = selectedType !== 'All' || dateRange !== undefined || sortBy !== 'date-desc';

  // Mobile collapsed view
  if (isMobile && !isExpanded) {
    return (
      <div className="glass-card-secondary p-4 space-y-4">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center`}>
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Filters & Sort</h3>
              {hasActiveFilters && (
                <p className="text-xs text-gray-600 dark:text-gray-400">Active filters applied</p>
              )}
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </button>
        
        {/* Quick active filters summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {selectedType !== 'All' && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                {sessionTypes.find(t => t.value === selectedType)?.label}
              </span>
            )}
            {dateRange && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                📅 {formatDateRange(dateRange)}
              </span>
            )}
            {sortBy !== 'date-desc' && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                📊 Sorted
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card-secondary p-4 sm:p-6 space-y-6">
      {/* Mobile header with collapse button */}
      {isMobile && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center`}>
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Filters & Sort</h3>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronUp className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filter Section */}
        <div className="space-y-4">
          {!isMobile && (
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center`}>
                <Filter className="w-4 h-4 text-white" />
              </div>
              <h3 className="heading-md text-gray-800 dark:text-gray-200">Filter</h3>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎯 Session Type
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full h-12 bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card-secondary border-slate-200 dark:border-gray-700 rounded-xl">
                  {sessionTypes.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value} 
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors py-3"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 Date Range
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start text-left font-normal bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">{formatDateRange(dateRange)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 glass-card-secondary border-slate-200 dark:border-gray-700" 
                  align="start"
                  side={isMobile ? "bottom" : "bottom"}
                >
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={isMobile ? 1 : 2}
                    className="rounded-md"
                  />
                  <div className="p-3 border-t border-slate-200 dark:border-gray-700 flex gap-2">
                    <Button
                      onClick={clearDateRange}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Clear Range
                    </Button>
                    <Button
                      onClick={() => setCalendarOpen(false)}
                      size="sm"
                      className={`flex-1 bg-gradient-to-r ${gradient} hover:opacity-90 text-white`}
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <div>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="w-full h-10 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sort Section */}
        <div className="space-y-4">
          {!isMobile && (
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center`}>
                <ArrowUpDown className="w-4 h-4 text-white" />
              </div>
              <h3 className="heading-md text-gray-800 dark:text-gray-200">Sort</h3>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📊 Sort By
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-12 bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card-secondary border-slate-200 dark:border-gray-700 rounded-xl">
                <SelectItem value="date-desc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors py-3">🕒 Newest First</SelectItem>
                <SelectItem value="date-asc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors py-3">🕒 Oldest First</SelectItem>
                <SelectItem value="rating-desc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors py-3">⭐ Highest Rated</SelectItem>
                <SelectItem value="rating-asc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors py-3">⭐ Lowest Rated</SelectItem>
                <SelectItem value="individual-desc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors py-3">🎯 Most Individual</SelectItem>
                <SelectItem value="individual-asc" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors py-3">🎯 Least Individual</SelectItem>
                <SelectItem value="type" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors py-3">🔤 By Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filter Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🌟 Quick Filters
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setDateRange({ 
                  from: new Date(new Date().setDate(new Date().getDate() - 7)), 
                  to: new Date() 
                })}
                variant="outline"
                size="sm"
                className="h-10 text-xs bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Last 7 Days
              </Button>
              <Button
                onClick={() => setDateRange({ 
                  from: new Date(new Date().setDate(new Date().getDate() - 30)), 
                  to: new Date() 
                })}
                variant="outline"
                size="sm"
                className="h-10 text-xs bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Last 30 Days
              </Button>
              <Button
                onClick={() => setDateRange({ 
                  from: new Date(new Date().setDate(new Date().getDate() - 90)), 
                  to: new Date() 
                })}
                variant="outline"
                size="sm"
                className="h-10 text-xs bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Last 90 Days
              </Button>
              <Button
                onClick={() => setDateRange(undefined)}
                variant="outline"
                size="sm"
                className="h-10 text-xs bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                All Time
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};