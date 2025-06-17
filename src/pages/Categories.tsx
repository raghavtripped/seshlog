import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut, UserIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const Categories = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    switch (categoryId) {
      case 'weed':
        navigate('/');
        break;
      case 'cigs':
        navigate('/cigs');
        break;
      case 'vapes':
        navigate('/vapes');
        break;
      case 'liquor':
        navigate('/liquor');
        break;
      default:
        navigate('/');
    }
  };

  const categories = [
    {
      id: 'weed',
      title: 'Weed',
      emoji: '🌿',
      description: isMobile ? 'Track cannabis sessions' : 'Track your cannabis sessions with detailed insights',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 'cigs',
      title: 'Cigarettes',
      emoji: '🚬',
      description: isMobile ? 'Monitor cigarette usage' : 'Monitor your cigarette consumption and habits',
      gradient: 'from-gray-500 to-slate-600'
    },
    {
      id: 'vapes',
      title: 'Vapes',
      emoji: '💨',
      description: isMobile ? 'Log vaping sessions' : 'Log your vaping sessions and track patterns',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'liquor',
      title: 'Liquor',
      emoji: '🥃',
      description: isMobile ? 'Track alcohol consumption' : 'Track your alcohol consumption and preferences',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="brand-logo mx-auto float">
            <span className="brand-emoji">📊</span>
          </div>
          <h1 className={`${isMobile ? 'text-xl font-semibold' : 'heading-lg'} text-gray-800 dark:text-gray-200`}>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Header */}
      <header className={`${isMobile ? 'p-4' : 'p-6'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="brand-logo bounce-subtle">
            <span className="brand-emoji">📊</span>
          </div>
          <div>
            <h1 className={`${isMobile ? 'text-lg font-bold' : 'heading-lg'} gradient-text`}>Session Scribe</h1>
            <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>Track your sessions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user && (
            <div className={`glass-card-secondary ${isMobile ? 'px-2 py-1' : 'px-4 py-2'} flex items-center gap-2`}>
              <UserIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600 dark:text-gray-400`} />
              <span className={`text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'body-sm'} font-medium truncate ${isMobile ? 'max-w-[80px]' : 'max-w-[120px]'}`}>
                {user.email}
              </span>
            </div>
          )}
          <Button 
            onClick={handleSignOut}
            variant="ghost" 
            size={isMobile ? "sm" : "sm"}
            className={`text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl ${isMobile ? 'px-2' : ''}`}
          >
            <LogOut className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${isMobile ? '' : 'mr-2'}`} />
            <span className={`${isMobile ? 'hidden' : 'hidden sm:inline'}`}>Logout</span>
          </Button>
        </div>
      </header>

      <div className={`container mx-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-8'}`}>
        <div className={`text-center ${isMobile ? 'mb-6' : 'mb-12'}`}>
          <h2 className={`${isMobile ? 'text-xl font-bold' : 'heading-xl'} text-gray-800 dark:text-gray-200 ${isMobile ? 'mb-2' : 'mb-4'}`}>
            Choose Your Category
          </h2>
          <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-sm' : 'body-lg'} ${isMobile ? 'max-w-sm' : 'max-w-2xl'} mx-auto`}>
            {isMobile ? 'Select what you\'d like to track' : 'Select what you\'d like to track. Each category is tailored to give you the most relevant insights and tracking options.'}
          </p>
        </div>

        {/* Categories Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'} ${isMobile ? 'max-w-sm' : 'max-w-6xl'} mx-auto`}>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`glass-card ${isMobile ? 'p-4' : 'p-8'} text-center cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group ${isMobile ? 'min-h-[140px]' : ''}`}
            >
              {/* Icon */}
              <div className={`${isMobile ? 'mb-3' : 'mb-6'}`}>
                <div className={`${isMobile ? 'w-12 h-12' : 'w-20 h-20'} mx-auto rounded-full bg-gradient-to-r ${category.gradient} flex items-center justify-center ${isMobile ? 'text-2xl' : 'text-4xl'} shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
                  {category.emoji}
                </div>
              </div>

              {/* Content */}
              <div className={`space-y-${isMobile ? '2' : '3'}`}>
                <h3 className={`${isMobile ? 'text-sm font-semibold' : 'heading-md'} text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors`}>
                  {category.title}
                </h3>
                <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'body-sm'} leading-relaxed`}>
                  {category.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className={`${isMobile ? 'mt-3' : 'mt-6'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <div className={`w-full ${isMobile ? 'h-0.5' : 'h-1'} bg-gradient-to-r ${category.gradient} rounded-full`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`text-center ${isMobile ? 'mt-8' : 'mt-16'}`}>
          <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'body-sm'}`}>
            All your data is stored securely and privately
          </p>
        </div>
      </div>
    </div>
  );
}; 