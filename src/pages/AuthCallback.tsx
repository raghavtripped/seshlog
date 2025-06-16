import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle email confirmation callback
        const hashFragment = window.location.hash;
        const urlParams = new URLSearchParams(hashFragment.slice(1));
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Auth callback error:', error);
            setError('Email confirmation failed. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
          } else if (data.session) {
            // Successfully confirmed email and authenticated
            navigate('/');
          } else {
            setError('Email confirmation failed. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          setError('Invalid confirmation link. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-emerald-500 mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Signing you in...
          </h1>
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Authentication Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return null;
}; 