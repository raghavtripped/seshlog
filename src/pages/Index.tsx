import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Session, SessionType } from "@/types/session";
import { AppDashboard } from "@/components/AppDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user's sessions when authenticated
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) {
        setSessionsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('session_date', { ascending: false });

        if (error) throw error;

        const formattedSessions: Session[] = data.map(session => ({
          id: session.id,
          user_id: session.user_id,
          session_type: session.session_type as SessionType,
          quantity: Number(session.quantity),
          participant_count: session.participant_count,
          notes: session.notes,
          rating: session.rating,
          session_date: session.session_date,
          created_at: session.created_at,
          updated_at: session.updated_at
        }));

        setSessions(formattedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  // Show loading spinner while auth is loading
  if (loading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-emerald-500 mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Loading...
          </h1>
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the dashboard
  if (user) {
    return <AppDashboard user={user} initialSessions={sessions} />;
  }

  // If no user is logged in, show the landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 dark:from-emerald-400/10 dark:to-blue-400/10"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 dark:bg-blue-400/20 rounded-full blur-3xl"></div>
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="text-center space-y-6 sm:space-y-8 max-w-md relative z-10">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Session Log
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-800 dark:text-gray-200 font-medium">Your personal session tracker</p>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
            Track your sessions with privacy, style, and detailed insights
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
