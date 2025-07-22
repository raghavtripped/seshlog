import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { Categories } from "./pages/Categories";
import Cigs from "./pages/Cigs";
import Vapes from "./pages/Vapes";
import Liquor from "./pages/Liquor";
import NotFound from "./pages/NotFound";
import Weed from "./pages/Weed";
import WeedHistory from "./pages/WeedHistory";
import CigsHistory from "./pages/CigsHistory";
import VapesHistory from "./pages/VapesHistory";
import LiquorHistory from "./pages/LiquorHistory";
import Routines from './pages/Routines';
import Sleep from './pages/SleepPage';
import Mood from './pages/Mood';
import Nutrition from './pages/Nutrition';
import Hydration from './pages/Hydration';
import Activity from './pages/ActivityPage';
import Work from './pages/WorkPage';
import Pain from './pages/PainPage';
import Supplements from './pages/SupplementsPage';
import { MorningRiseModal } from './components/MorningRiseModal';
import { EveningUnwindModal } from './components/EveningUnwindModal';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from './integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DayLog } from './components/DayLog';

const queryClient = new QueryClient();

// Separate component for auth-dependent logic
function AppContent() {
  const { user } = useAuth();
  const [showMorningModal, setShowMorningModal] = useState(false);
  const [showEveningModal, setShowEveningModal] = useState(false);

  // Query for today's SLEEP_LOG
  const today = new Date();
  today.setHours(0,0,0,0);
  const isoToday = today.toISOString();
  const { data: sleepLog, isLoading } = useQuery({
    queryKey: ['sleep_log_today', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('daily_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'SLEEP_LOG')
        .gte('created_at', isoToday)
        .lte('created_at', new Date(today.getTime() + 24*60*60*1000 - 1).toISOString());
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!user,
  });

  // Query for today's DAILY_REFLECTION
  const { data: dailyReflection, isLoading: reflectionLoading } = useQuery({
    queryKey: ['daily_reflection_today', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('daily_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'DAILY_REFLECTION')
        .gte('created_at', isoToday)
        .lte('created_at', new Date(today.getTime() + 24*60*60*1000 - 1).toISOString());
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user && !isLoading && !sleepLog) {
      setShowMorningModal(true);
    }
  }, [user, isLoading, sleepLog]);

  useEffect(() => {
    if (user && !reflectionLoading && !dailyReflection) {
      const currentHour = new Date().getHours();
      // Show evening modal after 6 PM
      if (currentHour >= 18) {
        setShowEveningModal(true);
      }
    }
  }, [user, reflectionLoading, dailyReflection]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <nav className="p-4 bg-white shadow flex gap-4">
          <Link to="/">Welcome</Link>
          <Link to="/routines">Life Tracking</Link>
          <Link to="/categories">Legacy Sessions</Link>
        </nav>
        <Routes>
          <Route path="/" element={<>
            <Index />
            <div className="max-w-2xl mx-auto mt-8">
              <DayLog />
            </div>
          </>} />
          <Route path="/login" element={<Login />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cigs" element={<Cigs />} />
          <Route path="/cigs/history" element={<CigsHistory />} />
          <Route path="/vapes" element={<Vapes />} />
          <Route path="/vapes/history" element={<VapesHistory />} />
          <Route path="/liquor" element={<Liquor />} />
          <Route path="/liquor/history" element={<LiquorHistory />} />
          <Route path="/weed" element={<Weed />} />
          <Route path="/weed/history" element={<WeedHistory />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/sleep" element={<Sleep />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/hydration" element={<Hydration />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/work" element={<Work />} />
          <Route path="/pain" element={<Pain />} />
          <Route path="/supplements" element={<Supplements />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MorningRiseModal open={showMorningModal} onOpenChange={setShowMorningModal} />
        <EveningUnwindModal open={showEveningModal} onOpenChange={setShowEveningModal} />
      </div>
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
