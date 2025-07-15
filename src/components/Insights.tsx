import { useMemo, useState } from 'react';
import { Session, Category } from "@/types/session";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from "@/components/ui/button";
import { CalendarDays, Calendar, Clock, TrendingUp } from "lucide-react";

export type TimeGranularity = 'day' | 'week' | 'month' | 'year';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  format, 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  startOfYear,
  addDays, 
  addWeeks, 
  addMonths, 
  addYears,
  differenceInDays, 
  parseISO, 
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear
} from 'date-fns';

interface InsightsProps {
  periodSessions: Session[];
  category: Category;
}

export const Insights = ({ periodSessions = [], category }: InsightsProps) => {
  const isMobile = useIsMobile();
  const [granularity, setGranularity] = useState<TimeGranularity>('week');

  const getCategoryGradient = (category: Category) => {
    switch (category) {
      case 'weed': return 'from-green-500 to-emerald-600';
      case 'cigs': return 'from-gray-500 to-slate-600';
      case 'vapes': return 'from-cyan-500 to-blue-600';
      case 'liquor': return 'from-amber-500 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case 'weed': return '#10b981'; // emerald-500
      case 'cigs': return '#6b7280'; // gray-500
      case 'vapes': return '#06b6d4'; // cyan-500
      case 'liquor': return '#f59e0b'; // amber-500
      default: return '#3b82f6'; // blue-500
    }
  };

  const getCategoryUnit = (category: Category) => {
    switch (category) {
      case 'weed': return 'g';
      case 'cigs': return 'cigs';
      case 'vapes': return 'puffs';
      case 'liquor': return 'ml';
      default: return 'units';
    }
  };

  // Helper function to get ml from serving size for liquor
  const getMlFromServingSize = (servingSize?: string): number => {
    if (!servingSize) return 0;
    const match = servingSize.match(/(\d+)ml/);
    return match ? parseInt(match[1]) : 0;
  };

  // Calculate the individual consumption for a session
  const getIndividualConsumption = (session: Session): number => {
    if (category === 'liquor') {
      const mlPerServing = getMlFromServingSize(session.liquor_serving_size);
      return session.quantity * mlPerServing;
    } else {
      return session.quantity / session.participant_count;
    }
  };

  // Helper function to get the start of period based on granularity
  const getStartOfPeriod = (date: Date, granularity: TimeGranularity): Date => {
    switch (granularity) {
      case 'day': return startOfDay(date);
      case 'week': return startOfWeek(date);
      case 'month': return startOfMonth(date);
      case 'year': return startOfYear(date);
      default: return startOfDay(date);
    }
  };

  // Helper function to add period based on granularity
  const addPeriod = (date: Date, granularity: TimeGranularity): Date => {
    switch (granularity) {
      case 'day': return addDays(date, 1);
      case 'week': return addWeeks(date, 1);
      case 'month': return addMonths(date, 1);
      case 'year': return addYears(date, 1);
      default: return addDays(date, 1);
    }
  };

  // Helper function to check if two dates are in the same period
  const isSamePeriod = (date1: Date, date2: Date, granularity: TimeGranularity): boolean => {
    switch (granularity) {
      case 'day': return isSameDay(date1, date2);
      case 'week': return isSameWeek(date1, date2);
      case 'month': return isSameMonth(date1, date2);
      case 'year': return isSameYear(date1, date2);
      default: return isSameDay(date1, date2);
    }
  };

  // Process data for Sessions Over Time chart with complete time series
  const sessionsOverTimeData = useMemo(() => {
    if (periodSessions.length === 0) return [];

    // Get the date range
    const dates = periodSessions.map(s => parseISO(s.session_date));
    const minDate = getStartOfPeriod(new Date(Math.min(...dates.map(d => d.getTime()))), granularity);
    const maxDate = getStartOfPeriod(new Date(Math.max(...dates.map(d => d.getTime()))), granularity);

    // Create a complete time series with all periods from min to max
    const timeSeriesData: { date: string, sessions: number, consumption: number, sortKey: string }[] = [];
    let currentDate = minDate;

    while (currentDate <= maxDate) {
      let displayDate: string;
      
      switch (granularity) {
        case 'day':
          displayDate = format(currentDate, 'MMM dd');
          break;
        case 'week':
          displayDate = format(currentDate, "'Week of' MMM dd");
          break;
        case 'month':
          displayDate = format(currentDate, "MMM ''yy");
          break;
        case 'year':
          displayDate = format(currentDate, 'yyyy');
          break;
        default:
          displayDate = format(currentDate, 'MMM dd');
      }

      // Initialize with zero values
      const dataPoint = {
        date: displayDate,
        sessions: 0,
        consumption: 0,
        sortKey: format(currentDate, 'yyyy-MM-dd')
      };

      // Count sessions and consumption for this period
      periodSessions.forEach(session => {
        const sessionDate = parseISO(session.session_date);
        if (isSamePeriod(currentDate, sessionDate, granularity)) {
          dataPoint.sessions += 1;
          dataPoint.consumption += getIndividualConsumption(session);
        }
      });

      timeSeriesData.push(dataPoint);
      currentDate = addPeriod(currentDate, granularity);
    }

    return timeSeriesData.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [periodSessions, granularity, category]);

  // Process data for Consumption Breakdown chart (Top 5 types)
  const consumptionBreakdownData = useMemo(() => {
    const typeData: Record<string, number> = {};

    periodSessions.forEach(session => {
      const consumption = getIndividualConsumption(session);
      typeData[session.session_type] = (typeData[session.session_type] || 0) + consumption;
    });

    return Object.entries(typeData)
      .map(([type, consumption]) => ({ type, consumption }))
      .sort((a, b) => b.consumption - a.consumption)
      .slice(0, 5);
  }, [periodSessions, category]);

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (periodSessions.length === 0) {
      return {
        mostFrequentDay: 'No Data',
        averageRating: 'No Data',
        busiestTimeOfDay: 'No Data'
      };
    }

    // Most frequent day of week
    const dayCount: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    periodSessions.forEach(session => {
      const day = parseISO(session.session_date).getDay();
      const dayName = dayNames[day];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    const mostFrequentDay = Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No Data';

    // Average rating
    const ratingsWithValues = periodSessions.filter(s => s.rating !== null);
    const averageRating = ratingsWithValues.length > 0 
      ? (ratingsWithValues.reduce((sum, s) => sum + s.rating!, 0) / ratingsWithValues.length).toFixed(1)
      : 'No Data';

    // Busiest time of day
    const hourCount: Record<number, number> = {};
    
    periodSessions.forEach(session => {
      const hour = parseISO(session.session_date).getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const busiestHour = Object.entries(hourCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    const busiestTimeOfDay = busiestHour !== undefined 
      ? `${busiestHour}:00 - ${parseInt(busiestHour) + 1}:00`
      : 'No Data';

    return {
      mostFrequentDay,
      averageRating,
      busiestTimeOfDay
    };
  }, [periodSessions]);

  const categoryColor = getCategoryColor(category);
  const gradient = getCategoryGradient(category);
  const unit = getCategoryUnit(category);

  if (periodSessions.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="text-4xl mb-4 opacity-50">📊</div>
        <h3 className="heading-md text-gray-800 dark:text-gray-200 mb-2">No Data Available</h3>
        <p className="body-sm text-gray-600 dark:text-gray-400">
          Add some sessions to see insights and analytics
        </p>
      </div>
    );
  }

  const granularityOptions: { value: TimeGranularity; label: string; icon: typeof Clock }[] = [
    { value: 'day', label: 'Days', icon: Clock },
    { value: 'week', label: 'Weeks', icon: CalendarDays },
    { value: 'month', label: 'Months', icon: Calendar },
    { value: 'year', label: 'Years', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
          <span className="text-xl">📊</span>
        </div>
        <div>
          <h2 className="heading-lg text-gray-800 dark:text-gray-200">Insights</h2>
          <p className="body-sm text-gray-600 dark:text-gray-400">Data visualization for current period</p>
        </div>
      </div>

      {/* Sessions Over Time Chart */}
      <div className="glass-card p-6">
        <h3 className="heading-md text-gray-800 dark:text-gray-200 mb-4">Sessions Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sessionsOverTimeData}>
              <defs>
                <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={categoryColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={categoryColor} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-sm"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke={categoryColor}
                fillOpacity={1}
                fill="url(#sessionsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Granularity Control */}
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
            const isSelected = granularity === option.value;
            
            return (
              <Button
                key={option.value}
                onClick={() => setGranularity(option.value)}
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

      {/* Charts Grid */}
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'lg:grid-cols-2 gap-6'}`}>
        {/* Consumption Breakdown Chart */}
        <div className="glass-card p-6">
          <h3 className="heading-md text-gray-800 dark:text-gray-200 mb-4">Top 5 Types by Consumption</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="type" 
                  className="text-sm"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  className="text-sm"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} ${unit}`, 'Consumption']}
                />
                <Bar 
                  dataKey="consumption" 
                  fill={categoryColor}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Most Frequent Day */}
          <div className="glass-card p-4 text-center">
            <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
              <span className="text-lg">📅</span>
            </div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Most Frequent Day</h4>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{keyMetrics.mostFrequentDay}</p>
          </div>

          {/* Average Rating */}
          <div className="glass-card p-4 text-center">
            <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
              <span className="text-lg">⭐</span>
            </div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Average Rating</h4>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{keyMetrics.averageRating}</p>
          </div>

          {/* Busiest Time */}
          <div className="glass-card p-4 text-center">
            <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
              <span className="text-lg">🕐</span>
            </div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Busiest Time</h4>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{keyMetrics.busiestTimeOfDay}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 