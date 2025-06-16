
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

  const favoriteType = sessions.length > 0 
    ? sessions.reduce((acc, session) => {
        acc[session.sessionType] = (acc[session.sessionType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};

  const mostUsedType = Object.keys(favoriteType).length > 0 
    ? Object.entries(favoriteType).sort(([,a], [,b]) => b - a)[0][0]
    : 'None';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400">Total Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-400">{totalSessions}</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-400">{thisWeek}</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400">Avg Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-400">{averageRating}⭐</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400">Favorite Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-purple-400">{mostUsedType}</div>
        </CardContent>
      </Card>
    </div>
  );
};
