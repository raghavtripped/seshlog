import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // This is where the user will be redirected back to after clicking the magic link
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
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

      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/50 relative z-10">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-emerald-400" />
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent">
            Sign In
          </h1>
        </div>
        
        {submitted ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 dark:text-green-400 font-medium">
              Success! Please check your email for the magic link to sign in.
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
          <form onSubmit={handleLogin} className="space-y-4">
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
                  Sending...
                </div>
              ) : (
                'Send Magic Link'
              )}
            </Button>
            
            {error && (
              <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>
            )}
          </form>
        )}
        
        <div className="text-center">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}; 