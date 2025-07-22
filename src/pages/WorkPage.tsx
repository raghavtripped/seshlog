// /src/pages/Work.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkEntries, WorkEntry } from '@/hooks/useWorkEntries';
import { WorkForm } from '@/components/WorkForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, List, ArrowLeft, BrainCircuit } from 'lucide-react';

// --- Sub-components for better structure ---

// WorkStats Component
const WorkStats = ({ entries }: { entries: WorkEntry[] }) => {
  const totalHours = (entries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60).toFixed(1);
  const averageProductivity = entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.productivity_level, 0) / entries.length).toFixed(1) : 'N/A';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{entries.length}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{totalHours}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Productivity</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{averageProductivity}/5</p>
      </div>
       <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Focus Streak</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">3 Days</p> {/* Placeholder */}
      </div>
    </div>
  );
};

// Recent Entries List
const RecentWorkEntries = ({ entries }: { entries: WorkEntry[] }) => (
  <div className="space-y-3">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Sessions</h2>
    {entries.slice(0, 5).map(entry => (
      <div key={entry.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{entry.task_description}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{entry.duration_minutes} mins · Productivity: {entry.productivity_level}/5</p>
          </div>
          <p className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page Component ---
const WorkPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { entries, isLoading, error } = useWorkEntries();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Auth check
  if (!authLoading && !user) navigate('/login');

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
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/routines')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Work & Focus</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Log your sessions and productivity</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12 max-w-6xl mx-auto">
        <div className="space-y-6">
          <Button
            className="w-full text-lg font-semibold py-6 rounded-xl shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            size="lg"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="mr-2 h-6 w-6" />
            Log Work Session
          </Button>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <WorkForm 
                onFormClose={() => setIsFormOpen(false)}
                onSuccess={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <WorkStats entries={entries} />

          {error && <p className="text-center text-red-500">Error loading data.</p>}
          
          {entries.length > 0 ? (
            <RecentWorkEntries entries={entries} />
          ) : (
            !isLoading && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No work sessions logged yet. Time to focus!</p>
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

export default WorkPage;