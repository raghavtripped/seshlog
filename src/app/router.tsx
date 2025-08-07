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
// Nutrition removed
const Hydration = lazy(() => import('@/pages/Hydration'));
const Activity = lazy(() => import('@/pages/ActivityPage'));
// Work/Pain/Supplements removed
const HydrationHistory = lazy(() => import('@/pages/HydrationHistory'));
// Supplements/Work history removed
const MoodHistory = lazy(() => import('@/pages/MoodHistory'));
// Pain history removed
const SleepHistory = lazy(() => import('@/pages/SleepHistory'));
// Nutrition history removed
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
      // nutrition removed
      { path: 'hydration', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Hydration /></ProtectedRoute></Suspense> },
      { path: 'activity', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Activity /></ProtectedRoute></Suspense> },
      // work/pain/supplements removed
      { path: 'hydration/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><HydrationHistory /></ProtectedRoute></Suspense> },
      // supplements/work history removed
      { path: 'mood/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><MoodHistory /></ProtectedRoute></Suspense> },
      // pain history removed
      { path: 'sleep/history', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><SleepHistory /></ProtectedRoute></Suspense> },
      // nutrition history removed
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

