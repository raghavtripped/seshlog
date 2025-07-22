import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { LineChartWidget, HabitTrackerWidget, CorrelationChartWidget, InsightsListWidget } from '../components/DashboardWidgets';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card } from '../components/ui/card';
import { X, Plus, Grid } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

type WidgetType = 'line-chart' | 'habit-tracker' | 'correlation-chart' | 'insights';

type WidgetConfig = {
  id: string;
  type: WidgetType;
  title: string;
  props: Record<string, unknown>;
};

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const WIDGET_TEMPLATES = [
  {
    type: 'line-chart' as WidgetType,
    title: 'Sleep Quality Trend',
    props: { eventType: 'SLEEP_LOG', dataKey: 'quality', days: 30 },
    defaultSize: { w: 6, h: 4 }
  },
  {
    type: 'line-chart' as WidgetType,
    title: 'Morning Mood Trend',
    props: { eventType: 'MOOD_LOG_AM', dataKey: 'mood', days: 30 },
    defaultSize: { w: 6, h: 4 }
  },
  {
    type: 'line-chart' as WidgetType,
    title: 'Pain/Stiffness Levels',
    props: { eventType: 'SOMATIC_LOG_AM', dataKey: 'pain', days: 30 },
    defaultSize: { w: 6, h: 4 }
  },
  {
    type: 'line-chart' as WidgetType,
    title: 'Work Focus Levels',
    props: { eventType: 'WORK_LOG', dataKey: 'focus', days: 30 },
    defaultSize: { w: 6, h: 4 }
  },
  {
    type: 'habit-tracker' as WidgetType,
    title: 'Hydration Habits',
    props: { eventType: 'HYDRATION_LOG', days: 49 },
    defaultSize: { w: 6, h: 3 }
  },
  {
    type: 'habit-tracker' as WidgetType,
    title: 'Nutrition Logging',
    props: { eventType: 'NUTRITION_LOG', days: 49 },
    defaultSize: { w: 6, h: 3 }
  },
  {
    type: 'habit-tracker' as WidgetType,
    title: 'Physical Activity',
    props: { eventType: 'ACTIVITY_LOG', days: 49 },
    defaultSize: { w: 6, h: 3 }
  },
  {
    type: 'correlation-chart' as WidgetType,
    title: 'Sleep Quality vs Morning Mood',
    props: {
      eventType1: 'SLEEP_LOG',
      eventType2: 'MOOD_LOG_AM',
      dataKey1: 'quality',
      dataKey2: 'mood',
      days: 30
    },
    defaultSize: { w: 12, h: 4 }
  },
  {
    type: 'insights' as WidgetType,
    title: 'Personal Insights',
    props: {},
    defaultSize: { w: 6, h: 5 }
  }
];

export default function CustomizableDashboard() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    {
      id: 'sleep-quality',
      type: 'line-chart',
      title: 'Sleep Quality Trend',
      props: { eventType: 'SLEEP_LOG', dataKey: 'quality', days: 30 }
    },
    {
      id: 'insights',
      type: 'insights',
      title: 'Personal Insights',
      props: {}
    }
  ]);

  const [layouts, setLayouts] = useState<{ [key: string]: LayoutItem[] }>({
    lg: [
      { i: 'sleep-quality', x: 0, y: 0, w: 6, h: 4 },
      { i: 'insights', x: 6, y: 0, w: 6, h: 5 }
    ]
  });

  const [showWidgetSelector, setShowWidgetSelector] = useState(false);

  const addWidget = (template: typeof WIDGET_TEMPLATES[0]) => {
    const newId = `widget-${Date.now()}`;
    const newWidget: WidgetConfig = {
      id: newId,
      type: template.type,
      title: template.title,
      props: template.props
    };

    setWidgets(prev => [...prev, newWidget]);

    // Add to layout
    const newLayoutItem: LayoutItem = {
      i: newId,
      x: 0,
      y: Math.max(...layouts.lg.map(item => item.y + item.h), 0),
      w: template.defaultSize.w,
      h: template.defaultSize.h
    };

    setLayouts(prev => ({
      ...prev,
      lg: [...prev.lg, newLayoutItem]
    }));

    setShowWidgetSelector(false);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    setLayouts(prev => ({
      ...prev,
      lg: prev.lg.filter(item => item.i !== widgetId)
    }));
  };

  const onLayoutChange = (layout: LayoutItem[], layouts: { [key: string]: LayoutItem[] }) => {
    setLayouts(layouts);
  };

  const renderWidget = (widget: WidgetConfig) => {
    const commonProps = { key: widget.id, title: widget.title, ...widget.props };

    switch (widget.type) {
      case 'line-chart':
        return <LineChartWidget {...commonProps} />;
      case 'habit-tracker':
        return <HabitTrackerWidget {...commonProps} />;
      case 'correlation-chart':
        return <CorrelationChartWidget {...commonProps} />;
      case 'insights':
        return <InsightsListWidget />;
      default:
        return <Card className="p-4"><div>Unknown widget type</div></Card>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customizable Dashboard</h1>
            <p className="text-gray-600">Drag, resize, and customize your personal analytics</p>
          </div>
          
          <Dialog open={showWidgetSelector} onOpenChange={setShowWidgetSelector}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Widget</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {WIDGET_TEMPLATES.map((template, index) => (
                  <Card 
                    key={index} 
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addWidget(template)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Grid className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">{template.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 capitalize">
                      {template.type.replace('-', ' ')} widget
                    </p>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {widgets.length === 0 ? (
          <Card className="p-8 text-center">
            <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No widgets yet</h3>
            <p className="text-gray-500 mb-4">Start building your dashboard by adding widgets</p>
            <Button onClick={() => setShowWidgetSelector(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Widget
            </Button>
          </Card>
        ) : (
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            isDraggable={true}
            isResizable={true}
            margin={[16, 16]}
          >
            {widgets.map(widget => (
              <div key={widget.id} className="relative">
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity"
                  style={{ width: '24px', height: '24px' }}
                >
                  <X className="w-3 h-3" />
                </button>
                {renderWidget(widget)}
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </div>
    </div>
  );
} 