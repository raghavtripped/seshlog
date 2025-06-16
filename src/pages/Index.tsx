
import { useState, useEffect } from "react";
import { SessionForm } from "@/components/SessionForm";
import { SessionList } from "@/components/SessionList";
import { SessionStats } from "@/components/SessionStats";
import { AuthModal } from "@/components/AuthModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Session } from "@/types/session";
import { useSessions } from "@/hooks/useSessions";
import { Plus, User, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");

  const { sessions, loading, addSession, updateSession, deleteSession } = useSessions(
    isAuthenticated ? currentUser : null
  );

  // Load data from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem("sessionLog_user");
    
    if (userData) {
      setCurrentUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
    localStorage.setItem("sessionLog_user", username);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser("");
    localStorage.removeItem("sessionLog_user");
  };

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

  if (!isAuthenticated) {
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
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Get Started
          </Button>
        </div>

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

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
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{currentUser}</span>
            </div>
            <Button
              onClick={handleLogout}
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
};

export default Index;
