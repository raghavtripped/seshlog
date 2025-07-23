import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  {
    to: "/",
    label: "Welcome",
    icon: <Home className="w-6 h-6" />,
  },
  {
    to: "/routines",
    label: "Life Tracking",
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    to: "/categories",
    label: "Substance Tracking",
    icon: <Target className="w-6 h-6" />,
  },
];

export const BottomNavbar: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border-t border-gray-200 dark:border-gray-800 rounded-t-xl flex justify-around items-center py-2 px-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition font-medium text-xs ${
              isActive
                ? "bg-accent/30 text-primary"
                : "hover:bg-accent/20 text-gray-600 dark:text-gray-300"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavbar; 