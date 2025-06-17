import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="brand-logo mx-auto float">
              <span className="brand-emoji">📝</span>
            </div>
            <h1 className="heading-lg text-gray-800 dark:text-gray-200">Loading...</h1>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {!showLoginForm ? (
        // Landing Page Content
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
              onClick={() => setShowLoginForm(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border-0"
            >
              <span className="brand-emoji mr-2">✨</span>
              Get Started
            </Button>
          </div>
        </div>
      ) : (
        // Login Form Content
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8 space-y-4">
            <div className="brand-logo mx-auto float">
              <span className="brand-emoji">📝</span>
            </div>
            <h1 className="heading-xl gradient-text">Sesh Log</h1>
            <p className="text-gray-600 dark:text-gray-400 body-base">Your session tracking companion</p>
          </div>
          
          {/* Form Card */}
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <h2 className="heading-md text-gray-800 dark:text-gray-200 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 body-sm">
                {isSignUp 
                  ? 'Join Sesh Log to start tracking your sessions' 
                  : 'Sign in to continue to your dashboard'
                }
              </p>
            </div>
            
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="heading-md text-gray-800 dark:text-gray-200">Check Your Email</h3>
                <p className="text-gray-600 dark:text-gray-400 body-sm">
                  We've sent you a verification link. Please check your email to complete your registration.
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setIsSignUp(false);
                    setShowLoginForm(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            ) : (
              <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                    <p className="text-red-600 dark:text-red-400 body-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 form-text mb-2">
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 form-text mb-2">
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
                      className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    <>
                      <span className="brand-emoji mr-2">🚀</span>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 body-sm font-medium transition-colors duration-200"
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in' 
                      : "Don't have an account? Sign up"
                    }
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Back to Landing */}
          {showLoginForm && !submitted && (
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setShowLoginForm(false);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 body-sm transition-colors duration-200"
              >
                ← Back to Home
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 