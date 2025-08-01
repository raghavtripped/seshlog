// /src/components/HydrationForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHydrationEntries } from '@/hooks/useHydrationEntries';

const commonAmounts = [250, 330, 500, 750, 1000]; // in ml

interface HydrationFormProps {
  onFormClose: () => void;
  onSuccess: () => void;
}

export const HydrationForm = ({ onFormClose, onSuccess }: HydrationFormProps) => {
  const { addEntry } = useHydrationEntries();
  
  const [amount, setAmount] = useState(250);

  const handleSubmit = async () => {
    if (amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    
    try {
      await addEntry.mutateAsync({
        created_at: new Date().toISOString(),
        amount_ml: amount,
        beverage_type: 'water', // For now, we'll keep it simple
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to save hydration entry:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">Log Water Intake</h3>
      
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-5xl font-bold text-blue-500">{amount}<span className="text-2xl ml-2">ml</span></p>
        </div>

        <div>
          <input
            type="range"
            min="50"
            max="1500"
            step="10"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              setAmount(value === '' ? 50 : parseInt(value));
            }}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50ml</span>
            <span>1500ml</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
            {commonAmounts.map(val => (
                <Button key={val} variant="outline" onClick={() => setAmount(val)}>
                    {val} ml
                </Button>
            ))}
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={addEntry.isPending}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg"
          >
            {addEntry.isPending ? 'Saving...' : 'Log Water'}
          </Button>
          <Button
            onClick={onFormClose}
            variant="ghost"
            className="px-6 py-3 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};