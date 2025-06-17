import { useMemo } from 'react';
import { Session } from "@/types/session";

interface SessionStatsProps {
  allSessions: Session[];
  periodSessions: Session[];
}

export const SessionStats = ({ allSessions, periodSessions }: SessionStatsProps) => {

  const foreverStats = useMemo(() => {
    const totalSessions = allSessions.length;
    const totalIndividualConsumption = allSessions.reduce((sum, s) => sum + (s.quantity / s.participant_count), 0);
    const sessionsWithRating = allSessions.filter(s => s.rating);
    const averageRating = sessionsWithRating.length > 0 
      ? (sessionsWithRating.reduce((sum, s) => sum + (s.rating || 0), 0) / sessionsWithRating.length).toFixed(1)
      : '0';
    return { totalSessions, totalIndividualConsumption, averageRating };
  }, [allSessions]);

  const filteredStats = useMemo(() => {
    const sessionsInPeriod = periodSessions.length;
    
    // Calculate top consumed types in the period
    const typeConsumption = periodSessions.reduce((acc, session) => {
      const individual = session.quantity / session.participant_count;
      acc[session.session_type] = (acc[session.session_type] || 0) + individual;
      return acc;
    }, {} as Record<string, number>);

    // Get top 2 types sorted by consumption
    const topTypes = Object.entries(typeConsumption)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    return { sessionsInPeriod, topTypes };
  }, [periodSessions]);

  const getTypeEmoji = (sessionType: string) => {
    const emojis = {
      'Joint': '🌿',
      'Bong': '💨',
      'Vape': '💨',
      'Edible': '🍪',
      'Other': '🔄'
    };
    return emojis[sessionType as keyof typeof emojis] || '📝';
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-card p-6 hover-lift transition-smooth">
          <div className="flex items-center justify-between mb-4">
            <h3 className="form-text text-gray-600 dark:text-gray-400">Total Sessions</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
          </div>
          <div className="heading-lg gradient-text">
            {foreverStats.totalSessions}
          </div>
          <p className="body-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
        </div>

        <div className="glass-card p-6 hover-lift transition-smooth">
          <div className="flex items-center justify-between mb-4">
            <h3 className="form-text text-gray-600 dark:text-gray-400">Total Individual</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">👤</span>
            </div>
          </div>
          <div className="heading-lg text-purple-600 dark:text-purple-400">
            {foreverStats.totalIndividualConsumption.toFixed(2)}
          </div>
          <p className="body-xs text-gray-500 dark:text-gray-400 mt-1">Personal consumption</p>
        </div>

        <div className="glass-card p-6 hover-lift transition-smooth">
          <div className="flex items-center justify-between mb-4">
            <h3 className="form-text text-gray-600 dark:text-gray-400">Average Rating</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">⭐</span>
            </div>
          </div>
          <div className="heading-lg text-amber-600 dark:text-amber-400">
            {foreverStats.averageRating}
          </div>
          <p className="body-xs text-gray-500 dark:text-gray-400 mt-1">Out of 5</p>
        </div>
      </div>
      
      {/* Period Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card-secondary p-6 hover-lift transition-smooth">
          <div className="flex items-center justify-between mb-4">
            <h3 className="form-text text-gray-600 dark:text-gray-400">Sessions (Period)</h3>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📅</span>
            </div>
          </div>
          <div className="heading-md text-blue-600 dark:text-blue-400">
            {filteredStats.sessionsInPeriod}
          </div>
          <p className="body-xs text-gray-500 dark:text-gray-400 mt-1">Current filter</p>
        </div>

        <div className="glass-card-secondary p-6 hover-lift transition-smooth">
          <div className="flex items-center justify-between mb-4">
            <h3 className="form-text text-gray-600 dark:text-gray-400">Top Types (Period)</h3>
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🏆</span>
            </div>
          </div>
          <div className="space-y-2">
            {filteredStats.topTypes.length > 0 ? (
              filteredStats.topTypes.map(([type, consumption], index) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getTypeEmoji(type)}</span>
                    <span className="body-sm font-medium text-gray-700 dark:text-gray-300">
                      {type}
                    </span>
                  </div>
                  <span className="body-sm text-pink-600 dark:text-pink-400 font-semibold">
                    {consumption.toFixed(1)}
                  </span>
                </div>
              ))
            ) : (
              <p className="body-sm text-gray-500 dark:text-gray-400">No data</p>
            )}
          </div>
          <p className="body-xs text-gray-500 dark:text-gray-400 mt-2">Individual consumption</p>
        </div>
      </div>
    </div>
  );
};