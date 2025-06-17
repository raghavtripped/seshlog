import { useMemo } from 'react';
import { Session, Category } from "@/types/session";
import { useIsMobile } from '@/hooks/use-mobile';

interface SessionStatsProps {
  sessions: Session[];
  category: Category;
}

export const SessionStats = ({ sessions = [], category }: SessionStatsProps) => {
  const isMobile = useIsMobile();

  const getCategoryEmoji = (category: Category) => {
    switch (category) {
      case 'weed': return '🌿';
      case 'cigs': return '🚬';
      case 'vapes': return '💨';
      case 'liquor': return '🥃';
      default: return '📊';
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

  const getCategoryName = (category: Category) => {
    switch (category) {
      case 'weed': return 'Weed';
      case 'cigs': return 'Cigarettes';
      case 'vapes': return 'Vapes';
      case 'liquor': return 'Liquor';
      default: return 'Sessions';
    }
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

  // Helper function to get ml per serving for liquor
  const getMlFromServingSize = (servingSize?: string): number => {
    if (!servingSize) return 0;
    const match = servingSize.match(/(\d+)ml/);
    return match ? parseInt(match[1]) : 0;
  };

  // Calculate total individual consumption
  const totalIndividualConsumption = sessions.reduce((sum, session) => {
    if (category === 'liquor') {
      const mlPerServing = getMlFromServingSize(session.liquor_serving_size);
      return sum + (session.quantity * mlPerServing);
    } else if (category === 'weed') {
      const perUnit = session.session_type === 'Joint' ? 2 : session.session_type === 'Bong' ? 1 : 1;
      return sum + ((session.quantity * perUnit) / session.participant_count);
    } else {
      return sum + (session.quantity / session.participant_count);
    }
  }, 0);

  // Calculate top session types with corrected logic
  const sessionTypeCounts = sessions.reduce((acc, session) => {
    const type = session.session_type;
    if (!acc[type]) {
      acc[type] = { 
        count: 0, 
        totalIndividualConsumption: 0
      };
    }
    acc[type].count += 1;
    if (category === 'liquor') {
      const mlPerServing = getMlFromServingSize(session.liquor_serving_size);
      acc[type].totalIndividualConsumption += (session.quantity * mlPerServing);
    } else if (category === 'weed') {
      const perUnit = session.session_type === 'Joint' ? 2 : session.session_type === 'Bong' ? 1 : 1;
      acc[type].totalIndividualConsumption += ((session.quantity * perUnit) / session.participant_count);
    } else {
      acc[type].totalIndividualConsumption += (session.quantity / session.participant_count);
    }
    return acc;
  }, {} as Record<string, { count: number; totalIndividualConsumption: number }>);

  const topSessionTypes = Object.entries(sessionTypeCounts)
    .map(([type, data]) => ({
      type,
      count: data.count,
      totalConsumption: data.totalIndividualConsumption, // Total consumption for this type
      avgPerSession: data.totalIndividualConsumption / data.count, // Average consumption per session
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 2);

  const categoryEmoji = getCategoryEmoji(category);
  const gradient = getCategoryGradient(category);
  const unit = getCategoryUnit(category);
  const categoryName = getCategoryName(category);

  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-6'}`}>
      {/* Combined Sessions & Consumption Card */}
      <div className={`glass-card ${isMobile ? 'p-4' : 'p-6'} space-y-4 sm:space-y-6`}>
        {/* Sessions Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
              <span className={`${isMobile ? 'text-lg' : 'text-xl'}`}>📅</span>
            </div>
            <div>
              <h3 className={`${isMobile ? 'text-base font-semibold' : 'heading-md'} text-gray-800 dark:text-gray-200`}>Sessions (Period)</h3>
              <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>Current filter</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 dark:text-gray-200 mb-1`}>
              {sessions.length}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>
              {categoryName} sessions tracked
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Total Consumption Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
              <span className={`${isMobile ? 'text-lg' : 'text-xl'}`}>👤</span>
            </div>
            <div>
              <h3 className={`${isMobile ? 'text-base font-semibold' : 'heading-md'} text-gray-800 dark:text-gray-200`}>
                {category === 'liquor' ? 'Total Consumption (Period)' : 'Total Individual Consumption (Period)'}
              </h3>
              <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>
                {category === 'liquor' ? 'Total amount consumed' : 'Your personal total'}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 dark:text-gray-200 mb-1`}>
              {totalIndividualConsumption.toFixed(2)}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>
              {category === 'liquor' ? `${unit} total consumed` : `${unit} consumed individually`}
            </p>
          </div>
        </div>
      </div>

      {/* Top Types Card */}
      <div className={`glass-card ${isMobile ? 'p-4' : 'p-6'} space-y-3 sm:space-y-4`}>
        <div className="flex items-center gap-3">
          <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
            <span className={`${isMobile ? 'text-lg' : 'text-xl'}`}>🏆</span>
          </div>
          <div>
            <h3 className={`${isMobile ? 'text-base font-semibold' : 'heading-md'} text-gray-800 dark:text-gray-200`}>Top Types (Period)</h3>
            <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>Most used types</p>
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {topSessionTypes.length > 0 ? (
            topSessionTypes.map((typeData, index) => (
              <div key={typeData.type} className={`glass-card-secondary ${isMobile ? 'p-3' : 'p-4'} rounded-lg`}>
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    {getSessionTypeEmoji(typeData.type, category)}
                  </span>
                  <div className="flex-1">
                    <p className={`${isMobile ? 'text-sm' : 'font-medium'} text-gray-800 dark:text-gray-200 mb-1`}>
                      {typeData.type}
                    </p>
                    <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>
                      {typeData.count} session{typeData.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className={`space-y-1 sm:space-y-2 ${isMobile ? 'ml-8' : 'ml-11'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>Total:</span>
                    <span className={`${isMobile ? 'text-xs font-medium' : 'body-sm font-semibold'} text-gray-800 dark:text-gray-200`}>
                      {typeData.totalConsumption.toFixed(1)} {unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>Average:</span>
                    <span className={`${isMobile ? 'text-xs font-medium' : 'body-sm font-semibold'} text-gray-800 dark:text-gray-200`}>
                      {typeData.avgPerSession.toFixed(1)} {unit}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
              <span className={`${isMobile ? 'text-3xl' : 'text-4xl'} mb-2 sm:mb-3 block opacity-50`}>{categoryEmoji}</span>
              <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>
                No sessions found for current filter
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};