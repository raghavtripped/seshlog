import { Session } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Hash, TrendingUp, Edit, Trash2 } from "lucide-react";

interface SessionListProps {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
}

const getSessionTypeEmoji = (sessionType: string) => {
  const emojis = {
    'Joint': '🌿',
    'Bong': '💨',
    'Vape': '💨',
    'Edible': '🍪',
    'Other': '🔄'
  };
  return emojis[sessionType as keyof typeof emojis] || '📝';
};

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

export const SessionList = ({ sessions, onEdit, onDelete }: SessionListProps) => {

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="glass-card p-12 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🌿</span>
          </div>
          <h3 className="heading-md text-gray-800 dark:text-gray-200">No sessions found</h3>
          <p className="body-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            No sessions match your current filters. Try adjusting the date range or sort options, 
            or log your first session to get started!
          </p>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 2) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div key={session.id} className="glass-card-secondary hover-lift hover-shadow transition-smooth group">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">{getSessionTypeEmoji(session.session_type)}</span>
                </div>
                <div>
                  <h3 className="heading-md gradient-text">{session.session_type}</h3>
                  <p className="body-xs text-gray-500 dark:text-gray-400">{formatDateTime(session.session_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {session.rating && (
                  <div className={`glass-card-secondary px-3 py-1 rounded-full ${getRatingColor(session.rating)}`}>
                    <span className="body-sm font-semibold">{session.rating}/5</span>
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(session)} 
                  className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full transition-smooth"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(session.id)} 
                  className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full transition-smooth"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="body-xs text-gray-500 dark:text-gray-400">Quantity</span>
                </div>
                <p className="body-sm font-medium text-gray-700 dark:text-gray-300">{session.quantity}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="body-xs text-gray-500 dark:text-gray-400">People</span>
                </div>
                <p className="body-sm font-medium text-gray-700 dark:text-gray-300">{session.participant_count}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="body-xs text-gray-500 dark:text-gray-400">Per Person</span>
                </div>
                <p className="body-sm font-medium text-gray-700 dark:text-gray-300">
                  {(session.quantity / session.participant_count).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Individual Consumption Highlight */}
            <div className="glass-card p-4 border border-blue-200/50 dark:border-blue-800/50 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🎯</span>
                </div>
                <span className="body-sm font-medium text-gray-700 dark:text-gray-300">Individual Consumption</span>
              </div>
              <p className="body-sm text-blue-600 dark:text-blue-400 font-semibold">
                {getIndividualLabel(session.session_type, session.quantity / session.participant_count)}
              </p>
            </div>
            
            {/* Notes */}
            {session.notes && (
              <div className="glass-card-secondary p-4 border-l-4 border-indigo-500 dark:border-indigo-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="body-xs font-medium text-gray-600 dark:text-gray-400">Notes</span>
                </div>
                <p className="body-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">"{session.notes}"</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};