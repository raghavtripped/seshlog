import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { AppDashboard } from '@/components/AppDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterSortDialog } from '@/components/FilterSortDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import type { Json } from '../integrations/supabase/types';

// Sleep entry type
type SleepEntry = {
  id: string;
  user_id: string;
  created_at: string;
  sleep_date: string;
  bedtime: string;
  wake_time: string;
  duration_hours: number;
  quality_rating: number;
  awakenings: number;
  notes?: string;
};

const SleepPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  // State for filtering and sorting
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState('date-desc');
  
  // State for managing the form's visibility
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isMobile = useIsMobile();

  // Fetch sleep entries
  const { data: sleepEntries = [], isLoading, error } = useQuery({
    queryKey: ['sleep_entries', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'SLEEP_LOG')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to SleepEntry format
      return data.map((entry): SleepEntry => {
        const payload = entry.payload as Record<string, any>;
        return {
          id: entry.id,
          user_id: entry.user_id,
          created_at: entry.created_at,
          sleep_date: entry.created_at.split('T')[0],
          bedtime: payload.bedtime || '',
          wake_time: payload.wake_time || '',
          duration_hours: payload.duration_hours || 0,
          quality_rating: payload.quality_rating || 0,
          awakenings: payload.awakenings || 0,
          notes: payload.notes || '',
        };
      });
    },
    enabled: !!user,
  });

  // Delete sleep entry
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('daily_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep_entries'] });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Memoized logic for filtering and sorting sessions
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = sleepEntries;

    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.sleep_date);
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.sleep_date).getTime() - new Date(b.sleep_date).getTime();
        case 'quality-desc': return b.quality_rating - a.quality_rating;
        case 'quality-asc': return a.quality_rating - b.quality_rating;
        case 'duration-desc': return b.duration_hours - a.duration_hours;
        case 'duration-asc': return a.duration_hours - b.duration_hours;
        default: return new Date(b.sleep_date).getTime() - new Date(a.sleep_date).getTime();
      }
    });

    return sorted;
  }, [sleepEntries, dateRange, sortBy]);
  
  const handleOpenNewForm = () => {
    setIsFormOpen(true);
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleDataChange = () => {
    queryClient.invalidateQueries({ queryKey: ['sleep_entries'] });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <AppDashboard
        title="Sleep Quality"
        emoji="😴"
        description="Track your sleep patterns and quality"
        gradient="from-indigo-500 to-purple-600"
      />

      <div className={`${isMobile ? 'px-4 py-6' : 'px-6 py-8'} max-w-6xl mx-auto`}>
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 dark:text-gray-200`}>
              Sleep Log
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your sleep quality and patterns
            </p>
          </div>
          
          <div className="flex gap-2">
            <FilterSortDialog
              onDateRangeChange={setDateRange}
              onSortChange={setSortBy}
              sortOptions={[
                { value: 'date-desc', label: 'Date (Newest)' },
                { value: 'date-asc', label: 'Date (Oldest)' },
                { value: 'quality-desc', label: 'Quality (Best)' },
                { value: 'quality-asc', label: 'Quality (Worst)' },
                { value: 'duration-desc', label: 'Duration (Longest)' },
                { value: 'duration-asc', label: 'Duration (Shortest)' },
              ]}
            />
            
            <Button
              onClick={handleOpenNewForm}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isMobile ? 'Add' : 'Log Sleep'}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {sleepEntries.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Quality</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {sleepEntries.length > 0 
                ? (sleepEntries.reduce((sum, entry) => sum + entry.quality_rating, 0) / sleepEntries.length).toFixed(1)
                : '0'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {sleepEntries.length > 0 
                ? `${(sleepEntries.reduce((sum, entry) => sum + entry.duration_hours, 0) / sleepEntries.length).toFixed(1)}h`
                : '0h'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {sleepEntries.filter(entry => {
                const entryDate = new Date(entry.sleep_date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return entryDate >= weekAgo;
              }).length}
            </div>
          </div>
        </div>

        {/* Sleep Entries List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading sleep entries
            </div>
          ) : filteredAndSortedEntries.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No sleep entries yet</div>
              <Button
                onClick={handleOpenNewForm}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Sleep
              </Button>
            </div>
          ) : (
            filteredAndSortedEntries.map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">😴</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {new Date(entry.sleep_date).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={i < entry.quality_rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Bedtime:</span> {entry.bedtime}
                      </div>
                      <div>
                        <span className="font-medium">Wake:</span> {entry.wake_time}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {entry.duration_hours}h
                      </div>
                      <div>
                        <span className="font-medium">Awakenings:</span> {entry.awakenings}
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Notes:</span> {entry.notes}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => deleteEntry.mutate(entry.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sleep Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <SleepForm
            onSuccess={handleDataChange}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sleep Form Component
const SleepForm = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
  const { user } = useAuth();
  const [sleepDate, setSleepDate] = useState(new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [qualityRating, setQualityRating] = useState(3);
  const [awakenings, setAwakenings] = useState(0);
  const [notes, setNotes] = useState('');

  const addEntry = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Calculate duration
      const bedtimeDate = new Date(`${sleepDate}T${bedtime}`);
      const wakeTimeDate = new Date(`${sleepDate}T${wakeTime}`);
      if (wakeTimeDate < bedtimeDate) {
        wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
      }
      const durationHours = (wakeTimeDate.getTime() - bedtimeDate.getTime()) / (1000 * 60 * 60);

      const payload = {
        bedtime,
        wake_time: wakeTime,
        duration_hours: durationHours,
        quality_rating: qualityRating,
        awakenings,
        notes: notes.trim() || null,
      };

      const { error } = await supabase
        .from('daily_events')
        .insert([{
          user_id: user.id,
          event_type: 'SLEEP_LOG',
          created_at: `${sleepDate}T12:00:00Z`,
          payload: payload as Json,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      onSuccess();
      onCancel();
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Log Sleep</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sleep Date
        </label>
        <input
          type="date"
          value={sleepDate}
          onChange={(e) => setSleepDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bedtime
          </label>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Wake Time
          </label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sleep Quality (1-5 stars)
        </label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQualityRating(i + 1)}
              className={`text-2xl ${i < qualityRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Number of Awakenings
        </label>
        <input
          type="number"
          min="0"
          max="20"
          value={awakenings}
          onChange={(e) => setAwakenings(parseInt(e.target.value) || 0)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did you feel? Any dreams? Factors affecting sleep..."
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          onClick={() => addEntry.mutate()}
          disabled={addEntry.isPending || !bedtime || !wakeTime}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          {addEntry.isPending ? 'Saving...' : 'Save Sleep Log'}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="px-6"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SleepPage; 