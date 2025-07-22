import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

type Routine = {
  id: string;
  name: string;
  items: string[];
};

const SUPPLEMENTS = ['Vitamin D', 'Vitamin C', 'Magnesium', 'Fish Oil', 'Probiotics', 'Multivitamin'];

// Fetch routines for the current user
const fetchRoutines = async (): Promise<Routine[]> => {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data as Routine[];
};

export function EveningUnwindModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  // Reflection state
  const [finalPain, setFinalPain] = useState(2);
  const [finalMood, setFinalMood] = useState(5);
  const [finalEnergy, setFinalEnergy] = useState(5);
  const [todayWin, setTodayWin] = useState('');
  const [todayChallenge, setTodayChallenge] = useState('');
  
  // Routine and supplement completion state
  const [completedRoutines, setCompletedRoutines] = useState<string[]>([]);
  const [completedSupplements, setCompletedSupplements] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Fetch user's routines
  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['routines'],
    queryFn: fetchRoutines,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not logged in');
      
      const events = [];
      const now = new Date().toISOString();

      // Log routine completions
      for (const routineId of completedRoutines) {
        const routine = routines.find(r => r.id === routineId);
        if (routine) {
          events.push({
            user_id: user.id,
            event_type: 'ROUTINE_COMPLETION',
            created_at: now,
            payload: { routine_name: routine.name, items: routine.items },
          });
        }
      }

      // Log supplement completions
      if (completedSupplements.length > 0) {
        events.push({
          user_id: user.id,
          event_type: 'SUPPLEMENT_LOG',
          created_at: now,
          payload: { supplements: completedSupplements },
        });
      }

      // Log daily reflection
      events.push({
        user_id: user.id,
        event_type: 'DAILY_REFLECTION',
        created_at: now,
        payload: {
          final_pain: finalPain,
          final_mood: finalMood,
          final_energy: finalEnergy,
          today_win: todayWin,
          today_challenge: todayChallenge,
        },
      });

      const { error } = await supabase.from('daily_events').insert(events);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_events'] });
      onOpenChange(false);
      // Reset form
      setFinalPain(2);
      setFinalMood(5);
      setFinalEnergy(5);
      setTodayWin('');
      setTodayChallenge('');
      setCompletedRoutines([]);
      setCompletedSupplements([]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const toggleRoutine = (routineId: string) => {
    setCompletedRoutines(prev =>
      prev.includes(routineId)
        ? prev.filter(id => id !== routineId)
        : [...prev, routineId]
    );
  };

  const toggleSupplement = (supplement: string) => {
    setCompletedSupplements(prev =>
      prev.includes(supplement)
        ? prev.filter(s => s !== supplement)
        : [...prev, supplement]
    );
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evening Unwind</DialogTitle>
          <DialogDescription>Complete your routines and reflect on today.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hygiene & Routines */}
          {routines.length > 0 && (
            <div>
              <Label className="text-base font-semibold">Evening Routines</Label>
              <div className="space-y-3 mt-2">
                {routines.map(routine => (
                  <div key={routine.id} className="border rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={routine.id}
                        checked={completedRoutines.includes(routine.id)}
                        onCheckedChange={() => toggleRoutine(routine.id)}
                      />
                      <Label htmlFor={routine.id} className="font-medium">{routine.name}</Label>
                    </div>
                    <ul className="list-disc ml-6 text-sm text-gray-600">
                      {routine.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supplements */}
          <div>
            <Label className="text-base font-semibold">Supplements</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SUPPLEMENTS.map(supplement => (
                <div key={supplement} className="flex items-center space-x-2">
                  <Checkbox
                    id={supplement}
                    checked={completedSupplements.includes(supplement)}
                    onCheckedChange={() => toggleSupplement(supplement)}
                  />
                  <Label htmlFor={supplement} className="text-sm">{supplement}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Final Reflection */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">Final Check-in</Label>
            
            <div>
              <Label>Pain/Stiffness Level</Label>
              <Slider min={0} max={10} step={1} value={[finalPain]} onValueChange={v => setFinalPain(v[0])} />
              <div className="text-xs text-gray-500 mt-1">{finalPain}/10</div>
            </div>

            <div>
              <Label>Mood Level</Label>
              <Slider min={1} max={10} step={1} value={[finalMood]} onValueChange={v => setFinalMood(v[0])} />
              <div className="text-xs text-gray-500 mt-1">{finalMood}/10</div>
            </div>

            <div>
              <Label>Energy Level</Label>
              <Slider min={1} max={10} step={1} value={[finalEnergy]} onValueChange={v => setFinalEnergy(v[0])} />
              <div className="text-xs text-gray-500 mt-1">{finalEnergy}/10</div>
            </div>

            <div>
              <Label>Today's Win</Label>
              <Textarea
                value={todayWin}
                onChange={e => setTodayWin(e.target.value)}
                placeholder="What went well today?"
                rows={3}
              />
            </div>

            <div>
              <Label>Today's Challenge</Label>
              <Textarea
                value={todayChallenge}
                onChange={e => setTodayChallenge(e.target.value)}
                placeholder="What was challenging or what could improve?"
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Complete Evening Unwind'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 