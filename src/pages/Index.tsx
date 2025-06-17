import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Session, SessionType } from "@/types/session";
import { AppDashboard } from "@/components/AppDashboard";
import { Sparkles } from "lucide-react";
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

  // If no user, the useEffect above will handle redirect to login
  return null;
};

export default Index;
