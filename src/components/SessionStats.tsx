import { useMemo } from 'react';
import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionStatsProps {
  allSessions: Session[];
  periodSessions: Session[];
}

export const SessionStats = ({ allSessions, periodSessions }: SessionStatsProps) => {

  const foreverStats = useMemo(() => {
    const totalSessions = allSessions.length;
    const totalIndividualConsumption = allSessions.reduce((sum, s) => sum + (s.quantity / s.participant_count), 0);
    const sessionsWithRating = allSessions.filter(s => s.rating);
    const averageRating = sessionsWithRating.length > 0 
      ? (sessionsWithRating.reduce((sum, s) => sum + (s.rating || 0), 0) / sessionsWithRating.length).toFixed(1)
      : '0';
    return { totalSessions, totalIndividualConsumption, averageRating };
  }, [allSessions]);

  const filteredStats = useMemo(() => {
    const sessionsInPeriod = periodSessions.length;
    const individualInPeriod = periodSessions.reduce((sum, s) => sum + (s.quantity / s.participant_count), 0);
    return { sessionsInPeriod, individualInPeriod };
  }, [periodSessions]);

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
  );
};