import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export const SignOut = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    // If user is not authenticated, redirect to home
    if (!user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setSignedOut(true);
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Sign out error:', error);
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
            {signedOut ? 'Signed Out' : 'Sign Out'}
          </h1>
        </div>
        
        {signedOut ? (
          <div className="text-center space-y-4">
            <div className="text-green-600 dark:text-green-400 text-6xl mb-4">✓</div>
            <p className="text-green-600 dark:text-green-400 font-medium text-lg">
              You have been successfully signed out
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Redirecting to home page...
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-300"
              >
                Sign In Again
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="text-gray-600 dark:text-gray-400 text-4xl mb-4">
              <LogOut className="w-16 h-16 mx-auto" />
            </div>
            <div className="space-y-2">
              <p className="text-gray-800 dark:text-gray-200 font-medium text-lg">
                Are you sure you want to sign out?
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                You'll need to sign in again to access your sessions
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleSignOut}
                disabled={loading} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing Out...
                  </div>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Yes, Sign Out
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 