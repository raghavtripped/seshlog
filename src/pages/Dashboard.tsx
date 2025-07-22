import React from 'react';
import { LineChartWidget, HabitTrackerWidget, CorrelationChartWidget, InsightsListWidget } from '../components/DashboardWidgets';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Dashboard</h1>
          <p className="text-gray-600">Your comprehensive life analytics and insights</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sleep Quality Trend */}
          <LineChartWidget
            eventType="SLEEP_LOG"
            title="Sleep Quality Trend"
            dataKey="quality"
            days={30}
          />

          {/* Mood Tracking */}
          <LineChartWidget
            eventType="MOOD_LOG_AM"
            title="Morning Mood Trend"
            dataKey="mood"
            days={30}
          />

          {/* Hydration Habit Tracker */}
          <HabitTrackerWidget
            eventType="HYDRATION_LOG"
            title="Hydration Habits"
            days={49}
          />

          {/* Nutrition Habit Tracker */}
          <HabitTrackerWidget
            eventType="NUTRITION_LOG"
            title="Nutrition Logging"
            days={49}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sleep vs Mood Correlation */}
          <CorrelationChartWidget
            eventType1="SLEEP_LOG"
            eventType2="MOOD_LOG_AM"
            dataKey1="quality"
            dataKey2="mood"
            title="Sleep Quality vs Morning Mood"
            days={30}
          />

          {/* Pain Tracking */}
          <LineChartWidget
            eventType="SOMATIC_LOG_AM"
            title="Pain/Stiffness Levels"
            dataKey="pain"
            days={30}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Work Productivity */}
          <LineChartWidget
            eventType="WORK_LOG"
            title="Work Focus Levels"
            dataKey="focus"
            days={30}
          />

          {/* Activity Tracking */}
          <HabitTrackerWidget
            eventType="ACTIVITY_LOG"
            title="Physical Activity"
            days={49}
          />

          {/* Daily Insights */}
          <InsightsListWidget />
        </div>
      </div>
    </div>
  );
} 