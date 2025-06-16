
import { useState, useEffect } from "react";
import { SessionForm } from "@/components/SessionForm";
import { SessionList } from "@/components/SessionList";
import { SessionStats } from "@/components/SessionStats";
import { AuthModal } from "@/components/AuthModal";
import { Session } from "@/types/session";
import { Plus, User, LogOut, Sparkles } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-blue-900/10"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="text-center space-y-8 max-w-md relative z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-green-400" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Session Log
              </h1>
            </div>
            <p className="text-2xl text-gray-200 font-medium">Your personal session tracker</p>
            <p className="text-gray-400 text-lg leading-relaxed">
              Track your sessions with privacy, style, and detailed insights
            </p>
          </div>
          
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/5 via-transparent to-blue-900/5"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-green-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Session Log
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-gray-300 bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{currentUser}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Add Session Button */}
        <div className="mb-10">
          <Button
            onClick={() => setShowSessionForm(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-3" />
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
                onSubmit={handleAddSession}
                onCancel={() => setShowSessionForm(false)}
              />
            </div>
          </div>
        )}

        {/* Sessions List */}
        <SessionList sessions={sessions} />
      </div>
    </div>
  );
};

export default Index;
