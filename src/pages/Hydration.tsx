// /src/pages/Hydration.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHydrationEntries, HydrationEntry } from '@/hooks/useHydrationEntries';
import { HydrationForm } from '@/components/HydrationForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, List, Droplets, ArrowLeft } from 'lucide-react';

// --- Sub-components for better structure ---

// HydrationStats Component
const HydrationStats = ({ entries }: { entries: HydrationEntry[] }) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysEntries = entries.filter(e => e.created_at.startsWith(today));

  const totalIntakeToday = todaysEntries.reduce((sum, entry) => sum + entry.amount_ml, 0);
  const totalIntakeLiters = (totalIntakeToday / 1000).toFixed(2);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{entries.length}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Intake</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{totalIntakeLiters} L</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Goal</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">2.5 L</p> {/* Placeholder */}
      </div>
       <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Daily</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {/* More complex calculation needed here */}
            N/A
        </p>
      </div>
    </div>
  );
};

// Recent Entries List
const RecentHydrationEntries = ({ entries }: { entries: HydrationEntry[] }) => (
  <div className="space-y-3">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Logs</h2>
    {entries.slice(0, 5).map(entry => (
      <div key={entry.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{entry.amount_ml} ml</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page Component ---
const HydrationPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { entries, isLoading, error } = useHydrationEntries();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Authentication check
  if (!authLoading && !user) navigate('/login');

  if (authLoading || (isLoading && !entries.length)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-cyan-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/routines')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-2xl">💧</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Hydration Hub</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Keep track of your daily water intake</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12 max-w-6xl mx-auto">
        <div className="space-y-6">
          <Button
            className="w-full text-lg font-semibold py-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            size="lg"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="mr-2 h-6 w-6" />
            Log Water
          </Button>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <HydrationForm 
                onFormClose={() => setIsFormOpen(false)}
                onSuccess={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <HydrationStats entries={entries} />

          {error && <p className="text-center text-red-500">Error loading data.</p>}
          
          {entries.length > 0 ? (
            <RecentHydrationEntries entries={entries} />
          ) : (
            !isLoading && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No water logged yet. Stay hydrated!</p>
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

export default HydrationPage;