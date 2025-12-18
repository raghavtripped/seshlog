import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, LogIn, BarChart3, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const TopNavbar: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-white/70 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-2 sm:px-6 py-2 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl gradient-text hover:opacity-90 transition">
          <span className="brand-emoji text-2xl">📝</span>
          <span className={isMobile ? "inline" : "hidden sm:inline"}>Seshlog</span>
        </Link>

        {/* Main Navigation */}
        <NavigationMenu className="flex-1 justify-center hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/" className="px-4 py-2 rounded-lg hover:bg-accent/40 transition font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" /> Substance Tracking
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/visualisations" className="px-4 py-2 rounded-lg hover:bg-accent/40 transition font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Visualisations
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button (optional, not implemented here) */}
        {/* <Button variant="ghost" size="icon" className="md:hidden"><Menu /></Button> */}

        {/* Right Side: Theme, User, Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {/* Show user email beside logout on mobile, and in glass card on desktop */}
          {user && (
            isMobile ? (
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium truncate max-w-[100px]">{user.email}</span>
            ) : (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card-secondary">
                <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium truncate max-w-[120px]">{user.email}</span>
              </div>
            )
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
              <span className={isMobile ? "inline ml-1" : "hidden sm:inline ml-1"}>Logout</span>
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