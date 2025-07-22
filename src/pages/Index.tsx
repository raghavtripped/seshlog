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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="brand-logo mx-auto float mb-6">
            <span className="brand-emoji">🎯</span>
          </div>
          <h1 className="heading-xl gradient-text mb-4">Welcome to Sesh Log</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Your simple life-tracking platform. Quick log daily activities and track patterns over time.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <div className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Daily Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Quick log activities like sleep, mood, nutrition, hydration, and work sessions
            </p>
          </div>
          
          <div className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <BarChart3 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Legacy Sessions</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Continue tracking your traditional sessions from the original Sesh Log
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">Get Started</h2>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/routines')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Start Life Tracking
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            
            <Button 
              onClick={() => navigate('/categories')}
              variant="outline"
              className="w-full py-3 rounded-xl border-2 border-green-200 text-green-700 hover:bg-green-50 transition-all duration-300"
            >
              <Target className="w-4 h-4 mr-2" />
              Legacy Sessions
            </Button>
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-2">💡 Simple & Fast</h3>
            <p className="text-amber-700 text-sm">
              Click "Start Life Tracking" to begin logging daily activities with simple one-click tracking cards!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
