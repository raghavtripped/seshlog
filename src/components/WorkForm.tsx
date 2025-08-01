// /src/components/WorkForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWorkEntries } from '@/hooks/useWorkEntries';

interface WorkFormProps {
  onFormClose: () => void;
  onSuccess: () => void;
}

export const WorkForm = ({ onFormClose, onSuccess }: WorkFormProps) => {
  const { addEntry } = useWorkEntries();
  
  const [taskDescription, setTaskDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [productivity, setProductivity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!taskDescription || duration <= 0) {
      alert('Please enter a task description and a valid duration.');
      return;
    }
    
    try {
      await addEntry.mutateAsync({
        created_at: new Date().toISOString(),
        task_description: taskDescription,
        duration_minutes: duration,
        productivity_level: productivity,
        project: project.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to save work entry:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Log Work Session</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Task Description</label>
          <input
            type="text"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="e.g., 'Develop new dashboard feature'"
            className="w-full p-3 mt-1 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Duration: {duration} minutes</label>
          <input
            type="range"
            min="15" max="240" step="15"
            value={duration}
            onChange={(e) => {
              const value = e.target.value;
              setDuration(value === '' ? 15 : parseInt(value));
            }}
            className="w-full accent-indigo-500"
          />
        </div>

        <div>
            <label className="block text-sm font-medium mb-2">Productivity Level</label>
            <div className="flex justify-around">
                {[1, 2, 3, 4, 5].map(level => (
                    <button
                        key={level}
                        onClick={() => setProductivity(level as 1 | 2 | 3 | 4 | 5)}
                        className={`w-10 h-10 rounded-full text-lg font-bold transition-all ${productivity === level ? 'bg-indigo-500 text-white scale-110' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        {level}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="text-sm font-medium">Project (optional)</label>
            <input type="text" value={project} onChange={(e) => setProject(e.target.value)} placeholder="e.g., 'Q3 Analytics'" className="w-full p-3 mt-1 border rounded-lg" />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={addEntry.isPending}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-lg"
          >
            {addEntry.isPending ? 'Saving...' : 'Save Session'}
          </Button>
          <Button onClick={onFormClose} variant="outline" className="px-6 py-3 rounded-lg">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};