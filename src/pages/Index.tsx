import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Session, SessionType } from "@/types/session";
import { AppDashboard } from "@/components/AppDashboard";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect to login if no user is logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

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
  if (loading || (user && sessionsLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="brand-logo mx-auto float">
              <span className="brand-emoji">📝</span>
            </div>
            <h1 className="heading-lg text-gray-800 dark:text-gray-200">Loading your sessions...</h1>
            <p className="text-gray-600 dark:text-gray-400 body-sm">Preparing your dashboard</p>
          </div>
          
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          
          <div className="loading-dots justify-center">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the dashboard
  if (user) {
    return <AppDashboard user={user} initialSessions={sessions} />;
  }

  // If no user, the useEffect above will handle redirect to login
  return null;
};

export default Index;
