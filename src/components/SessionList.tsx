import { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Hash, TrendingUp, Edit, Trash2 } from "lucide-react";

interface SessionListProps {
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
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

export const SessionList = ({ sessions, onEdit, onDelete }: SessionListProps) => {

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-gray-200/50 dark:border-gray-700/30">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 opacity-60">🌿</div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">No sessions match your filters</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Try adjusting the date range or sort options.</p>
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {sessions.map((session) => (
        <Card key={session.id} className="bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01] group rounded-2xl">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-3">
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent font-bold">
                  {session.session_type}
                </span>
                {session.rating && (
                  <div className="flex">
                    {Array.from({ length: session.rating }, (_, i) => (
                      <span key={i} className="text-amber-400 text-sm drop-shadow-sm">⭐</span>
                    ))}
                  </div>
                )}
              </CardTitle>
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5">
                <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
                    <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{getQuantityLabel(session.session_type, session.quantity)}</span>
                    <span className="sm:hidden">{session.quantity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{session.participant_count}</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span title={new Date(session.session_date).toString()}>{formatDateTime(session.session_date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(session)} className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(session.id)} className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200/60 dark:border-emerald-700/20 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">Individual consumption:</span>
                <span className="text-gray-900 dark:text-white font-semibold text-sm">
                  {getIndividualLabel(session.session_type, session.quantity / session.participant_count)}
                </span>
              </div>
            </div>
            
            {session.notes && (
              <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200/60 dark:border-gray-600/30 rounded-xl p-3">
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed text-sm">"{session.notes}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};