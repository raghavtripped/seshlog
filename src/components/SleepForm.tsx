// /src/components/SleepForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSleepEntries } from '@/hooks/useSleepEntries';

interface SleepFormProps {
  onFormClose: () => void;
  onSuccess: () => void;
}

export const SleepForm = ({ onFormClose, onSuccess }: SleepFormProps) => {
  const { addEntry } = useSleepEntries();
  
  const [sleepDate, setSleepDate] = useState(new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [qualityRating, setQualityRating] = useState(3);
  const [awakenings, setAwakenings] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!bedtime || !wakeTime) return;

    try {
      // Calculate duration
      const bedtimeDate = new Date(`${sleepDate}T${bedtime}`);
      const wakeTimeDate = new Date(`${sleepDate}T${wakeTime}`);
      if (wakeTimeDate < bedtimeDate) {
        wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
      }
      const durationHours = (wakeTimeDate.getTime() - bedtimeDate.getTime()) / (1000 * 60 * 60);

      await addEntry.mutateAsync({
        created_at: `${sleepDate}T12:00:00Z`,
        bedtime,
        wake_time: wakeTime,
        duration_hours: durationHours,
        quality_rating: qualityRating,
        awakenings,
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to save sleep entry:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Log Your Sleep</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sleep Date
          </label>
          <input
            type="date"
            value={sleepDate}
            onChange={(e) => setSleepDate(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bedtime
            </label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wake Time
            </label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sleep Quality (1-5 stars)
          </label>
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQualityRating(i + 1)}
                className={`text-3xl ${i < qualityRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} hover:text-yellow-400 transition-colors`}
              >
                ⭐
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">{qualityRating} out of 5 stars</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Awakenings
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={awakenings}
            onChange={(e) => setAwakenings(parseInt(e.target.value) || 0)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel? Any dreams? Factors affecting sleep..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={addEntry.isPending || !bedtime || !wakeTime}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
          >
            {addEntry.isPending ? 'Saving...' : 'Save Sleep Log'}
          </Button>
          <Button
            onClick={onFormClose}
            variant="outline"
            className="px-6 py-3 rounded-lg font-semibold"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}; 