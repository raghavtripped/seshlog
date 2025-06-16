
import { useState } from "react";
import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Hash, TrendingUp, ArrowUpDown } from "lucide-react";

interface SessionListProps {
  sessions: Session[];
}

const getQuantityLabel = (sessionType: string, quantity: number) => {
  const labels = {
    'Joint': quantity === 1 ? 'joint' : 'joints',
    'Bong': quantity === 1 ? 'bowl' : 'bowls',
    'Vape': quantity === 1 ? 'session' : 'sessions',
    'Edible': quantity === 1 ? 'piece' : 'pieces',
    'Other': quantity === 1 ? 'item' : 'items'
  };
  return `${quantity} ${labels[sessionType as keyof typeof labels] || 'items'}`;
};

const getIndividualLabel = (sessionType: string, individual: number) => {
  const labels = {
    'Joint': 'joints',
    'Bong': 'bowls', 
    'Vape': 'sessions',
    'Edible': 'pieces',
    'Other': 'items'
  };
  return `${individual.toFixed(2)} ${labels[sessionType as keyof typeof labels] || 'items'} per person`;
};

export const SessionList = ({ sessions }: SessionListProps) => {
  const [sortBy, setSortBy] = useState<string>('date-desc');

  const sortedSessions = [...sessions].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime();
      case 'date-asc':
        return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
      case 'rating-desc':
        return (b.rating || 0) - (a.rating || 0);
      case 'rating-asc':
        return (a.rating || 0) - (b.rating || 0);
      case 'individual-desc':
        return (b.individualConsumption || 0) - (a.individualConsumption || 0);
      case 'individual-asc':
        return (a.individualConsumption || 0) - (b.individualConsumption || 0);
      case 'type':
        return a.sessionType.localeCompare(b.sessionType);
      default:
        return 0;
    }
  });

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/30">
          <div className="text-6xl mb-6 opacity-60">🌿</div>
          <h3 className="text-2xl font-semibold text-gray-200 mb-3">No sessions yet</h3>
          <p className="text-gray-400">Click "Log New Session" to get started on your journey!</p>
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Recent Sessions</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 bg-gray-800/50 border-gray-600 text-white backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 backdrop-blur-md">
              <SelectItem value="date-desc" className="text-white hover:bg-gray-700">Newest First</SelectItem>
              <SelectItem value="date-asc" className="text-white hover:bg-gray-700">Oldest First</SelectItem>
              <SelectItem value="rating-desc" className="text-white hover:bg-gray-700">Highest Rated</SelectItem>
              <SelectItem value="rating-asc" className="text-white hover:bg-gray-700">Lowest Rated</SelectItem>
              <SelectItem value="individual-desc" className="text-white hover:bg-gray-700">Most Individual</SelectItem>
              <SelectItem value="individual-asc" className="text-white hover:bg-gray-700">Least Individual</SelectItem>
              <SelectItem value="type" className="text-white hover:bg-gray-700">By Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {sortedSessions.map((session) => (
        <Card key={session.id} className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01] group">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-3">
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-bold">
                  {session.sessionType}
                </span>
                {session.rating && (
                  <div className="flex">
                    {Array.from({ length: session.rating }, (_, i) => (
                      <span key={i} className="text-yellow-400 text-sm drop-shadow-sm">⭐</span>
                    ))}
                  </div>
                )}
              </CardTitle>
              <div className="flex items-center gap-5 text-sm text-gray-400">
                <div className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
                  <Hash className="w-4 h-4" />
                  <span>{getQuantityLabel(session.sessionType, session.quantity)}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
                  <Users className="w-4 h-4" />
                  <span>{session.participantCount}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
                  <Calendar className="w-4 h-4" />
                  <span title={formatDateTime(session.sessionDate)}>{formatDate(session.sessionDate)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            {/* Individual Consumption */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-medium text-sm">Individual consumption:</span>
                <span className="text-white font-semibold">
                  {getIndividualLabel(session.sessionType, session.individualConsumption || 0)}
                </span>
              </div>
            </div>
            
            {session.notes && (
              <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-3">
                <p className="text-gray-300 italic leading-relaxed">"{session.notes}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
