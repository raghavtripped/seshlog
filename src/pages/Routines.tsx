import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Plus, Sparkles } from 'lucide-react';
import type { Database } from '../integrations/supabase/types';

// Routine type (matching the database schema)
type Routine = {
  id: string;
  user_id: string;
  name: string;
  items: string[];
};

type DbRoutine = Database['public']['Tables']['routines']['Row'];
type DbRoutineInsert = Database['public']['Tables']['routines']['Insert'];

// Convert database routine to app routine
const convertDbToRoutine = (dbRoutine: DbRoutine): Routine => ({
  id: dbRoutine.id,
  user_id: dbRoutine.user_id,
  name: dbRoutine.name,
  items: Array.isArray(dbRoutine.items) ? dbRoutine.items as string[] : [],
});

// Convert app routine to database routine
const convertRoutineToDb = (routine: Partial<Routine>): Partial<DbRoutineInsert> => ({
  ...routine,
  items: routine.items || [],
});

// Fetch routines for the current user
const fetchRoutines = async (): Promise<Routine[]> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });
  if (error) throw error;
  
  return data.map(convertDbToRoutine);
};

// Add or update a routine
const upsertRoutine = async (routine: Partial<Routine>) => {
  const dbRoutine = convertRoutineToDb(routine);
  
  const { data, error } = await supabase
    .from('routines')
    .upsert([dbRoutine as DbRoutineInsert], { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  
  return convertDbToRoutine(data);
};

// Delete a routine
const deleteRoutine = async (id: string) => {
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Create default routines
const createDefaultRoutines = async (userId: string) => {
  const defaultRoutines: DbRoutineInsert[] = [
    {
      user_id: userId,
      name: 'Morning Health Check',
      items: [
        'Rate sleep quality (1-5 stars)',
        'Log wake time',
        'Check pain/stiffness level (0-10)',
        'Assess morning mood',
        'Drink first glass of water'
      ]
    },
    {
      user_id: userId,
      name: 'Daily Nutrition Tracking',
      items: [
        'Log breakfast meal composition',
        'Log lunch meal composition', 
        'Log dinner meal composition',
        'Rate meal satisfaction (1-10)',
        'Take meal photos (optional)'
      ]
    },
    {
      user_id: userId,
      name: 'Daily Hydration Goals',
      items: [
        'Morning: 2 glasses water',
        'Coffee/Tea intake',
        'Midday: 2 glasses water',
        'Afternoon: 1 glass water',
        'Evening: 1 glass water',
        'Track total daily intake'
      ]
    },
    {
      user_id: userId,
      name: 'Work Session Tracking',
      items: [
        'Set session duration goal',
        'Rate focus level before starting',
        'Log work type/project',
        'Rate focus level after session',
        'Note any distractions or insights'
      ]
    },
    {
      user_id: userId,
      name: 'Daily Activity Log',
      items: [
        'Morning movement/stretch',
        'Planned workout or activity',
        'Log activity type and duration',
        'Rate energy level before/after',
        'Note how body feels'
      ]
    },
    {
      user_id: userId,
      name: 'Evening Wind-Down',
      items: [
        'Brush teeth',
        'Wash face',
        'Take evening supplements',
        'Reflect on day highlights',
        'Rate final pain/mood/energy levels',
        'Set tomorrow intention'
      ]
    }
  ];

  const { data, error } = await supabase
    .from('routines')
    .insert(defaultRoutines)
    .select();
  
  if (error) throw error;
  return data.map(convertDbToRoutine);
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
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  });

  const defaultRoutinesMutation = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not logged in');
      return createDefaultRoutines(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  // Add debug function to check database state
  const checkDatabaseState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ User not authenticated');
        return;
      }
      
      console.log('✅ User authenticated:', user.email);
      
      // Test if routines table exists and is accessible
      const { data, error } = await supabase
        .from('routines')
        .select('count', { count: 'exact', head: true });
        
      if (error) {
        console.log('❌ Routines table error:', error.message);
        console.log('🔧 You may need to run the database migrations in Supabase:');
        console.log('1. Go to Supabase Dashboard > SQL Editor');
        console.log('2. Run the migrations from supabase/migrations/ folder');
        console.log('3. Particularly: 20250616213506-65b2eadc-bcc8-4cac-b653-c530f0b8183e.sql');
        console.log('4. And: 20250121000001_add_default_routines.sql');
      } else {
        console.log('✅ Routines table accessible. Count:', data);
      }
      
      // Test daily_events table
      const { data: eventsData, error: eventsError } = await supabase
        .from('daily_events')
        .select('count', { count: 'exact', head: true });
        
      if (eventsError) {
        console.log('❌ Daily events table error:', eventsError.message);
      } else {
        console.log('✅ Daily events table accessible. Count:', eventsData);
      }
      
    } catch (err) {
      console.log('❌ Database check failed:', err);
    }
  };

  if (isLoading) return <div className="p-8">Loading routines...</div>;
  if (error) return <div className="p-8 text-red-500">Error loading routines.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Routines</h1>
      
      <div className="flex gap-2 mb-4">
        <Button onClick={() => { setShowForm(true); setEditing(null); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Routine
        </Button>
        
        {routines && routines.length === 0 && (
          <Button 
            onClick={() => defaultRoutinesMutation.mutate()}
            disabled={defaultRoutinesMutation.isPending}
            variant="outline"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {defaultRoutinesMutation.isPending ? 'Adding...' : 'Add Default Life-Tracking Routines'}
          </Button>
        )}
      </div>

              {routines && routines.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Want comprehensive life tracking?</h3>
                <p className="text-sm text-blue-700">Add default routines that cover all dashboard analytics</p>
              </div>
              <Button 
                onClick={() => defaultRoutinesMutation.mutate()}
                disabled={defaultRoutinesMutation.isPending}
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {defaultRoutinesMutation.isPending ? 'Adding...' : 'Add Defaults'}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-900">Database Connection Issue</h3>
                <p className="text-sm text-red-700">Unable to load routines. Check console for details.</p>
              </div>
              <Button 
                onClick={checkDatabaseState}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Debug Database
              </Button>
            </div>
          </div>
        )}

      {showForm && (
        <RoutineForm
          initial={editing || undefined}
          onSave={(routine) => upsertMutation.mutate(routine)}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      <Separator className="my-6" />
      <div className="space-y-4">
        {routines && routines.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No routines yet.</div>
            <p className="text-sm text-gray-400 mb-4">
              Create custom routines or add our comprehensive default routines that track all the metrics shown in your dashboard analytics.
            </p>
            <div className="mt-4">
              <Button 
                onClick={checkDatabaseState}
                size="sm"
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                🔧 Debug Database Connection
              </Button>
            </div>
          </div>
        )}
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