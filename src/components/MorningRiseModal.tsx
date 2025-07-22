import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

const MOODS = ['Happy', 'Calm', 'Tired', 'Anxious', 'Sad', 'Energetic', 'Neutral'];

function StarRating({ value, onChange, max = 5 }: { value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          className={
            'text-2xl ' + (i < value ? 'text-yellow-400' : 'text-gray-300')
          }
          onClick={() => onChange(i + 1)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function MorningRiseModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  // Sleep
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [awakenings, setAwakenings] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(3);
  // Somatic
  const [pain, setPain] = useState(2);
  // Mood
  const [mood, setMood] = useState<string>('Neutral');

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not logged in');
      const today = new Date();
      today.setHours(0,0,0,0);
      // SLEEP_LOG
      const sleepPayload = {
        sleep_time: sleepTime,
        wake_time: wakeTime,
        awakenings,
        quality: sleepQuality,
      };
      // MOOD_LOG_AM
      const moodPayload = { mood };
      // SOMATIC_LOG_AM
      const somaticPayload = { pain };
      const { error } = await supabase.from('daily_events').insert([
        {
          user_id: user.id,
          event_type: 'SLEEP_LOG',
          created_at: today.toISOString(),
          payload: sleepPayload,
        },
        {
          user_id: user.id,
          event_type: 'MOOD_LOG_AM',
          created_at: today.toISOString(),
          payload: moodPayload,
        },
        {
          user_id: user.id,
          event_type: 'SOMATIC_LOG_AM',
          created_at: today.toISOString(),
          payload: somaticPayload,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_events'] });
      onOpenChange(false);
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
          <DialogTitle>Morning Rise</DialogTitle>
          <DialogDescription>Log your sleep, somatic state, and mood for today.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sleep Section */}
          <div>
            <Label>Sleep Time</Label>
            <Input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} required />
          </div>
          <div>
            <Label>Wake Time</Label>
            <Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} required />
          </div>
          <div>
            <Label>Awakenings</Label>
            <div className="flex items-center gap-2">
              <Button type="button" onClick={() => setAwakenings(a => Math.max(0, a - 1))}>-</Button>
              <span>{awakenings}</span>
              <Button type="button" onClick={() => setAwakenings(a => a + 1)}>+</Button>
            </div>
          </div>
          <div>
            <Label>Sleep Quality</Label>
            <StarRating value={sleepQuality} onChange={setSleepQuality} />
          </div>
          {/* Somatic State */}
          <div>
            <Label>Pain/Stiffness</Label>
            <Slider min={0} max={10} step={1} value={[pain]} onValueChange={v => setPain(v[0])} />
            <div className="text-xs text-gray-500 mt-1">{pain}/10</div>
          </div>
          {/* Mood */}
          <div>
            <Label>Mood</Label>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => (
                <Badge
                  key={m}
                  variant={m === mood ? 'default' : 'secondary'}
                  className={m === mood ? 'ring-2 ring-primary' : 'cursor-pointer'}
                  onClick={() => setMood(m)}
                >
                  {m}
                </Badge>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Logging...' : 'Log Morning Rise'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 