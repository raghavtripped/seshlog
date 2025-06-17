import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Success - navigation will be handled by useAuth
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
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

      {!showLoginForm ? (
        // Landing Page Content
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
            onClick={() => setShowLoginForm(true)}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Get Started
          </Button>
        </div>
      ) : (
        // Login Form Content
        <div className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/50 relative z-10">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
          </div>
          
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 dark:text-green-400 font-medium">
                {isSignUp 
                  ? "Account created! Please check your email to verify your account."
                  : "Successfully signed in!"
                }
              </p>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          ) : (
            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4" autoComplete="off">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="off"
                  className="mt-1 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="mt-1 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
              
              {error && (
                <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>
              )}
            </form>
          )}
          
          <div className="text-center">
            <Button
              onClick={() => setShowLoginForm(false)}
              variant="ghost"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 