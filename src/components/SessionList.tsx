import { useState } from 'react';
import { Session, Category } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Hash, TrendingUp, Edit, Trash2, Star, MessageSquare, ChevronDown, ChevronUp, Loader2, Beaker } from "lucide-react";
import { format } from 'date-fns';
import { getCategoryGradient } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// --- Props Interface ---
interface SessionListProps {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  category: Category;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

// --- Local Helper Functions ---
const getSessionTypeEmoji = (sessionType: string, category: Category) => {
  if (category === 'weed') {
    const emojis: { [key: string]: string } = { 'Joint': '🌿', 'Bong': '💨', 'Vape': '💨', 'Edible': '🍪', 'Other': '🔄' };
    return emojis[sessionType] || '📝';
  }
  if (category === 'cigs') {
    const emojis: { [key: string]: string } = { 'Regular': '🚬', 'Light': '🚬', 'Menthol': '🌿', 'E-Cigarette': '💨', 'Other': '🔄' };
    return emojis[sessionType] || '🚬';
  }
  if (category === 'vapes') {
    const emojis: { [key: string]: string } = { 'Disposable': '💨', 'Pod': '🔋', 'Mod': '🔧', 'Pen': '✏️', 'Other': '🔄' };
    return emojis[sessionType] || '💨';
  }
  if (category === 'liquor') {
    const emojis: { [key: string]: string } = { 'Beer': '🍺', 'Wine': '🍷', 'Spirits': '🥃', 'Cocktail': '🍸', 'Other': '🔄' };
    return emojis[sessionType] || '🥃';
  }
  return '📝';
};

const getMlFromServingSize = (servingSize?: string): number => {
  if (!servingSize) return 0;
  const match = servingSize.match(/(\d+)ml/);
  return match ? parseInt(match[1], 10) : 0;
};

// --- Main Component ---
export const SessionList = ({ 
  sessions, 
  isLoading, 
  error, 
  category,
  onEditSession,
  onDeleteSession
}: SessionListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await onDeleteSession(sessionId);
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="font-semibold text-red-600 dark:text-red-400">Error Loading Sessions</h3>
        <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
      </div>
    );
  }

  const gradient = getCategoryGradient(category);
  const categoryEmoji = '📋';

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
            <span className="text-2xl">{categoryEmoji}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Sessions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block opacity-50">{getSessionTypeEmoji('', category)}</span>
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">No sessions yet</h4>
              <p className="text-gray-500 dark:text-gray-400">Log your first session to see it here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionItem 
                  key={session.id} 
                  session={session} 
                  category={category} 
                  onEdit={onEditSession}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Sub-component for a single session item ---
interface SessionItemProps {
  session: Session;
  category: Category;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
}

const SessionItem = ({ session, category, onEdit, onDelete }: SessionItemProps) => {
  const isMobile = useIsMobile();
  const sessionEmoji = getSessionTypeEmoji(session.session_type, category);

  let consumptionValue: number;
  if (category === 'liquor' && session.liquor_serving_size) {
    const mlPerServing = getMlFromServingSize(session.liquor_serving_size);
    consumptionValue = session.quantity * mlPerServing;
  } else {
    consumptionValue = session.participant_count > 0 ? session.quantity / session.participant_count : 0;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{sessionEmoji}</span>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{session.session_type}</h4>
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(session.session_date), 'MMM d, yyyy • HH:mm')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button onClick={() => onEdit(session)} variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50">
            <Edit className="w-4 h-4" />
          </Button>
          <Button onClick={() => onDelete(session.id)} variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-4 mb-4 text-center`}>
        <StatDisplay icon={<Hash />} label="Quantity" value={session.quantity.toString()} />
        {category === 'liquor' ? (
          <StatDisplay icon={<Beaker />} label="Size" value={`${getMlFromServingSize(session.liquor_serving_size)}ml`} />
        ) : (
          <StatDisplay icon={<Users />} label="People" value={session.participant_count.toString()} />
        )}
        <StatDisplay icon={<TrendingUp />} label={category === 'liquor' ? 'Total' : 'Per Person'} value={consumptionValue.toFixed(category === 'liquor' ? 0 : 2)} unit={category === 'liquor' ? 'ml' : undefined} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-gray-600 dark:text-gray-300">Rating: {session.rating || 'N/A'}/5</span>
        </div>
        
        {/* --- MODIFIED NOTES SECTION --- */}
        {session.notes && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600/50">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed">
                "{session.notes}"
              </p>
            </div>
          </div>
        )}
        {/* --- END OF MODIFIED SECTION --- */}
      </div>
    </div>
  );
};

const StatDisplay = ({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string, unit?: string }) => (
  <div>
    <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
      {icon}
      <span>{label}</span>
    </div>
    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
      {value}
      {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
    </p>
  </div>
);