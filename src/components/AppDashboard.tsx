import { useState } from "react";
import type { User } from '@supabase/supabase-js';
import { Session } from "@/types/session";
import { useSessions } from "@/hooks/useSessions";
import { useAuth } from "@/hooks/useAuth";

// Import your UI components
import { SessionForm } from "@/components/SessionForm";
import { SessionList } from "@/components/SessionList";
import { SessionStats } from "@/components/SessionStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, User as UserIcon, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppDashboardProps {
  user: User;
  initialSessions: Session[];
}

export function AppDashboard({ user, initialSessions }: AppDashboardProps) {
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const { signOut } = useAuth();

  // Your useSessions hook now uses the user.id
  const { sessions, addSession, updateSession, deleteSession } = useSessions(user.id, initialSessions);

  const handleAddSession = async (newSession: Omit<Session, 'id' | 'createdAt'>) => {
    await addSession(newSession);
    setShowSessionForm(false);
  };

  const handleEditSession = async (updatedSession: Omit<Session, 'id' | 'createdAt'>) => {
    if (editingSession) {
      await updateSession(editingSession.id, updatedSession);
      setEditingSession(null);
      setShowSessionForm(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      await deleteSession(sessionId);
    }
  };

  const openEditForm = (session: Session) => {
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const closeForm = () => {
    setEditingSession(null);
    setShowSessionForm(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 dark:from-emerald-400/5 dark:to-blue-400/5"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
              Session Log
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 border border-gray-200/50 dark:border-gray-700/50">
              <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{user.email}</span>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Add Session Button */}
        <div className="mb-6 sm:mb-10">
          <Button
            onClick={() => setShowSessionForm(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            Log New Session
          </Button>
        </div>

        {/* Stats Cards */}
        <SessionStats sessions={sessions} />

        {/* Session Form Modal */}
        {showSessionForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <SessionForm 
                onSubmit={editingSession ? handleEditSession : handleAddSession}
                onCancel={closeForm}
                initialSession={editingSession || undefined}
              />
            </div>
          </div>
        )}

        {/* Sessions List */}
        <SessionList 
          sessions={sessions} 
          onEdit={openEditForm}
          onDelete={handleDeleteSession}
        />
      </div>
    </div>
  );
} 