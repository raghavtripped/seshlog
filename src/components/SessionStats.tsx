
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Total Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
            {totalSessions}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
            {thisWeek}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            Avg Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            {averageRating}⭐
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-400 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Avg Individual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
            {averageIndividual}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
