// /src/pages/SleepPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { useAuth } from '@/hooks/useAuth';
import { useSleepEntries, SleepEntry } from '@/hooks/useSleepEntries';
import { SleepForm } from '@/components/SleepForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, List, Star, Clock, Bed, LogOut, UserIcon, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ThemeToggle';

// --- Reusable Sub-components for a Cleaner Structure ---

// SleepStats Component
const SleepStats = ({ entries }: { entries: SleepEntry[] }) => {
  const avgQuality = entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.quality_rating, 0) / entries.length).toFixed(1) : 'N/A';
  const avgDuration = entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.duration_hours, 0) / entries.length).toFixed(1) : 'N/A';
  const totalNights = entries.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm flex items-center gap-4">
        <Bed className="h-8 w-8 text-indigo-500" />
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Nights</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{totalNights}</p>
        </div>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm flex items-center gap-4">
        <Star className="h-8 w-8 text-yellow-500" />
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Quality</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{avgQuality} <span className="text-base">/ 5</span></p>
        </div>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm flex items-center gap-4">
        <Clock className="h-8 w-8 text-green-500" />
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Duration</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{avgDuration} <span className="text-base">hrs</span></p>
        </div>
      </div>
    </div>
  );
};

// Recent Entries List
const RecentSleepEntries = ({ entries }: { entries: SleepEntry[] }) => (
  <div className="space-y-3">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Nights</h2>
    {entries.slice(0, 5).map(entry => (
      <div key={entry.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < entry.quality_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300 mt-2 sm:mt-0">
            <span><strong>{entry.bedtime}</strong> - <strong>{entry.wake_time}</strong></span>
            <span className="font-bold">{entry.duration_hours.toFixed(1)} hrs</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page Component ---
const SleepPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const isMobile = useIsMobile();

  const { entries, isLoading, error } = useSleepEntries();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState('date-desc');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries;
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'quality-desc': return b.quality_rating - a.quality_rating;
        case 'quality-asc': return a.quality_rating - b.quality_rating;
        case 'duration-desc': return b.duration_hours - a.duration_hours;
        case 'duration-asc': return a.duration_hours - b.duration_hours;
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return sorted;
  }, [entries, dateRange, sortBy]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  if (authLoading || (isLoading && !entries.length)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <header className={`${isMobile ? 'p-4' : 'p-6'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/routines')}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center`}>
            <span className="text-2xl">😴</span>
          </div>
          <div>
            <h1 className={`${isMobile ? 'text-base font-bold' : 'text-2xl font-bold'} text-gray-800 dark:text-gray-200`}>Sleep Tracker</h1>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>Analyze your sleep patterns and improve your rest</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user && (
            <div className={`bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm ${isMobile ? 'px-2 py-1' : 'px-4 py-2'} rounded-xl flex items-center gap-2`}>
              <UserIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600 dark:text-gray-400`} />
              <span className={`text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'} font-medium truncate ${isMobile ? 'max-w-[80px]' : 'max-w-[120px]'}`}>
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
            <LogOut className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            {!isMobile && <span className="ml-1">Sign Out</span>}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${isMobile ? 'px-4 pb-8' : 'px-6 pb-12'} max-w-6xl mx-auto`}>
        <div className="space-y-6">
          <div className={`flex w-full items-center justify-center gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <Button
              className="flex-1 text-lg font-semibold py-6 rounded-xl shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-all"
              size="lg"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="mr-2 h-6 w-6" />
              Log New Sleep
            </Button>

            {/* Simple sort controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="quality-desc">Quality (Best)</option>
                <option value="quality-asc">Quality (Worst)</option>
                <option value="duration-desc">Duration (Longest)</option>
                <option value="duration-asc">Duration (Shortest)</option>
              </select>
            </div>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <SleepForm 
                onFormClose={() => setIsFormOpen(false)}
                onSuccess={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <SleepStats entries={filteredAndSortedEntries} />

          {error && <p className="text-center text-red-500">Error loading sleep data.</p>}
          
          {filteredAndSortedEntries.length > 0 ? (
            <RecentSleepEntries entries={filteredAndSortedEntries} />
          ) : (
            !isLoading && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No entries match your filters.</p>
              </div>
            )
          )}
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => navigate('/sleep/history')}
              variant="outline"
              size="lg"
              className="text-lg font-semibold py-5 px-8 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
            >
              <List className="mr-3 h-5 w-5" />
              View Complete History
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SleepPage;