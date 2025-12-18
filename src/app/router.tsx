import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from './layouts/RootLayout';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/hooks/useAuth';

// Lazy-loaded pages for code splitting
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
const Visualisation = lazy(() => import('@/pages/Visualisation'));

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
      {
        index: true,
        element: (
          <Suspense fallback={<div className="p-6">Loading...</div>}>
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          </Suspense>
        ),
      },
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
      { path: 'visualisations', element: <Suspense fallback={<div className="p-6">Loading...</div>}><ProtectedRoute><Visualisation /></ProtectedRoute></Suspense> },
      { path: 'visualisation', element: <Navigate to="/visualisations" replace /> },
      { path: 'auth/callback', element: <Suspense fallback={<div className="p-6">Loading...</div>}><AuthCallback /></Suspense> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;

