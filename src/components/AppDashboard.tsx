'use client';

import { useState, useMemo } from "react";
import type { User } from '@supabase/supabase-js';
import { Session } from "@/types/session";
import { useSessions } from "@/hooks/useSessions";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Import your UI components
import { SessionForm } from "@/components/SessionForm";
import { SessionList } from "@/components/SessionList";
import { SessionStats } from "@/components/SessionStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FilterControls } from "@/components/FilterControls";
import { Plus, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppDashboardProps {
  user: User;
  initialSessions: Session[];
}

export function AppDashboard({ user, initialSessions }: AppDashboardProps) {
  // --- State for UI and Filters ---
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sortBy, setSortBy] = useState('date-desc');
  const [periodFilter, setPeriodFilter] = useState<string>('all_time');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const { sessions, addSession, updateSession, deleteSession } = useSessions(user.id, initialSessions);

  // --- Centralized Filtering & Sorting Logic ---
  const { periodSessions, filteredAndSortedSessions } = useMemo(() => {
    let filtered = sessions;

    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      toDate.setHours(23, 59, 59, 999);
      filtered = sessions.filter(s => {
        const sessionDate = new Date(s.session_date);
        return sessionDate >= fromDate && sessionDate <= toDate;
      });
    } else {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (periodFilter) {
        case 'today': {
          filtered = sessions.filter(s => new Date(s.session_date) >= startOfToday);
          break;
        }
        case 'week': {
          const startOfWeek = new Date(startOfToday);
          startOfWeek.setDate(startOfWeek.getDate() - now.getDay());
          filtered = sessions.filter(s => new Date(s.session_date) >= startOfWeek);
          break;
        }
        case 'month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = sessions.filter(s => new Date(s.session_date) >= startOfMonth);
          break;
        }
        case 'year': {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          filtered = sessions.filter(s => new Date(s.session_date) >= startOfYear);
          break;
        }
        case 'past_year': {
          const startOfPastYear = new Date(now);
          startOfPastYear.setFullYear(startOfPastYear.getFullYear() - 1);
          filtered = sessions.filter(s => new Date(s.session_date) >= startOfPastYear);
          break;
        }
        default: {
          filtered = sessions;
          break;
        }
      }
    }
    
    const periodSessions = [...filtered];

    const sorted = periodSessions.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.session_date).getTime() - new Date(b.session_date).getTime();
        case 'rating-desc': return (b.rating || 0) - (a.rating || 0);
        case 'rating-asc': return (a.rating || 0) - (b.rating || 0);
        case 'individual-desc': return (b.quantity / b.participant_count) - (a.quantity / a.participant_count);
        case 'individual-asc': return (a.quantity / a.participant_count) - (b.quantity / b.participant_count);
        case 'type': return a.session_type.localeCompare(b.session_type);
        default: return new Date(b.session_date).getTime() - new Date(a.session_date).getTime();
      }
    });

    return { periodSessions, filteredAndSortedSessions: sorted };
  }, [sessions, periodFilter, dateRange, sortBy]);

  const handleAddSession = async (newSession: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    await addSession(newSession);
    setShowSessionForm(false);
  };

  const handleEditSession = async (updatedSession: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (editingSession) {
      await updateSession(editingSession.id, updatedSession);
      setEditingSession(null);
      setShowSessionForm(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      await deleteSession(sessionId);
    }
  };

  const openEditForm = (session: Session) => {
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const closeForm = () => {
    setEditingSession(null);
    setShowSessionForm(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="brand-logo bounce-subtle">
              <span className="brand-emoji">📝</span>
            </div>
            <div>
              <h1 className="heading-xl gradient-text">Sesh Log</h1>
              <p className="text-gray-600 dark:text-gray-400 body-sm">Your personal session tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="glass-card-secondary px-4 py-2 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300 body-sm font-medium truncate max-w-[120px]">
                {user.email}
              </span>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="ghost" 
              size="sm" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Add Session Button */}
        <div className="mb-8">
          <Button 
            onClick={() => setShowSessionForm(true)} 
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0"
          >
            <Plus className="w-5 h-5 mr-3" />
            Log New Session
          </Button>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <SessionStats allSessions={sessions} periodSessions={periodSessions} />
        </div>

        {/* Session Form Modal */}
        {showSessionForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <SessionForm 
                onSubmit={editingSession ? handleEditSession : handleAddSession}
                onCancel={closeForm}
                initialSession={editingSession || undefined}
              />
            </div>
          </div>
        )}
        
        {/* Session History */}
        <div className="glass-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="heading-md text-gray-800 dark:text-gray-200">Session History</h2>
          </div>
          
          <div className="mb-6">
            <FilterControls
              sortBy={sortBy}
              setSortBy={setSortBy}
              periodFilter={periodFilter}
              setPeriodFilter={setPeriodFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>

          <SessionList
            sessions={filteredAndSortedSessions}
            onEdit={openEditForm}
            onDelete={handleDeleteSession}
          />
        </div>
      </div>
    </div>
  );
}