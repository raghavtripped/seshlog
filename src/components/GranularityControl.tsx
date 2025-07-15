import { useState } from 'react';
import { Category } from "@/types/session";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from "@/components/ui/button";
import { CalendarDays, Calendar, Clock, TrendingUp } from "lucide-react";

export type TimeGranularity = 'day' | 'week' | 'month' | 'year';

interface GranularityControlProps {
  selectedGranularity: TimeGranularity;
  onGranularityChange: (granularity: TimeGranularity) => void;
  category: Category;
}

export const GranularityControl = ({ 
  selectedGranularity, 
  onGranularityChange, 
  category 
}: GranularityControlProps) => {
  const isMobile = useIsMobile();

  const getCategoryGradient = (category: Category) => {
    switch (category) {
      case 'weed': return 'from-green-500 to-emerald-600';
      case 'cigs': return 'from-gray-500 to-slate-600';
      case 'vapes': return 'from-cyan-500 to-blue-600';
      case 'liquor': return 'from-amber-500 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const granularityOptions: { value: TimeGranularity; label: string; icon: typeof Clock }[] = [
    { value: 'day', label: 'Days', icon: Clock },
    { value: 'week', label: 'Weeks', icon: CalendarDays },
    { value: 'month', label: 'Months', icon: Calendar },
    { value: 'year', label: 'Years', icon: TrendingUp },
  ];

  const gradient = getCategoryGradient(category);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
          <span className={`${isMobile ? 'text-sm' : 'text-lg'}`}>📊</span>
        </div>
        <div>
          <h3 className={`${isMobile ? 'text-sm font-semibold' : 'text-base font-semibold'} text-gray-800 dark:text-gray-200`}>
            Chart Granularity
          </h3>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
            Choose time period grouping
          </p>
        </div>
      </div>
      
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3'}`}>
        {granularityOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedGranularity === option.value;
          
          return (
            <Button
              key={option.value}
              onClick={() => onGranularityChange(option.value)}
              variant={isSelected ? "default" : "outline"}
              size={isMobile ? "sm" : "default"}
              className={`
                ${isSelected 
                  ? `bg-gradient-to-r ${gradient} text-white border-transparent hover:opacity-90` 
                  : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }
                transition-all duration-200 rounded-xl
                ${isMobile ? 'text-xs py-2 px-2' : 'text-sm py-2 px-3'}
              `}
            >
              <Icon className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}; 