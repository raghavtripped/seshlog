import { useState } from 'react';
import { Session, Category } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Hash, TrendingUp, Edit, Trash2, Beaker, Star, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { format } from 'date-fns';
import { useSessions } from '@/hooks/useSessions';
import { useIsMobile } from '@/hooks/use-mobile';
import { SessionForm } from './SessionForm';

interface SessionListProps {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  category: Category;
}

const getSessionTypeEmoji = (sessionType: string, category: Category) => {
  if (category === 'weed') {
    const emojis = {
      'Joint': '🌿',
      'Bong': '💨',
      'Vape': '💨',
      'Edible': '🍪',
      'Other': '🔄'
    };
    return emojis[sessionType as keyof typeof emojis] || '📝';
  } else if (category === 'cigs') {
    const emojis = {
      'Regular': '🚬',
      'Light': '🚬',
      'Menthol': '🌿',
      'E-Cigarette': '💨',
      'Other': '🔄'
    };
    return emojis[sessionType as keyof typeof emojis] || '🚬';
  } else if (category === 'vapes') {
    const emojis = {
      'Disposable': '💨',
      'Pod': '🔋',
      'Mod': '🔧',
      'Pen': '✏️',
      'Other': '🔄'
    };
    return emojis[sessionType as keyof typeof emojis] || '💨';
  } else if (category === 'liquor') {
    const emojis = {
      'Beer': '🍺',
      'Wine': '🍷',
      'Spirits': '🥃',
      'Cocktail': '🍸',
      'Other': '🔄'
    };
    return emojis[sessionType as keyof typeof emojis] || '🥃';
  }
  return '📝';
};

// Helper function to get ml from serving size
const getMlFromServingSize = (servingSize?: string): number => {
  if (!servingSize) return 0;
  const match = servingSize.match(/(\d+)ml/);
  return match ? parseInt(match[1]) : 0;
};

const getQuantityLabel = (sessionType: string, quantity: number, category: Category) => {
  if (category === 'weed') {
    const labels = {
      'Joint': quantity === 1 ? 'joint' : 'joints',
      'Bong': quantity === 1 ? 'bowl' : 'bowls',
      'Vape': quantity === 1 ? 'session' : 'sessions',
      'Edible': quantity === 1 ? 'piece' : 'pieces',
      'Other': quantity === 1 ? 'item' : 'items'
    };
    return `${quantity} ${labels[sessionType as keyof typeof labels] || 'items'}`;
  } else if (category === 'cigs') {
    const labels = {
      'Regular': quantity === 1 ? 'cigarette' : 'cigarettes',
      'Light': quantity === 1 ? 'cigarette' : 'cigarettes',
      'Menthol': quantity === 1 ? 'cigarette' : 'cigarettes',
      'E-Cigarette': quantity === 1 ? 'session' : 'sessions',
      'Other': quantity === 1 ? 'item' : 'items'
    };
    return `${quantity} ${labels[sessionType as keyof typeof labels] || 'items'}`;
  } else if (category === 'vapes') {
    return `${quantity} ${quantity === 1 ? 'session' : 'sessions'}`;
  } else if (category === 'liquor') {
    return `${quantity} ${quantity === 1 ? 'serving' : 'servings'}`;
  }
  return `${quantity} items`;
};

const getIndividualLabel = (sessionType: string, individual: number, category: Category) => {
  if (category === 'weed') {
    const labels = {
      'Joint': 'joints',
      'Bong': 'bowls', 
      'Vape': 'sessions',
      'Edible': 'pieces',
      'Other': 'items'
    };
    return `${individual.toFixed(2)} ${labels[sessionType as keyof typeof labels] || 'items'} per person`;
  } else if (category === 'cigs') {
    const labels = {
      'Regular': 'cigarettes',
      'Light': 'cigarettes',
      'Menthol': 'cigarettes',
      'E-Cigarette': 'sessions',
      'Other': 'items'
    };
    return `${individual.toFixed(2)} ${labels[sessionType as keyof typeof labels] || 'items'} per person`;
  } else if (category === 'vapes') {
    return `${individual.toFixed(2)} sessions per person`;
  } else if (category === 'liquor') {
    return `${individual.toFixed(0)} ml total consumed`;
  }
  return `${individual.toFixed(2)} items per person`;
};

const getCategoryEmoji = (category: Category) => {
  switch (category) {
    case 'weed': return '🌿';
    case 'cigs': return '🚬';
    case 'vapes': return '💨';
    case 'liquor': return '🥃';
    default: return '📝';
  }
};

const getCategoryGradient = (category: Category) => {
  switch (category) {
    case 'weed': return 'from-green-500 to-emerald-600';
    case 'cigs': return 'from-gray-500 to-slate-600';
    case 'vapes': return 'from-cyan-500 to-blue-600';
    case 'liquor': return 'from-amber-500 to-orange-600';
    default: return 'from-blue-500 to-purple-600';
  }
};

const getCategoryUnit = (category: Category) => {
  switch (category) {
    case 'weed': return 'g';
    case 'cigs': return 'cigs';
    case 'vapes': return 'puffs';
    case 'liquor': return 'ml';
    default: return 'units';
  }
};

export const SessionList = ({ sessions, loading, error, category }: SessionListProps) => {
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const isMobile = useIsMobile();
  // Collapsed by default on both desktop and mobile
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteSession } = useSessions(category);

  const handleEdit = (session: Session) => {
    setEditingSession(session);
  };

  const handleDelete = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleEditComplete = () => {
    setEditingSession(null);
  };

  if (editingSession) {
    return (
      <div className={`${isMobile ? 'p-2' : ''}`}>
        <SessionForm 
          category={category} 
          initialSession={editingSession}
        />
        <div className={`${isMobile ? 'mt-4' : 'mt-6'} text-center`}>
          <Button 
            onClick={handleEditComplete}
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel Edit
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`glass-card-secondary ${isMobile ? 'p-4' : 'p-6'} text-center`}>
        <div className="space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className={`${isMobile ? 'text-sm' : 'body-sm'} text-gray-600 dark:text-gray-400`}>Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass-card-secondary ${isMobile ? 'p-4' : 'p-6'} text-center`}>
        <div className="space-y-4">
          <div className="text-red-500 text-4xl">⚠️</div>
          <div>
            <h3 className={`${isMobile ? 'text-base font-medium' : 'font-medium'} text-red-600 dark:text-red-400 mb-2`}>Error Loading Sessions</h3>
            <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const categoryEmoji = getCategoryEmoji(category);
  const gradient = getCategoryGradient(category);
  const unit = getCategoryUnit(category);

  return (
    <div className={`glass-card-secondary ${isMobile ? 'p-4' : 'p-6'} space-y-4 sm:space-y-6`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
            <span className={`${isMobile ? 'text-lg' : 'text-xl'}`}>📋</span>
          </div>
          <div>
            <h3 className={`${isMobile ? 'text-base font-semibold' : 'heading-md'} text-gray-800 dark:text-gray-200`}>Recent Sessions</h3>
            <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="p-1">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>
      </div>
      
      {isExpanded && (
        <>
          {sessions.length === 0 ? (
            <div className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
              <span className={`${isMobile ? 'text-4xl' : 'text-6xl'} mb-4 block opacity-50`}>{categoryEmoji}</span>
              <h4 className={`${isMobile ? 'text-base font-medium' : 'heading-md'} text-gray-700 dark:text-gray-300 mb-2`}>No sessions yet</h4>
              <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-500 dark:text-gray-400`}>
                Start tracking by logging your first session above
              </p>
            </div>
          ) : (
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
              {sessions.map((session) => {
                const sessionEmoji = getSessionTypeEmoji(session.session_type, category);
                
                // Calculate consumption based on category
                let consumptionValue: number;
                let consumptionUnit: string;
                
                if (category === 'liquor') {
                  const mlPerServing = getMlFromServingSize(session.liquor_serving_size);
                  consumptionValue = session.quantity * mlPerServing;
                  consumptionUnit = unit;
                } else {
                  consumptionValue = session.quantity / session.participant_count;
                  consumptionUnit = unit;
                }

                return (
                  <div key={session.id} className={`glass-card ${isMobile ? 'p-3' : 'p-4 sm:p-6'} hover:shadow-lg transition-all duration-200`}>
                    {/* Header */}
                    <div className={`flex items-start justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>{sessionEmoji}</span>
                        <div>
                          <h4 className={`${isMobile ? 'text-sm font-medium' : 'font-semibold'} text-gray-800 dark:text-gray-200`}>
                            {session.session_type}
                          </h4>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Calendar className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                            <span className={`${isMobile ? 'text-xs' : 'body-sm'}`}>
                              {format(new Date(session.session_date), isMobile ? 'MMM d, HH:mm' : 'MMM d, yyyy • HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className={`flex gap-${isMobile ? '1' : '2'}`}>
                        <Button
                          onClick={() => handleEdit(session)}
                          variant="ghost"
                          size={isMobile ? "sm" : "sm"}
                          className={`${isMobile ? 'w-8 h-8 p-0' : 'w-8 h-8 p-0'} hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300`}
                        >
                          <Edit className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        </Button>
                        <Button
                          onClick={() => handleDelete(session.id)}
                          variant="ghost"
                          size={isMobile ? "sm" : "sm"}
                          className={`${isMobile ? 'w-8 h-8 p-0' : 'w-8 h-8 p-0'} hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300`}
                        >
                          <Trash2 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    {category === 'liquor' ? (
                      <div className={`grid grid-cols-3 gap-${isMobile ? '2' : '4'} mb-${isMobile ? '3' : '4'}`}>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Hash className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 dark:text-gray-400`} />
                            <span className={`${isMobile ? 'text-xs' : 'body-xs'} text-gray-500 dark:text-gray-400`}>Servings</span>
                          </div>
                          <p className={`${isMobile ? 'text-sm font-medium' : 'body-sm font-medium'} text-gray-700 dark:text-gray-300`}>{session.quantity}</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 dark:text-gray-400`} />
                            <span className={`${isMobile ? 'text-xs' : 'body-xs'} text-gray-500 dark:text-gray-400`}>Size</span>
                          </div>
                          <p className={`${isMobile ? 'text-sm font-medium' : 'body-sm font-medium'} text-gray-700 dark:text-gray-300`}>
                            {getMlFromServingSize(session.liquor_serving_size)}ml
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 dark:text-gray-400`} />
                            <span className={`${isMobile ? 'text-xs' : 'body-xs'} text-gray-500 dark:text-gray-400`}>Total</span>
                          </div>
                          <p className={`${isMobile ? 'text-sm font-medium' : 'body-sm font-medium'} text-gray-700 dark:text-gray-300`}>
                            {consumptionValue.toFixed(0)} {consumptionUnit}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className={`grid grid-cols-3 gap-${isMobile ? '2' : '4'} mb-${isMobile ? '3' : '4'}`}>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Hash className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 dark:text-gray-400`} />
                            <span className={`${isMobile ? 'text-xs' : 'body-xs'} text-gray-500 dark:text-gray-400`}>Quantity</span>
                          </div>
                          <p className={`${isMobile ? 'text-sm font-medium' : 'body-sm font-medium'} text-gray-700 dark:text-gray-300`}>{session.quantity}</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Users className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 dark:text-gray-400`} />
                            <span className={`${isMobile ? 'text-xs' : 'body-xs'} text-gray-500 dark:text-gray-400`}>People</span>
                          </div>
                          <p className={`${isMobile ? 'text-sm font-medium' : 'body-sm font-medium'} text-gray-700 dark:text-gray-300`}>{session.participant_count}</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500 dark:text-gray-400`} />
                            <span className={`${isMobile ? 'text-xs' : 'body-xs'} text-gray-500 dark:text-gray-400`}>Per Person</span>
                          </div>
                          <p className={`${isMobile ? 'text-sm font-medium' : 'body-sm font-medium'} text-gray-700 dark:text-gray-300`}>
                            {consumptionValue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Consumption Highlight */}
                    <div className={`glass-card-secondary ${isMobile ? 'p-3' : 'p-4'} border border-blue-200/50 dark:border-blue-800/50 mb-${isMobile ? '3' : '4'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`${isMobile ? 'text-lg' : 'text-xl'}`}>🎯</span>
                          <span className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>
                            {category === 'liquor' ? 'Total Consumed' : 'Individual Consumption'}
                          </span>
                        </div>
                        <span className={`${isMobile ? 'text-sm font-semibold' : 'font-semibold'} gradient-text`}>
                          {consumptionValue.toFixed(2)} {consumptionUnit}
                        </span>
                      </div>
                    </div>

                    {/* Rating and Notes */}
                    <div className={`space-y-${isMobile ? '2' : '3'}`}>
                      {/* Rating */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-amber-500`} />
                          <span className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>Rating:</span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={`${isMobile ? 'text-sm' : 'text-base'} ${
                                star <= (session.rating || 0) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'
                              }`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-500 dark:text-gray-400`}>
                          ({session.rating || 0}/5)
                        </span>
                      </div>

                      {/* Notes */}
                      {session.notes && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className={`${isMobile ? 'w-3 h-3 mt-0.5' : 'w-4 h-4 mt-0.5'} text-gray-500 dark:text-gray-400 flex-shrink-0`} />
                          <div>
                            <span className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400 block mb-1`}>Notes:</span>
                            <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-700 dark:text-gray-300 leading-relaxed`}>
                              {session.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};