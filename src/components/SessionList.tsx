
import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";

interface SessionListProps {
  sessions: Session[];
}

export const SessionList = ({ sessions }: SessionListProps) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <div className="text-6xl mb-4">🌿</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No sessions yet</h3>
          <p>Click "Log New Session" to get started!</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Recent Sessions</h2>
      
      {sessions.map((session) => (
        <Card key={session.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <span>{session.sessionType}</span>
                {session.rating && (
                  <div className="flex">
                    {Array.from({ length: session.rating }, (_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">⭐</span>
                    ))}
                  </div>
                )}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{session.participantCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(session.createdAt)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          {session.notes && (
            <CardContent className="pt-0">
              <p className="text-gray-300 italic">"{session.notes}"</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
