import { Outlet } from 'react-router-dom';
import TopNavbar from '@/components/TopNavbar';
import { BottomNavbar } from '@/components';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopNavbar />
      <div className="pt-14 pb-16">
        <Outlet />
      </div>
      <BottomNavbar />
    </div>
  );
}

