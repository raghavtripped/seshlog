import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut, UserIcon, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import type { Json } from '../integrations/supabase/types';

export default function Routines() {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Quick log function for any tracking item
  const logActivity = useMutation({
    mutationFn: async ({ activityType, data }: { activityType: string; data: Record<string, unknown> }) => {
      if (!user) throw new Error('Not logged in');
      
      const { error } = await supabase
        .from('daily_events')
        .insert([{
          user_id: user.id,
          event_type: activityType,
          payload: data as Json, // Type assertion for Json compatibility
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_events'] });
    },
  });

  const handleQuickLog = (activityType: string, activityName: string) => {
    const timestamp = new Date().toISOString();
    logActivity.mutate({
      activityType,
      data: {
        activity: activityName,
        logged_at: timestamp,
        quick_log: true,
      }
    });
  };

  const trackingActivities = [
    {
      id: 'sleep',
      title: 'Sleep Quality',
      emoji: '😴',
      description: isMobile ? 'Log sleep & wake time' : 'Track sleep quality, duration, and wake time',
      gradient: 'from-indigo-500 to-purple-600',
      eventType: 'SLEEP_LOG'
    },
    {
      id: 'mood',
      title: 'Mood Check',
      emoji: '😊',
      description: isMobile ? 'Rate your mood' : 'Track your mood and emotional state',
      gradient: 'from-yellow-500 to-orange-600',
      eventType: 'MOOD_LOG'
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      emoji: '🍎',
      description: isMobile ? 'Log meals & satisfaction' : 'Track meals, composition, and satisfaction',
      gradient: 'from-green-500 to-emerald-600',
      eventType: 'NUTRITION_LOG'
    },
    {
      id: 'hydration',
      title: 'Hydration',
      emoji: '💧',
      description: isMobile ? 'Track water intake' : 'Log water, coffee, and beverage consumption',
      gradient: 'from-blue-500 to-cyan-600',
      eventType: 'HYDRATION_LOG'
    },
    {
      id: 'activity',
      title: 'Physical Activity',
      emoji: '💪',
      description: isMobile ? 'Log workouts & movement' : 'Track exercise, workouts, and physical activity',
      gradient: 'from-red-500 to-pink-600',
      eventType: 'ACTIVITY_LOG'
    },
    {
      id: 'work',
      title: 'Work Focus',
      emoji: '💼',
      description: isMobile ? 'Track work sessions' : 'Log work sessions and productivity levels',
      gradient: 'from-gray-500 to-slate-600',
      eventType: 'WORK_LOG'
    },
    {
      id: 'pain',
      title: 'Pain/Stiffness',
      emoji: '🩹',
      description: isMobile ? 'Rate pain levels' : 'Track pain, stiffness, and body sensations',
      gradient: 'from-rose-500 to-red-600',
      eventType: 'SOMATIC_LOG'
    },
    {
      id: 'supplements',
      title: 'Supplements',
      emoji: '💊',
      description: isMobile ? 'Log supplements taken' : 'Track supplements and medications',
      gradient: 'from-teal-500 to-green-600',
      eventType: 'SUPPLEMENT_LOG'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="brand-logo mx-auto float">
            <span className="brand-emoji">📊</span>
          </div>
          <h1 className={`${isMobile ? 'text-xl font-semibold' : 'heading-lg'} text-gray-800 dark:text-gray-200`}>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Main Content */}
      <main className={`${isMobile ? 'pt-16 px-4 pb-8' : 'pt-20 px-6 pb-12'}`}>
        <div className={`max-w-6xl mx-auto ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          
          {/* Grid of tracking cards */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {trackingActivities.map((activity) => (
              <div
                key={activity.id}
                className={`glass-card ${isMobile ? 'p-4' : 'p-6'} hover:scale-105 transition-all duration-300 cursor-pointer group`}
                onClick={() => navigate(`/${activity.id}`)}
                tabIndex={0}
                role="button"
                aria-label={`Open ${activity.title} page`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/${activity.id}`);
                  }
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${activity.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-xl">{activity.emoji}</span>
                    </div>
                    {/* Quick Log button removed */}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${activity.gradient} group-hover:bg-clip-text transition-all duration-300`}>
                      {activity.title}
                    </h3>
                    <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400 leading-relaxed`}>
                      {activity.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick stats or recent activity could go here in phase 2 */}
          <div className="text-center mt-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Click "Quick Log" to instantly track any activity. More detailed logging coming soon!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 