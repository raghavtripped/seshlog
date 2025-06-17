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

  // Render only the form, no card, no collapse
  return (
    <form className="space-y-6 w-full max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filter Section */}
        <div className="space-y-4">
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
    </form>
  );
};