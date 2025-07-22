import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfDay, endOfDay, subDays, parseISO } from 'date-fns';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';

type DailyEvent = {
  id: string;
  user_id: string;
  created_at: string;
  event_type: string;
  payload: Record<string, unknown>;
};

type UserInsight = {
  id: string;
  user_id: string;
  insight_text: string;
  generated_at: string;
  priority: number;
};

type ChartDataPoint = {
  date: string;
  value: number;
};

type CorrelationDataPoint = {
  date: string;
  metric1: number;
  metric2: number;
};

type GridDataPoint = {
  date: string;
  count: number;
  intensity: number;
};

// Fetch daily events for the current user
const fetchDailyEvents = async (eventType?: string, days = 30): Promise<DailyEvent[]> => {
  const startDate = startOfDay(subDays(new Date(), days));
  let query = supabase
    .from('daily_events')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as DailyEvent[];
};

// Line Chart Widget
export function LineChartWidget({ 
  eventType, 
  title, 
  dataKey, 
  days = 30 
}: { 
  eventType: string; 
  title: string; 
  dataKey: string; 
  days?: number; 
}) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['daily_events', eventType, days],
    queryFn: () => fetchDailyEvents(eventType, days),
  });

  const chartData = useMemo((): ChartDataPoint[] => {
    const dataMap = new Map<string, ChartDataPoint>();
    
    // Initialize with zeros for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dataMap.set(date, { date, value: 0 });
    }

    // Add actual data
    events.forEach(event => {
      const date = format(parseISO(event.created_at), 'yyyy-MM-dd');
      const value = (event.payload[dataKey] as number) || 0;
      if (dataMap.has(date)) {
        const existing = dataMap.get(date)!;
        existing.value += value;
      }
    });

    return Array.from(dataMap.values());
  }, [events, days, dataKey]);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <Label className="text-lg font-semibold mb-4 block">{title}</Label>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Habit Tracker Widget (GitHub-style grid)
export function HabitTrackerWidget({ 
  eventType, 
  title, 
  days = 365 
}: { 
  eventType: string; 
  title: string; 
  days?: number; 
}) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['daily_events', eventType, days],
    queryFn: () => fetchDailyEvents(eventType, days),
  });

  const gridData = useMemo((): GridDataPoint[] => {
    const dataMap = new Map<string, number>();
    
    // Initialize with zeros
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dataMap.set(date, 0);
    }

    // Count events per day
    events.forEach(event => {
      const date = format(parseISO(event.created_at), 'yyyy-MM-dd');
      if (dataMap.has(date)) {
        dataMap.set(date, dataMap.get(date)! + 1);
      }
    });

    return Array.from(dataMap.entries()).map(([date, count]) => ({
      date,
      count,
      intensity: Math.min(count / 3, 1), // Scale intensity (max at 3+ events)
    }));
  }, [events, days]);

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100';
    if (intensity <= 0.25) return 'bg-green-200';
    if (intensity <= 0.5) return 'bg-green-300';
    if (intensity <= 0.75) return 'bg-green-400';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <Label className="text-lg font-semibold mb-4 block">{title}</Label>
      <div className="grid grid-cols-7 gap-1">
        {gridData.slice(-49).map(({ date, count, intensity }) => (
          <div
            key={date}
            className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
            title={`${format(parseISO(date), 'MMM dd, yyyy')}: ${count} events`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}

// Correlation Chart Widget
export function CorrelationChartWidget({ 
  eventType1, 
  eventType2, 
  dataKey1, 
  dataKey2, 
  title, 
  days = 30 
}: { 
  eventType1: string; 
  eventType2: string; 
  dataKey1: string; 
  dataKey2: string; 
  title: string; 
  days?: number; 
}) {
  const { data: events1 = [] } = useQuery({
    queryKey: ['daily_events', eventType1, days],
    queryFn: () => fetchDailyEvents(eventType1, days),
  });

  const { data: events2 = [] } = useQuery({
    queryKey: ['daily_events', eventType2, days],
    queryFn: () => fetchDailyEvents(eventType2, days),
  });

  const chartData = useMemo((): CorrelationDataPoint[] => {
    const dataMap = new Map<string, CorrelationDataPoint>();
    
    // Initialize with zeros
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dataMap.set(date, { date, metric1: 0, metric2: 0 });
    }

    // Add data from first event type
    events1.forEach(event => {
      const date = format(parseISO(event.created_at), 'yyyy-MM-dd');
      const value = (event.payload[dataKey1] as number) || 0;
      if (dataMap.has(date)) {
        dataMap.get(date)!.metric1 = value;
      }
    });

    // Add data from second event type
    events2.forEach(event => {
      const date = format(parseISO(event.created_at), 'yyyy-MM-dd');
      const value = (event.payload[dataKey2] as number) || 0;
      if (dataMap.has(date)) {
        dataMap.get(date)!.metric2 = value;
      }
    });

    return Array.from(dataMap.values()).filter(d => d.metric1 > 0 || d.metric2 > 0);
  }, [events1, events2, days, dataKey1, dataKey2]);

  return (
    <Card className="p-4">
      <Label className="text-lg font-semibold mb-4 block">{title}</Label>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
          />
          <Line 
            type="monotone" 
            dataKey="metric1" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name={dataKey1}
          />
          <Line 
            type="monotone" 
            dataKey="metric2" 
            stroke="#ef4444" 
            strokeWidth={2}
            name={dataKey2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Fetch user insights
const fetchUserInsights = async (): Promise<UserInsight[]> => {
  const { data, error } = await supabase
    .from('user_insights')
    .select('*')
    .order('priority', { ascending: true });
  if (error) throw error;
  return data as UserInsight[];
};

// Trigger insights generation
const generateInsights = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke('insights-engine', {
    body: { user_id: userId }
  });
  if (error) throw error;
  return data;
};

// Insights List Widget
export function InsightsListWidget() {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['user_insights'],
    queryFn: fetchUserInsights,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not logged in');
      return generateInsights(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_insights'] });
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Error generating insights:', error);
      setIsGenerating(false);
    },
  });

  const handleGenerateInsights = () => {
    setIsGenerating(true);
    generateMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-lg font-semibold">Personal Insights</Label>
        <Button
          size="sm"
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className="text-xs"
        >
          {isGenerating ? 'Generating...' : 'Refresh'}
        </Button>
      </div>
      
      {insights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No insights generated yet.</p>
          <Button onClick={handleGenerateInsights} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-700">{insight.insight_text}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
} 