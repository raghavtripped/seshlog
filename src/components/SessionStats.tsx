// /src/components/SessionStats.tsx

import { useState, useMemo } from 'react';
import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SessionStatsProps {
  sessions: Session[];
}

type FilterType = 'today' | 'week' | 'month' | 'year' | 'past_year' | 'all_time';

export const SessionStats = ({ sessions }: SessionStatsProps) => {
  const [filter, setFilter] = useState<FilterType>('week');

  const foreverStats = useMemo(() => {
    const totalSessions = sessions.length;
    // **FIXED: Use snake_case**
    const totalIndividualConsumption = sessions.reduce((sum, s) => sum + (s.quantity / s.participant_count), 0);
    const sessionsWithRating = sessions.filter(s => s.rating);
    const averageRating = sessionsWithRating.length > 0 
      ? (sessionsWithRating.reduce((sum, s) => sum + (s.rating || 0), 0) / sessionsWithRating.length).toFixed(1)
      : '0';
    return { totalSessions, totalIndividualConsumption, averageRating };
  }, [sessions]);

  const filteredStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const filteredSessions = sessions.filter(session => {
      // **FIXED: Use snake_case**
      const sessionDate = new Date(session.session_date);
      switch (filter) {
        // **FIXED: Added {} to each case to solve ESLint error**
        case 'today': {
          return sessionDate >= startOfToday;
        }
        case 'week': {
          const startOfWeek = new Date(startOfToday);
          startOfWeek.setDate(startOfWeek.getDate() - now.getDay());
          return sessionDate >= startOfWeek;
        }
        case 'month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return sessionDate >= startOfMonth;
        }
        case 'year': {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return sessionDate >= startOfYear;
        }
        case 'past_year': {
          const startOfPastYear = new Date(now);
          startOfPastYear.setFullYear(startOfPastYear.getFullYear() - 1);
          return sessionDate >= startOfPastYear;
        }
        case 'all_time':
        default:
          return true;
      }
    });

    const sessionsInPeriod = filteredSessions.length;
    // **FIXED: Use snake_case**
    const individualInPeriod = filteredSessions.reduce((sum, s) => sum + (s.quantity / s.participant_count), 0);

    return { sessionsInPeriod, individualInPeriod };
  }, [sessions, filter]);

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
              {foreverStats.totalSessions}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Individual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500 bg-clip-text text-transparent">
              {foreverStats.totalIndividualConsumption.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400 font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
              {foreverStats.averageRating}⭐
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger className="w-40 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white backdrop-blur-sm rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 backdrop-blur-md rounded-xl">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="past_year">Past Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sessions (Period)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                {filteredStats.sessionsInPeriod}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 font-medium">Individual (Period)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 dark:from-pink-400 dark:to-pink-500 bg-clip-text text-transparent">
                {filteredStats.individualInPeriod.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};