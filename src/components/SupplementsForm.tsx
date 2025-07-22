// /src/components/SupplementsForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSupplementsEntries } from '@/hooks/useSupplementsEntries';

interface SupplementsFormProps {
  onFormClose: () => void;
  onSuccess: () => void;
}

export const SupplementsForm = ({ onFormClose, onSuccess }: SupplementsFormProps) => {
  const { addEntry } = useSupplementsEntries();
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!name || !dosage) {
      alert('Please enter a name and dosage.');
      return;
    }
    
    try {
      await addEntry.mutateAsync({
        created_at: new Date().toISOString(),
        name: name,
        dosage: dosage,
        time_of_day: timeOfDay,
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to save supplement entry:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Log Supplement/Medication</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 'Vitamin D3', 'Ibuprofen'"
            className="w-full p-3 mt-1 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Dosage</label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., '1000 IU', '200 mg'"
            className="w-full p-3 mt-1 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Time of Day</label>
          <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value as 'morning' | 'afternoon' | 'evening')} className="w-full p-3 mt-1 border rounded-lg">
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full p-3 mt-1 border rounded-lg"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={addEntry.isPending}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 rounded-lg"
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