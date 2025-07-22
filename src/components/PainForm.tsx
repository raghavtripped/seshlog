// /src/components/PainForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePainEntries } from '@/hooks/usePainEntries';

const bodyParts = [
  "General", "Head", "Neck", "Shoulders", "Upper Back", "Lower Back",
  "Chest", "Abdomen", "Hips", "Knees", "Ankles", "Feet"
];

interface PainFormProps {
  onFormClose: () => void;
  onSuccess: () => void;
}

export const PainForm = ({ onFormClose, onSuccess }: PainFormProps) => {
  const { addEntry } = usePainEntries();
  
  const [painLevel, setPainLevel] = useState(0);
  const [stiffnessLevel, setStiffnessLevel] = useState(0);
  const [location, setLocation] = useState("General");
  const [description, setDescription] = useState("");
  const [triggers, setTriggers] = useState("");

  const handleSubmit = async () => {
    try {
      await addEntry.mutateAsync({
        created_at: new Date().toISOString(),
        pain_level: painLevel,
        stiffness_level: stiffnessLevel,
        location: location,
        description: description.trim() || undefined,
        triggers: triggers.trim() || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to save pain entry:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Log Pain & Stiffness</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Pain Level: {painLevel}/10</label>
          <input type="range" min="0" max="10" value={painLevel} onChange={(e) => setPainLevel(parseInt(e.target.value))} className="w-full accent-red-500" />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Stiffness Level: {stiffnessLevel}/10</label>
          <input type="range" min="0" max="10" value={stiffnessLevel} onChange={(e) => setStiffnessLevel(parseInt(e.target.value))} className="w-full accent-gray-500" />
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 mt-1 border rounded-lg">
            {bodyParts.map(part => <option key={part} value={part}>{part}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 'Dull ache', 'Sharp pain'"
            className="w-full p-3 mt-1 border rounded-lg"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={addEntry.isPending}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold py-3 rounded-lg"
          >
            {addEntry.isPending ? 'Saving...' : 'Save Log'}
          </Button>
          <Button onClick={onFormClose} variant="outline" className="px-6 py-3 rounded-lg">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};