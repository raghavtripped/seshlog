import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

// Routine type
type Routine = {
  id: string;
  user_id: string;
  name: string;
  items: string[];
};

// Fetch routines for the current user
const fetchRoutines = async (): Promise<Routine[]> => {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Routine[];
};

// Add or update a routine
const upsertRoutine = async (routine: Partial<Routine>) => {
  const { data, error } = await supabase
    .from('routines')
    .upsert([routine], { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data?.[0] as Routine;
};

// Delete a routine
const deleteRoutine = async (id: string) => {
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Routine Form Component
function RoutineForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Routine>;
  onSave: (routine: Partial<Routine>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [items, setItems] = useState<string[]>(initial?.items || ['']);

  const handleItemChange = (idx: number, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? value : item)));
  };
  const addItem = () => setItems((prev) => [...prev, '']);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...initial, name, items: items.filter((i) => i.trim() !== '') });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Checklist Items</Label>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              value={item}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              required
            />
            {items.length > 1 && (
              <Button type="button" variant="destructive" onClick={() => removeItem(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={addItem} variant="secondary">
          + Add Item
        </Button>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Main Routines Page
export default function Routines() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<Routine> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: routines, isLoading, error } = useQuery({
    queryKey: ['routines'],
    queryFn: fetchRoutines,
  });

  const upsertMutation = useMutation({
    mutationFn: upsertRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries(['routines']);
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => queryClient.invalidateQueries(['routines']),
  });

  if (isLoading) return <div className="p-8">Loading routines...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading routines.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Routines</h1>
      <Button onClick={() => { setShowForm(true); setEditing(null); }} className="mb-4">
        + New Routine
      </Button>
      {showForm && (
        <RoutineForm
          initial={editing || undefined}
          onSave={(routine) => upsertMutation.mutate(routine)}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      <Separator className="my-6" />
      <div className="space-y-4">
        {routines && routines.length === 0 && <div>No routines yet.</div>}
        {routines && routines.map((routine) => (
          <Card key={routine.id} className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">{routine.name}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(routine); setShowForm(true); }}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(routine.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            <ul className="list-disc ml-6">
              {routine.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
} 