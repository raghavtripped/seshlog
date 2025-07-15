// /src/pages/Liquor.tsx

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { AppDashboard } from '@/components/AppDashboard';
import { SessionForm } from '@/components/SessionForm';

import { SessionStats } from '@/components/SessionStats';
import { Insights } from '@/components/Insights';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';
import { LiquorSessionType } from '@/types/session';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterSortDialog } from '@/components/FilterSortDialog';
import { getCategoryGradient } from '@/lib/utils'; // FIX: Correct import path

const LiquorPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // State for filtering and sorting
  const [selectedType, setSelectedType] = useState<LiquorSessionType | 'All'>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState('date-desc');
  
  // State for managing the form's visibility
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isMobile = useIsMobile();

  // FIX: Destructure the correct state names from the hook
  const { sessions, isLoading, error, fetchSessions, deleteSession } = useSessions('liquor');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Memoized logic for filtering and sorting
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions;

    if (selectedType !== 'All') {
      filtered = filtered.filter(session => session.session_type === selectedType);
    }
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.session_date);
        return sessionDate >= fromDate && sessionDate <= toDate;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  }, [sessions, selectedType, dateRange, sortBy]);
  
  // Handler for opening the form
  const handleOpenNewForm = () => {
    setIsFormOpen(true);
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
  };
  
  // FIX: Unified handler for data changes
  const handleDataChange = () => {
    fetchSessions();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <AppDashboard 
      title="Liquor Tracker"
      emoji="🥃"
      category="liquor"
      onBackToCategories={() => navigate('/categories')}
    >
      <div className="space-y-8">
        <div className={`flex w-full max-w-4xl mx-auto items-center justify-center gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <Button
            className={`flex-1 text-lg font-semibold py-5 rounded-xl shadow-lg bg-gradient-to-r ${getCategoryGradient('liquor')} text-white hover:opacity-90 transition-all duration-200`}
            size="lg"
            onClick={handleOpenNewForm}
          >
            <Plus className="mr-2 h-6 w-6" />
            Log New Session
          </Button>

          <FilterSortDialog
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            dateRange={dateRange}
            setDateRange={setDateRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            category="liquor"
            buttonWidth="flex-1"
          />
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent size={isMobile ? 'lg' : 'md'} mobile={isMobile} className="p-0 bg-transparent border-none shadow-none">
            <SessionForm 
              category="liquor" 
              onFormClose={handleFormClose}
              onSessionAdded={handleDataChange}
              onSessionUpdated={handleDataChange}
            />
          </DialogContent>
        </Dialog>
        
        <SessionStats sessions={filteredAndSortedSessions} category="liquor" />
        
        <Insights periodSessions={filteredAndSortedSessions} category="liquor" />
        
        {/* History Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/liquor/history')}
            variant="outline"
            size="lg"
            className="text-lg font-semibold py-6 px-8 rounded-xl shadow-lg border-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-all duration-200"
          >
            📋 View Complete History
          </Button>
        </div>
      </div>
    </AppDashboard>
  );
};

export default LiquorPage;