// /src/pages/Pain.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePainEntries, PainEntry } from '@/hooks/usePainEntries';
import { PainForm } from '@/components/PainForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, List, ArrowLeft } from 'lucide-react';

// --- Sub-components for better structure ---

// PainStats Component
const PainStats = ({ entries }: { entries: PainEntry[] }) => {
  const avgPain = entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.pain_level, 0) / entries.length).toFixed(1) : 'N/A';
  const avgStiffness = entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.stiffness_level, 0) / entries.length).toFixed(1) : 'N/A';
  const mostFrequentLocation = entries.length > 0 ? 
    Object.entries(entries.reduce((acc, { location }) => ({ ...acc, [location]: (acc[location] || 0) + 1 }), {} as Record<string, number>))
      .sort((a, b) => b[1] - a[1])[0][0] : 'N/A';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{entries.length}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Pain</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{avgPain}/10</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Stiffness</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{avgStiffness}/10</p>
      </div>
       <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Common Area</h3>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{mostFrequentLocation}</p>
      </div>
    </div>
  );
};

// Recent Entries List
const RecentPainEntries = ({ entries }: { entries: PainEntry[] }) => (
  <div className="space-y-3">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Logs</h2>
    {entries.slice(0, 5).map(entry => (
      <div key={entry.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{entry.location}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pain: {entry.pain_level}/10 | Stiffness: {entry.stiffness_level}/10</p>
          </div>
          <p className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page Component ---
const PainPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { entries, isLoading, error } = usePainEntries();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (!authLoading && !user) navigate('/login');

  if (authLoading || (isLoading && !entries.length)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-pink-900/20 dark:to-purple-900/20">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/routines')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
            <span className="text-2xl">🩹</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Pain & Stiffness</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track and manage your body sensations</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12 max-w-6xl mx-auto">
        <div className="space-y-6">
          <Button
            className="w-full text-lg font-semibold py-6 rounded-xl shadow-lg bg-gradient-to-r from-red-500 to-pink-500 text-white"
            size="lg"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="mr-2 h-6 w-6" />
            Log Pain/Stiffness
          </Button>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <PainForm 
                onFormClose={() => setIsFormOpen(false)}
                onSuccess={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <PainStats entries={entries} />

          {error && <p className="text-center text-red-500">Error loading data.</p>}
          
          {entries.length > 0 ? (
            <RecentPainEntries entries={entries} />
          ) : (
            !isLoading && (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No pain or stiffness logged yet.</p>
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

export default PainPage;