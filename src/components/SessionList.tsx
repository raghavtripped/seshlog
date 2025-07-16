import { useState, useEffect } from 'react';
import { Session, Category } from '@/types/session';
import { useSessions } from '@/hooks/useSessions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Edit, Trash2, Calendar, Users, Hash, TrendingUp, Beaker, MessageSquare, Star, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { 
  getIndividualConsumptionWithUnit,
  getSessionUnitInfo
} from '@/lib/utils';

// --- Props Interface ---
interface SessionListProps {
  sessions: Session[];
  category: Category;
  onEditSession?: (session: Session) => void;
  onDeleteSession?: (sessionId: string) => void;
  initialExpanded?: boolean;
}

// --- Local Helper Functions ---
const getMlFromServingSize = (servingSize?: string): number => {
  if (!servingSize) return 0;
  const match = servingSize.match(/(\d+)ml/);
  return match ? parseInt(match[1]) : 0;
};

const getSessionTypeEmoji = (sessionType: string, category: Category) => {
  switch (category) {
    case 'weed':
      switch (sessionType) {
        case 'Joint': return '🌿';
        case 'Bong': return '💨';
        case 'Vape': return '💨';
        case 'Edible': return '🍪';
        default: return '🔄';
      }
    case 'cigs':
      switch (sessionType) {
        case 'Regular': return '🚬';
        case 'Light': return '🚬';
        case 'Menthol': return '🌿';
        case 'E-Cigarette': return '💨';
        default: return '🔄';
      }
    case 'vapes':
      switch (sessionType) {
        case 'Disposable': return '💨';
        case 'Pod': return '🔋';
        case 'Mod': return '🔧';
        case 'Pen': return '✏️';
        default: return '🔄';
      }
    case 'liquor':
      switch (sessionType) {
        case 'Beer': return '🍺';
        case 'Wine': return '🍷';
        case 'Spirits': return '🥃';
        case 'Cocktail': return '🍸';
        default: return '🔄';
      }
    default:
      return '📊';
  }
};

// --- Main Component ---
export const SessionList = ({ 
  sessions, 
  category, 
  onEditSession, 
  onDeleteSession,
  initialExpanded = false 
}: SessionListProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const { deleteSession } = useSessions(category);
  const isMobile = useIsMobile();

  const getCategoryGradient = (category: Category) => {
    switch (category) {
      case 'weed': return 'from-green-500 to-emerald-600';
      case 'cigs': return 'from-gray-500 to-slate-600';
      case 'vapes': return 'from-cyan-500 to-blue-600';
      case 'liquor': return 'from-amber-500 to-orange-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      onDeleteSession?.(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  if (sessions.length === 0) {
    return null; // Parent will handle empty state
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
  onEdit?: (session: Session) => void;
  onDelete: (sessionId: string) => void;
}

const SessionItem = ({ session, category, onEdit, onDelete }: SessionItemProps) => {
  const isMobile = useIsMobile();
  const sessionEmoji = getSessionTypeEmoji(session.session_type, category);

  // Get unit-aware consumption values
  const { value: consumptionValue, unit: consumptionUnit } = getIndividualConsumptionWithUnit(session);
  const sessionUnitInfo = getSessionUnitInfo(session.category, session.session_type);

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
          {onEdit && (
            <Button 
              onClick={() => onEdit(session)} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <Button 
            onClick={() => onDelete(session.id)} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-4 mb-4 text-center`}>
        <StatDisplay 
          icon={<Hash />} 
          label="Quantity" 
          value={session.quantity.toString()} 
          unit={sessionUnitInfo.unit}
        />
        {category === 'liquor' ? (
          <StatDisplay 
            icon={<Beaker />} 
            label="Size" 
            value={getMlFromServingSize(session.liquor_serving_size).toString()} 
            unit="ml"
          />
        ) : (
          <StatDisplay 
            icon={<Users />} 
            label="People" 
            value={session.participant_count.toString()} 
          />
        )}
        <StatDisplay 
          icon={<TrendingUp />} 
          label={category === 'liquor' ? 'Total' : 'Per Person'} 
          value={consumptionValue.toFixed(sessionUnitInfo.displayDecimals)} 
          unit={consumptionUnit}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-gray-600 dark:text-gray-300">Rating: {session.rating || 'N/A'}/5</span>
        </div>
        
        {/* --- NOTES SECTION --- */}
        {session.notes && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600/50">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed">
                {session.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Helper StatDisplay component ---
interface StatDisplayProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
}

const StatDisplay = ({ icon, label, value, unit }: StatDisplayProps) => (
  <div>
    <div className="flex items-center justify-center text-gray-400 mb-1">
      {icon}
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="font-semibold text-gray-800 dark:text-gray-200">
      {value}{unit ? ` ${unit}` : ''}
    </p>
  </div>
);