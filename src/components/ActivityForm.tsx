// /src/components/ActivityForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useActivityEntries } from '@/hooks/useActivityEntries';

const activityTypes = [
  { value: 'running', label: 'Running', emoji: '🏃' },
  { value: 'walking', label: 'Walking', emoji: '🚶' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴' },
  { value: 'strength', label: 'Strength Training', emoji: '🏋️' },
  { value: 'other', label: 'Other', emoji: '🤸' },
];

interface ActivityFormProps {
  onFormClose: () => void;
  onSuccess: () => void;
}

export const ActivityForm = ({ onFormClose, onSuccess }: ActivityFormProps) => {
  const { addEntry } = useActivityEntries();
  
  const [activityType, setActivityType] = useState<'running' | 'walking' | 'cycling' | 'strength' | 'other'>('running');
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (duration <= 0) {
      alert('Please enter a valid duration.');
      return;
    }
    
    try {
      await addEntry.mutateAsync({
        created_at: new Date().toISOString(),
        activity_type: activityType,
        duration_minutes: duration,
        intensity: intensity,
        distance_km: distance ? parseFloat(distance) : undefined,
        calories_burned: calories ? parseInt(calories) : undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to save activity entry:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Log Your Activity</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Type</label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as 'running' | 'walking' | 'cycling' | 'strength' | 'other')}
            className="w-full p-3 border rounded-lg"
          >
            {activityTypes.map(act => (
              <option key={act.value} value={act.value}>
                {act.emoji} {act.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => {
              const value = e.target.value;
              setDuration(value === '' ? 0 : parseInt(value) || 0);
            }}
            className="w-full p-3 mt-1 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Intensity</label>
          <select value={intensity} onChange={(e) => setIntensity(e.target.value as 'low' | 'medium' | 'high')} className="w-full p-3 mt-1 border rounded-lg">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Distance (km)</label>
            <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="Optional" className="w-full p-3 mt-1 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium">Calories Burned</label>
            <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="Optional" className="w-full p-3 mt-1 border rounded-lg" />
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={addEntry.isPending}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold py-3 rounded-lg"
          >
            {addEntry.isPending ? 'Saving...' : 'Save Activity'}
          </Button>
          <Button onClick={onFormClose} variant="outline" className="px-6 py-3 rounded-lg">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};