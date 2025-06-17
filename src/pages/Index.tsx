import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const [showLoginForm] = useState(false); // Always false, just for structure

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
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border-0"
          >
            <span className="brand-emoji mr-2">✨</span>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
