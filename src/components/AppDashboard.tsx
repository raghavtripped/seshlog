'use client';

import { useState, useMemo, ReactNode } from "react";
import type { User } from '@supabase/supabase-js';
import { Session } from "@/types/session";
import { useSessions } from "@/hooks/useSessions";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Category } from "@/types/session";
import { useIsMobile } from '@/hooks/use-mobile';

// Import your UI components
import { SessionForm } from "@/components/SessionForm";
import { SessionList } from "@/components/SessionList";
import { SessionStats } from "@/components/SessionStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FilterControls } from "@/components/FilterControls";
import { Plus, User as UserIcon, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppDashboardProps {
  title: string;
  emoji: string;
  category: Category;
  onBackToCategories?: () => void;
  children: ReactNode;
}

export function AppDashboard({ 
  title, 
  emoji, 
  category, 
  onBackToCategories, 
  children 
}: AppDashboardProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const getCategoryGradient = (category: Category) => {
    switch (category) {
      case 'weed': return 'from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20';
      case 'cigs': return 'from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-900 dark:via-slate-900/20 dark:to-zinc-900/20';
      case 'vapes': return 'from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-cyan-900/20 dark:to-blue-900/20';
      case 'liquor': return 'from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-orange-900/20';
      default: return 'from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getCategoryGradient(category)}`}>
      <div className={`container mx-auto ${isMobile ? 'px-3 py-4' : 'px-4 py-6 sm:py-8'} max-w-6xl`}>
        {/* Header */}
        <header className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-col sm:flex-row sm:items-center'} justify-between ${isMobile ? 'mb-6' : 'mb-8'} gap-4`}>
          <div className="flex items-center gap-3 sm:gap-4">
            {onBackToCategories && (
              <Button
                onClick={onBackToCategories}
                variant="ghost"
                size={isMobile ? "sm" : "sm"}
                className={`${isMobile ? 'p-1.5' : 'p-2'} hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200`}
              >
                <ArrowLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </Button>
            )}
            <div className={`brand-logo bounce-subtle ${isMobile ? 'w-12 h-12' : ''}`}>
              <span className={`brand-emoji ${isMobile ? 'text-xl' : ''}`}>{emoji}</span>
            </div>
            <div>
              <h1 className={`${isMobile ? 'text-xl font-bold' : 'heading-xl'} gradient-text`}>{title}</h1>
              <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'body-sm'}`}>Track your sessions with insights</p>
            </div>
          </div>
          
          <div className={`flex items-center ${isMobile ? 'gap-2 justify-between' : 'gap-3'}`}>
            <ThemeToggle />
            {user && (
              <div className={`glass-card-secondary ${isMobile ? 'px-2 py-1' : 'px-4 py-2'} flex items-center gap-2`}>
                <UserIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600 dark:text-gray-400`} />
                <span className={`text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'body-sm'} font-medium truncate ${isMobile ? 'max-w-[100px]' : 'max-w-[120px]'}`}>
                  {user.email}
                </span>
              </div>
            )}
            <Button 
              onClick={handleSignOut}
              variant="ghost" 
              size={isMobile ? "sm" : "sm"}
              className={`text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl ${isMobile ? 'px-2' : ''}`}
            >
              <LogOut className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${isMobile ? '' : 'mr-2'}`} />
              <span className={`${isMobile ? 'hidden' : 'hidden sm:inline'}`}>Logout</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className={`space-y-${isMobile ? '6' : '8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}