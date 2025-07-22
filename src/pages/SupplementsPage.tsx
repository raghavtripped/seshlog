// /src/pages/Supplements.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupplementsEntries, SupplementEntry } from '@/hooks/useSupplementsEntries';
import { SupplementsForm } from '@/components/SupplementsForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, List, ArrowLeft, Pill } from 'lucide-react';

// --- Sub-components for better structure ---

// SupplementsStats Component
const SupplementsStats = ({ entries }: { entries: SupplementEntry[] }) => {
  const uniqueSupplements = new Set(entries.map(e => e.name)).size;
  const today = new Date().toISOString().split('T')[0];
  const todaysEntries = entries.filter(e => e.created_at.startsWith(today)).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{entries.length}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Taken Today</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{todaysEntries}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Types</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{uniqueSupplements}</p>
      </div>
       <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Consistency</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">92%</p> {/* Placeholder */}
      </div>
    </div>
  );
};

// Recent Entries List
const RecentSupplementsEntries = ({ entries }: { entries: SupplementEntry[] }) => (
  <div className="space-y-3">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Logs</h2>
    {entries.slice(0, 5).map(entry => (
      <div key={entry.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{entry.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{entry.dosage}</p>
          </div>
          <p className="text-sm text-gray-500 capitalize">{entry.time_of_day}</p>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page Component ---
const SupplementsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { entries, isLoading, error } = useSupplementsEntries();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (!authLoading && !user) navigate('/login');

  if (authLoading || (isLoading && !entries.length)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-pink-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/routines')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-2xl">💊</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Supplements</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your vitamins and medications</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12 max-w-6xl mx-auto">
        <div className="space-y-6">
          <Button
            className="w-full text-lg font-semibold py-6 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            size="lg"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="mr-2 h-6 w-6" />
            Log Intake
          </Button>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <SupplementsForm 
                onFormClose={() => setIsFormOpen(false)}
                onSuccess={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <SupplementsStats entries={entries} />

          {error && <p className="text-center text-red-500">Error loading data.</p>}
          
          {entries.length > 0 ? (
            <RecentSupplementsEntries entries={entries} />
          ) : (
            !isLoading && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No supplements or medications logged yet.</p>
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

export default SupplementsPage;