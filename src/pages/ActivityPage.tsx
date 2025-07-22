// /src/pages/Activity.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useActivityEntries, ActivityEntry } from '@/hooks/useActivityEntries';
import { ActivityForm } from '@/components/ActivityForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, List, ArrowLeft, Flame } from 'lucide-react';

// --- Sub-components for better structure ---

// ActivityStats Component
const ActivityStats = ({ entries }: { entries: ActivityEntry[] }) => {
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
  const totalCalories = entries.reduce((sum, entry) => sum + (entry.calories_burned || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{entries.length}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Minutes</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{totalMinutes}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Calories</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{totalCalories}</p>
      </div>
       <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Duration</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {entries.length > 0 ? (totalMinutes / entries.length).toFixed(0) : 0} min
        </p>
      </div>
    </div>
  );
};

// Recent Entries List
const RecentActivityEntries = ({ entries }: { entries: ActivityEntry[] }) => (
  <div className="space-y-3">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Activities</h2>
    {entries.slice(0, 5).map(entry => (
      <div key={entry.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white capitalize">{entry.activity_type}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{entry.duration_minutes} minutes</p>
          </div>
          <div className="text-right">
             {entry.calories_burned && <p className="font-bold text-lg text-red-500 flex items-center"><Flame className="w-4 h-4 mr-1" />{entry.calories_burned} kcal</p>}
            <p className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page Component ---
const ActivityPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { entries, isLoading, error } = useActivityEntries();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Authentication check
  if (!authLoading && !user) navigate('/login');

  if (authLoading || (isLoading && !entries.length)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-yellow-900/20">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/routines')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Activity Log</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your workouts and stay active</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12 max-w-6xl mx-auto">
        <div className="space-y-6">
          <Button
            className="w-full text-lg font-semibold py-6 rounded-xl shadow-lg bg-gradient-to-r from-red-500 to-orange-500 text-white"
            size="lg"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="mr-2 h-6 w-6" />
            Log New Activity
          </Button>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <ActivityForm 
                onFormClose={() => setIsFormOpen(false)}
                onSuccess={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <ActivityStats entries={entries} />

          {error && <p className="text-center text-red-500">Error loading data.</p>}
          
          {entries.length > 0 ? (
            <RecentActivityEntries entries={entries} />
          ) : (
            !isLoading && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No activities logged yet. Get moving!</p>
              </div>
            )
          )}
          
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              className="text-lg font-semibold py-5 px-8 rounded-xl"
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

export default ActivityPage;