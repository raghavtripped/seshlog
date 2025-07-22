import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMoodEntries } from '@/hooks/useMoodEntries';

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

interface MoodFormProps {
  onFormClose: () => void;
  onSuccess: () => void;
}

export const MoodForm = ({ onFormClose, onSuccess }: MoodFormProps) => {
  const { addEntry } = useMoodEntries();
  
  const [moodLevel, setMoodLevel] = useState(5);
  const [moodType, setMoodType] = useState('neutral');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [triggers, setTriggers] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    try {
      await addEntry.mutateAsync({
        created_at: new Date().toISOString(),
        mood_level: moodLevel,
        mood_type: moodType,
        energy_level: energyLevel,
        stress_level: stressLevel,
        triggers: triggers.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to save mood entry:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Log Your Mood</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How are you feeling?
          </label>
          <select
            value={moodType}
            onChange={(e) => setMoodType(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {moodTypes.map(mood => (
              <option key={mood.value} value={mood.value}>
                {mood.emoji} {mood.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mood Level: {moodLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={moodLevel}
            onChange={(e) => setMoodLevel(parseInt(e.target.value))}
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Very Low</span>
            <span>Very High</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Energy Level: {energyLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Exhausted</span>
            <span>Energized</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stress Level: {stressLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => setStressLevel(parseInt(e.target.value))}
            className="w-full accent-red-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Very Calm</span>
            <span>Very Stressed</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Triggers (optional)
          </label>
          <input
            type="text"
            value={triggers}
            onChange={(e) => setTriggers(e.target.value)}
            placeholder="What affected your mood? (work, exercise, weather, etc.)"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? Any thoughts or observations..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={addEntry.isPending}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
          >
            {addEntry.isPending ? 'Saving...' : 'Save Mood'}
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