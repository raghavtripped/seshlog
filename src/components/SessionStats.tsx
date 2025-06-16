
import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionStatsProps {
  sessions: Session[];
}

export const SessionStats = ({ sessions }: SessionStatsProps) => {
  const totalSessions = sessions.length;
  const thisWeek = sessions.filter(session => {
    const sessionDate = new Date(session.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  }).length;

  const averageRating = sessions.length > 0 
    ? (sessions.reduce((sum, session) => sum + (session.rating || 0), 0) / sessions.length).toFixed(1)
    : '0';

  const averageIndividual = sessions.length > 0 
    ? (sessions.reduce((sum, session) => sum + (session.individualConsumption || 0), 0) / sessions.length).toFixed(2)
    : '0';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="hidden sm:inline">Total Sessions</span>
            <span className="sm:hidden">Total</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
            {totalSessions}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="hidden sm:inline">This Week</span>
            <span className="sm:hidden">Week</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
            {thisWeek}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="hidden sm:inline">Avg Rating</span>
            <span className="sm:hidden">Rating</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
            {averageRating}⭐
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="hidden sm:inline">Avg Individual</span>
            <span className="sm:hidden">Individual</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500 bg-clip-text text-transparent">
            {averageIndividual}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
