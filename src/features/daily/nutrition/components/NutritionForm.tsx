// /src/features/daily/nutrition/components/NutritionForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNutritionEntries } from '@/hooks/useNutritionEntries';

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🥞' },
  { value: 'lunch', label: 'Lunch', emoji: '🥗' },
  { value: 'dinner', label: 'Dinner', emoji: '🍝' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
];

interface NutritionFormProps {
  onFormClose: () => void;
  onSuccess: () => void;
}

export const NutritionForm = ({ onFormClose, onSuccess }: NutritionFormProps) => {
  const { addEntry } = useNutritionEntries();
  
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!description || calories <= 0) {
      alert('Please enter a description and calories.');
      return;
    }
    
    try {
      await addEntry.mutateAsync({
        created_at: new Date().toISOString(),
        meal_type: mealType,
        description: description,
        calories: calories,
        protein: protein ? parseInt(protein) : undefined,
        carbs: carbs ? parseInt(carbs) : undefined,
        fats: fats ? parseInt(fats) : undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to save nutrition entry:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Log Your Meal</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meal Type</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {mealTypes.map(meal => (
              <option key={meal.value} value={meal.value}>
                {meal.emoji} {meal.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Grilled chicken salad"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calories</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => {
              const value = e.target.value;
              setCalories(value === '' ? 0 : parseInt(value) || 0);
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Protein (g)</label>
            <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="Opt." className="w-full p-3 mt-1 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium">Carbs (g)</label>
            <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="Opt." className="w-full p-3 mt-1 border rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium">Fats (g)</label>
            <input type="number" value={fats} onChange={(e) => setFats(e.target.value)} placeholder="Opt." className="w-full p-3 mt-1 border rounded-lg" />
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={addEntry.isPending}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            {addEntry.isPending ? 'Saving...' : 'Save Meal'}
          </Button>
          <Button onClick={onFormClose} variant="outline" className="px-6 py-3 rounded-lg">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NutritionForm;

