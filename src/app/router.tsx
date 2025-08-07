import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from './layouts/RootLayout';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/hooks/useAuth';

// Lazy-loaded pages for code splitting
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const AuthCallback = lazy(() => import('@/pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const Categories = lazy(() => import('@/pages/Categories').then(m => ({ default: m.Categories })));
const Cigs = lazy(() => import('@/pages/Cigs'));
const Vapes = lazy(() => import('@/pages/Vapes'));
const Liquor = lazy(() => import('@/pages/Liquor'));
const Weed = lazy(() => import('@/pages/Weed'));
const WeedHistory = lazy(() => import('@/pages/WeedHistory'));
const CigsHistory = lazy(() => import('@/pages/CigsHistory'));
const VapesHistory = lazy(() => import('@/pages/VapesHistory'));
const LiquorHistory = lazy(() => import('@/pages/LiquorHistory'));
const Routines = lazy(() => import('@/pages/Routines'));
const Sleep = lazy(() => import('@/pages/SleepPage'));
const Mood = lazy(() => import('@/pages/Mood'));
const Nutrition = lazy(() => import('@/pages/Nutrition'));
const Hydration = lazy(() => import('@/pages/Hydration'));
const Activity = lazy(() => import('@/pages/ActivityPage'));
const Work = lazy(() => import('@/pages/WorkPage'));
const Pain = lazy(() => import('@/pages/PainPage'));
const Supplements = lazy(() => import('@/pages/SupplementsPage'));
const HydrationHistory = lazy(() => import('@/pages/HydrationHistory'));
const SupplementsHistory = lazy(() => import('@/pages/SupplementsHistory'));
const WorkHistory = lazy(() => import('@/pages/WorkHistory'));
const MoodHistory = lazy(() => import('@/pages/MoodHistory'));
const PainHistory = lazy(() => import('@/pages/PainHistory'));
const SleepHistory = lazy(() => import('@/pages/SleepHistory'));
const NutritionHistory = lazy(() => import('@/pages/NutritionHistory'));
const ActivityHistory = lazy(() => import('@/pages/ActivityHistory'));

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Suspense fallback={<div className="p-6">Loading...</div>}><Index /></Suspense> },
      { path: 'login', element: <Suspense fallback={<div className="p-6">Loading...</div>}><Login /></Suspense> },
      { path: 'categories', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Categories /></ProtectedRoute></Suspense> },
      { path: 'cigs', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Cigs /></ProtectedRoute></Suspense> },
      { path: 'cigs/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><CigsHistory /></ProtectedRoute></Suspense> },
      { path: 'vapes', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Vapes /></ProtectedRoute></Suspense> },
      { path: 'vapes/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><VapesHistory /></ProtectedRoute></Suspense> },
      { path: 'liquor', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Liquor /></ProtectedRoute></Suspense> },
      { path: 'liquor/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><LiquorHistory /></ProtectedRoute></Suspense> },
      { path: 'weed', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Weed /></ProtectedRoute></Suspense> },
      { path: 'weed/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><WeedHistory /></ProtectedRoute></Suspense> },
      { path: 'routines', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Routines /></ProtectedRoute></Suspense> },
      { path: 'sleep', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Sleep /></ProtectedRoute></Suspense> },
      { path: 'mood', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Mood /></ProtectedRoute></Suspense> },
      { path: 'nutrition', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Nutrition /></ProtectedRoute></Suspense> },
      { path: 'hydration', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Hydration /></ProtectedRoute></Suspense> },
      { path: 'activity', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Activity /></ProtectedRoute></Suspense> },
      { path: 'work', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Work /></ProtectedRoute></Suspense> },
      { path: 'pain', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Pain /></ProtectedRoute></Suspense> },
      { path: 'supplements', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Supplements /></ProtectedRoute></Suspense> },
      { path: 'hydration/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><HydrationHistory /></ProtectedRoute></Suspense> },
      { path: 'supplements/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><SupplementsHistory /></ProtectedRoute></Suspense> },
      { path: 'work/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><WorkHistory /></ProtectedRoute></Suspense> },
      { path: 'mood/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><MoodHistory /></ProtectedRoute></Suspense> },
      { path: 'pain/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><PainHistory /></ProtectedRoute></Suspense> },
      { path: 'sleep/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><SleepHistory /></ProtectedRoute></Suspense> },
      { path: 'nutrition/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><NutritionHistory /></ProtectedRoute></Suspense> },
      { path: 'activity/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><ActivityHistory /></ProtectedRoute></Suspense> },
      { path: 'auth/callback', element: <Suspense fallback={<div className="p-6">Loading...</div>}><AuthCallback /></Suspense> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;

