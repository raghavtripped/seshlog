import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, BarChart3, Calendar, Target } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Landing Page Content */}
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8 space-y-4">
            <div className="brand-logo mx-auto float">
              <span className="brand-emoji">📝</span>
            </div>
            <h1 className="heading-xl gradient-text">Sesh Log</h1>
            <p className="text-gray-600 dark:text-gray-400 body-base">Track your sessions with style and insights</p>
          </div>
          <div className="glass-card p-8 text-center space-y-6">
            <div className="space-y-4">
              <h2 className="heading-md text-gray-800 dark:text-gray-200">Welcome to Sesh Log</h2>
              <p className="text-gray-600 dark:text-gray-400 body-sm leading-relaxed">
                Your personal session tracker with privacy, style, and detailed insights. 
                Keep track of all your sessions in one beautiful, secure place.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border-0"
            >
              <span className="brand-emoji mr-2">✨</span>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-16 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="brand-logo mx-auto float mb-6">
            <span className="brand-emoji">🎯</span>
          </div>
          <h1 className="heading-xl gradient-text mb-4">Welcome to Sesh Log</h1>
          <p className="text-muted-foreground body-base max-w-2xl mx-auto">
            Your simple life-tracking platform. Quick log daily activities and track patterns over time.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 max-w-lg mx-auto mb-8">
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/routines')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold transition-all duration-300"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Start Life Tracking
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              onClick={() => navigate('/categories')}
              variant="outline"
              className="w-full py-3 rounded-xl border-2 transition-all duration-300"
            >
              <Target className="w-4 h-4 mr-2" />
              Legacy Sessions
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="glass-card p-4 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="heading-md mb-2">Daily Tracking</h3>
            <p className="text-muted-foreground body-sm">
              Log sleep, mood, nutrition, and activities
            </p>
          </div>
          
          <div className="glass-card p-4 text-center">
            <BarChart3 className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="heading-md mb-2">Legacy Sessions</h3>
            <p className="text-muted-foreground body-sm">
              Track traditional sessions and substances
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
