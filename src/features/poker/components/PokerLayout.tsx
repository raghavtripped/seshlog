// Shared chrome for the poker section: a back-to-categories header, a title,
// and a sub-navigation tab bar across the five poker routes. Renders inside the
// app's RootLayout (TopNavbar + BottomNavbar), matching the rest of the app.

import { ReactNode } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, PlusCircle, List, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/poker", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/poker/log", label: "Log", icon: PlusCircle },
  { to: "/poker/sessions", label: "Sessions", icon: List },
  { to: "/poker/analytics", label: "Analytics", icon: BarChart3 },
];

interface PokerLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PokerLayout({ title, subtitle, actions, children }: PokerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-[calc(100vh-7.5rem)] bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto max-w-5xl px-4 py-4 sm:py-6">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/categories")}
              variant="ghost"
              size="sm"
              className="rounded-xl p-2 hover:bg-white/60"
              aria-label="Back to categories"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-2xl shadow-lg">
              ♠️
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 sm:text-xl">{title}</h1>
              {subtitle && <p className="text-xs text-gray-600 sm:text-sm">{subtitle}</p>}
            </div>
          </div>
          {actions}
        </header>

        {/* Sub-navigation */}
        <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-white/70 p-1 shadow-sm backdrop-blur">
          {TABS.map((tab) => {
            const active = tab.exact
              ? location.pathname === tab.to
              : location.pathname.startsWith(tab.to);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow"
                    : "text-gray-600 hover:bg-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="space-y-6 pb-8">{children}</main>
      </div>
    </div>
  );
}

export default PokerLayout;
