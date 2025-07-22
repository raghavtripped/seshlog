import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

const BEVERAGES = [
  { name: 'Water', quantity: 250 },
  { name: 'Coffee', quantity: 200 },
  { name: 'Tea', quantity: 200 },
  { name: 'Juice', quantity: 200 },
];

const FOODS = ['Carbs', 'Protein', 'Fat', 'Veggies', 'Fruit', 'Dairy', 'Other'];

interface NutritionPayload {
  composition: string[];
  satisfaction: number;
  photo_url?: string;
}

function NutritionModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [composition, setComposition] = useState<string[]>([]);
  const [satisfaction, setSatisfaction] = useState(5);
  const [photo, setPhoto] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not logged in');
      const payload: NutritionPayload = {
        composition,
        satisfaction,
      };
      if (photo) {
        const { data, error } = await supabase.storage.from('meal-photos').upload(`meal-${user.id}-${Date.now()}.jpg`, photo);
        if (!error && data) payload.photo_url = data.path;
      }
      const { error } = await supabase.from('daily_events').insert([
        {
          user_id: user.id,
          event_type: 'NUTRITION_LOG',
          created_at: new Date().toISOString(),
          payload,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_events'] });
      onOpenChange(false);
      setComposition([]);
      setSatisfaction(5);
      setPhoto(null);
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Log Meal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Label>Food Composition</Label>
          <div className="flex gap-2 flex-wrap mb-2">
            {FOODS.map(f => (
              <Button
                key={f}
                type="button"
                variant={composition.includes(f) ? 'default' : 'secondary'}
                onClick={() => setComposition(c => c.includes(f) ? c.filter(x => x !== f) : [...c, f])}
              >
                {f}
              </Button>
            ))}
          </div>
          <Label>Satisfaction</Label>
          <Slider min={1} max={10} value={[satisfaction]} onValueChange={v => setSatisfaction(v[0])} />
          <div className="text-xs text-gray-500 mb-2">{satisfaction}/10</div>
          <Label>Photo (optional)</Label>
          <Input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Logging...' : 'Log Meal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DayLog() {
  const [showNutrition, setShowNutrition] = useState(false);
  const queryClient = useQueryClient();
  // Hydration
  const hydrationMutation = useMutation({
    mutationFn: async ({ beverage, quantity }: { beverage: string; quantity: number }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('daily_events').insert([
        {
          user_id: user.id,
          event_type: 'HYDRATION_LOG',
          created_at: new Date().toISOString(),
          payload: { beverage, quantity_ml: quantity },
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily_events'] }),
  });
  // Productivity/Activity
  const [showWork, setShowWork] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [workDuration, setWorkDuration] = useState(60);
  const [workFocus, setWorkFocus] = useState(5);
  const [activityType, setActivityType] = useState('');
  const [activityDuration, setActivityDuration] = useState(30);
  const workMutation = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('daily_events').insert([
        {
          user_id: user.id,
          event_type: 'WORK_LOG',
          created_at: new Date().toISOString(),
          payload: { duration_min: workDuration, focus: workFocus },
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_events'] });
      setShowWork(false);
      setWorkDuration(60);
      setWorkFocus(5);
    },
  });
  const activityMutation = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('daily_events').insert([
        {
          user_id: user.id,
          event_type: 'ACTIVITY_LOG',
          created_at: new Date().toISOString(),
          payload: { type: activityType, duration_min: activityDuration },
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_events'] });
      setShowActivity(false);
      setActivityType('');
      setActivityDuration(30);
    },
  });
  return (
    <div className="space-y-8">
      {/* Nutrition Hub */}
      <div>
        <Button onClick={() => setShowNutrition(true)}>+ Log Meal</Button>
        <NutritionModal open={showNutrition} onOpenChange={setShowNutrition} />
      </div>
      {/* Hydration */}
      <div className="flex gap-2 flex-wrap">
        {BEVERAGES.map(b => (
          <Button
            key={b.name}
            variant="secondary"
            onClick={() => hydrationMutation.mutate({ beverage: b.name, quantity: b.quantity })}
            disabled={hydrationMutation.isPending}
          >
            + {b.name}
          </Button>
        ))}
      </div>
      {/* Productivity & Activity */}
      <div className="flex gap-4 flex-wrap">
        <Button onClick={() => setShowWork(true)}>+ Log Work</Button>
        <Button onClick={() => setShowActivity(true)}>+ Log Activity</Button>
      </div>
      {/* Work Modal */}
      <Dialog open={showWork} onOpenChange={setShowWork}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Log Work</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); workMutation.mutate(); }} className="space-y-4">
            <Label>Duration (minutes)</Label>
            <Input type="number" min={1} value={workDuration} onChange={e => setWorkDuration(Number(e.target.value))} />
            <Label>Focus</Label>
            <Slider min={1} max={10} value={[workFocus]} onValueChange={v => setWorkFocus(v[0])} />
            <div className="text-xs text-gray-500 mb-2">{workFocus}/10</div>
            <Button type="submit" className="w-full" disabled={workMutation.isPending}>
              {workMutation.isPending ? 'Logging...' : 'Log Work'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Activity Modal */}
      <Dialog open={showActivity} onOpenChange={setShowActivity}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); activityMutation.mutate(); }} className="space-y-4">
            <Label>Type</Label>
            <Input value={activityType} onChange={e => setActivityType(e.target.value)} placeholder="e.g. Walk, Run, Yoga" />
            <Label>Duration (minutes)</Label>
            <Input type="number" min={1} value={activityDuration} onChange={e => setActivityDuration(Number(e.target.value))} />
            <Button type="submit" className="w-full" disabled={activityMutation.isPending}>
              {activityMutation.isPending ? 'Logging...' : 'Log Activity'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 