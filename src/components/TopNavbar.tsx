import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, LogIn, ChevronDown, Home, List, BarChart3, Calendar, Target, Moon, Sun, Monitor, Menu } from "lucide-react";

const trackers = [
  { to: "/sleep", label: "Sleep", icon: <Calendar className="w-4 h-4 mr-2" /> },
  { to: "/mood", label: "Mood", icon: <BarChart3 className="w-4 h-4 mr-2" /> },
  { to: "/nutrition", label: "Nutrition", icon: <span className="mr-2">🍎</span> },
  { to: "/hydration", label: "Hydration", icon: <span className="mr-2">💧</span> },
  { to: "/activity", label: "Activity", icon: <span className="mr-2">🔥</span> },
  { to: "/work", label: "Work", icon: <span className="mr-2">🎯</span> },
  { to: "/pain", label: "Pain", icon: <span className="mr-2">🩹</span> },
  { to: "/supplements", label: "Supplements", icon: <span className="mr-2">💊</span> },
];

const legacy = [
  { to: "/weed", label: "Weed", icon: <span className="mr-2">🌿</span> },
  { to: "/cigs", label: "Cigs", icon: <span className="mr-2">🚬</span> },
  { to: "/vapes", label: "Vapes", icon: <span className="mr-2">💨</span> },
  { to: "/liquor", label: "Liquor", icon: <span className="mr-2">🥃</span> },
  { to: "/categories", label: "All Legacy", icon: <Target className="w-4 h-4 mr-2" /> },
];

export const TopNavbar: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-white/70 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-2 sm:px-6 py-2 flex items-center justify-between gap-2">
        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl gradient-text hover:opacity-90 transition">
          <span className="brand-emoji text-2xl">📝</span>
          <span className="hidden sm:inline">Sesh Log</span>
        </Link>

        {/* Main Navigation */}
        <NavigationMenu className="flex-1 justify-center hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/" className="px-4 py-2 rounded-lg hover:bg-accent/40 transition font-medium flex items-center gap-2">
                  <Home className="w-4 h-4" /> Welcome
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/routines" className="px-4 py-2 rounded-lg hover:bg-accent/40 transition font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Life Tracking
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                <List className="w-4 h-4" /> Trackers <ChevronDown className="w-4 h-4 ml-1" />
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-[220px] bg-white dark:bg-gray-900 rounded-xl shadow-xl p-2">
                <div className="flex flex-col gap-1">
                  {trackers.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center px-3 py-2 rounded-lg hover:bg-accent/30 transition font-medium ${location.pathname.startsWith(item.to) ? "bg-accent/20" : ""}`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Legacy <ChevronDown className="w-4 h-4 ml-1" />
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-[220px] bg-white dark:bg-gray-900 rounded-xl shadow-xl p-2">
                <div className="flex flex-col gap-1">
                  {legacy.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center px-3 py-2 rounded-lg hover:bg-accent/30 transition font-medium ${location.pathname.startsWith(item.to) ? "bg-accent/20" : ""}`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button (optional, not implemented here) */}
        {/* <Button variant="ghost" size="icon" className="md:hidden"><Menu /></Button> */}

        {/* Right Side: Theme, User, Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card-secondary">
              <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium truncate max-w-[120px]">{user.email}</span>
            </div>
          )}
          {user ? (
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl px-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          ) : !loading && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl px-3"
            >
              <Link to="/login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavbar; 