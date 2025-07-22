// /src/pages/Mood.tsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { useAuth } from '@/hooks/useAuth';
import { useMoodEntries, MoodEntry } from '@/hooks/useMoodEntries';
import { MoodForm } from '@/components/MoodForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, List, LogOut, UserIcon, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ThemeToggle';

// These could be in a shared constants file
const moodTypes = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'energetic', label: 'Energetic', emoji: '⚡' },
  { value: 'focused', label: 'Focused', emoji: '🎯' },
  { value: 'content', label: 'Content', emoji: '😇' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'stressed', label: 'Stressed', emoji: '😰' },
  { value: 'anxious', label: 'Anxious', emoji: '😟' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
];

const getMoodEmoji = (moodType: string) => moodTypes.find(m => m.value === moodType)?.emoji || '😐';

// --- Sub-components for better structure ---

// MoodStats Component
const MoodStats = ({ entries }: { entries: MoodEntry[] }) => {
  const averageMood = entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.mood_level, 0) / entries.length).toFixed(1) : 'N/A';
  const entriesThisWeek = entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{entries.length}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Mood</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{averageMood}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Entries This Week</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{entriesThisWeek}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Common</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">😊</p> {/* Placeholder */}
      </div>
    </div>
  );
};

// Recent Entries List
const RecentMoodEntries = ({ entries }: { entries: MoodEntry[] }) => (
  <div className="space-y-3">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Logs</h2>
    {entries.slice(0, 5).map(entry => (
      <div key={entry.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getMoodEmoji(entry.mood_type)}</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">{entry.mood_type}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <span>Mood: <strong>{entry.mood_level}</strong>/10</span>
            <span>Energy: <strong>{entry.energy_level}</strong>/10</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page Component ---
const MoodPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const isMobile = useIsMobile();

  const { entries, isLoading, error } = useMoodEntries();

  const [selectedType, setSelectedType] = useState<string>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState('date-desc');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries;
    if (selectedType !== 'All') {
      filtered = filtered.filter(entry => entry.mood_type === selectedType);
    }
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
        case 'mood-desc': return b.mood_level - a.mood_level;
        case 'mood-asc': return a.mood_level - b.mood_level;
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return sorted;
  }, [entries, selectedType, dateRange, sortBy]);

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
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-yellow-900/20">
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
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center`}>
            <span className="text-2xl">😊</span>
          </div>
          <div>
            <h1 className={`${isMobile ? 'text-base font-bold' : 'text-2xl font-bold'} text-gray-800 dark:text-gray-200`}>Mood Check</h1>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>Track your emotional state and energy levels</p>
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
              className="flex-1 text-lg font-semibold py-6 rounded-xl shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:opacity-90 transition-all"
              size="lg"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="mr-2 h-6 w-6" />
              Log New Mood
            </Button>

            {/* Simple filter controls */}
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="All">All Moods</option>
                {moodTypes.map(mood => (
                  <option key={mood.value} value={mood.value}>
                    {mood.emoji} {mood.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="mood-desc">Mood (Best)</option>
                <option value="mood-asc">Mood (Worst)</option>
              </select>
            </div>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <MoodForm 
                onFormClose={() => setIsFormOpen(false)}
                onSuccess={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <MoodStats entries={filteredAndSortedEntries} />

          {error && <p className="text-center text-red-500">Error loading data.</p>}
          
          {filteredAndSortedEntries.length > 0 ? (
            <RecentMoodEntries entries={filteredAndSortedEntries} />
          ) : (
            !isLoading && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No entries match your filters.</p>
              </div>
            )
          )}
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => navigate('/mood/history')}
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

export default MoodPage;