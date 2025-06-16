
import { useState, useEffect } from "react";
import { SessionForm } from "@/components/SessionForm";
import { SessionList } from "@/components/SessionList";
import { SessionStats } from "@/components/SessionStats";
import { AuthModal } from "@/components/AuthModal";
import { Session } from "@/types/session";
import { Plus, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");

  // Load data from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem("sessionLog_user");
    const sessionsData = localStorage.getItem("sessionLog_sessions");
    
    if (userData) {
      setCurrentUser(userData);
      setIsAuthenticated(true);
    }
    
    if (sessionsData) {
      setSessions(JSON.parse(sessionsData));
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("sessionLog_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleLogin = (email: string) => {
    setCurrentUser(email);
    setIsAuthenticated(true);
    localStorage.setItem("sessionLog_user", email);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser("");
    setSessions([]);
    localStorage.removeItem("sessionLog_user");
    localStorage.removeItem("sessionLog_sessions");
  };

  const handleAddSession = (newSession: Omit<Session, 'id' | 'createdAt'>) => {
    const session: Session = {
      ...newSession,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSessions(prev => [session, ...prev]);
    setShowSessionForm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white">Session Log</h1>
            <p className="text-xl text-gray-300">Your personal session tracker</p>
            <p className="text-gray-400">Track your sessions with privacy and style</p>
          </div>
          
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
          >
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Session Log</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300">
              <User className="w-4 h-4" />
              <span className="text-sm">{currentUser}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Add Session Button - Moved to top */}
        <div className="mb-8">
          <Button
            onClick={() => setShowSessionForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log New Session
          </Button>
        </div>

        {/* Stats - After the button */}
        <SessionStats sessions={sessions} />

        {/* Session Form Modal */}
        {showSessionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <SessionForm 
                onSubmit={handleAddSession}
                onCancel={() => setShowSessionForm(false)}
              />
            </div>
          </div>
        )}

        {/* Sessions List - After the stats */}
        <SessionList sessions={sessions} />
      </div>
    </div>
  );
};

export default Index;
