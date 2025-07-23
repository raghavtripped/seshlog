import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { AppDashboard } from '@/components/AppDashboard';
import { SessionForm } from '@/components/SessionForm';
import { SessionList } from '@/components/SessionList';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';
import { Session, CigSessionType } from '@/types/session';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterSortDialog } from '@/components/FilterSortDialog';

// This helper is often defined in a shared utility file, but keeping it here for simplicity.
const getCategoryGradient = (category: 'cigs') => {
  return 'from-gray-500 to-slate-600';
};

const CigsHistory = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // State for filtering and sorting
  const [selectedType, setSelectedType] = useState<CigSessionType | 'All'>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState('date-desc');
  
  // State for managing the form's visibility and mode (new vs. edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>(undefined);

  const isMobile = useIsMobile();

  // Destructure the correct state names from the hook
  const { sessions, isLoading, error, fetchSessions, deleteSession } = useSessions('cigs');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // Memoized logic for filtering and sorting remains the same
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
  
  // Handlers for opening the form
  const handleOpenNewForm = () => {
    setEditingSession(undefined);
    setIsFormOpen(true);
  };
  
  const handleOpenEditForm = (session: Session) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    // A small delay gives the dialog close animation time to finish before clearing the data
    setTimeout(() => setEditingSession(undefined), 150);
  };
  
  // Unified handler for when a session is added or updated
  const handleDataChange = () => {
    // Optimistic updates in the hook handle the UI change, 
    // but a refetch ensures perfect data consistency.
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
      title="Cigarette History"
      emoji="🚬"
      category="cigs"
      onBackToCategories={() => navigate('/categories')}
    >
      <div className="space-y-8">
        {/* Back to Cigs Dashboard and Action Row */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/cigs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cigarette Dashboard
          </Button>
          
          <div className={`flex w-full max-w-4xl mx-auto items-center justify-center gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <Button
              className={`flex-1 text-lg font-semibold py-5 rounded-xl shadow-lg bg-gradient-to-r ${getCategoryGradient('cigs')} text-white hover:opacity-90 transition-all duration-200`}
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
              category="cigs"
              buttonWidth="flex-1"
            />
          </div>
        </div>

        {/* Dialog for Session Form */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent size={isMobile ? 'lg' : 'md'} mobile={isMobile} className="p-0 bg-transparent border-none shadow-none">
            <SessionForm 
              category="cigs" 
              initialSession={editingSession}
              onFormClose={handleFormClose}
              onSessionAdded={handleDataChange}
              onSessionUpdated={handleDataChange}
            />
          </DialogContent>
        </Dialog>
        
        {/* Session History List */}
        <SessionList 
          sessions={filteredAndSortedSessions} 
          category="cigs"
          onEditSession={handleOpenEditForm}
          onDeleteSession={deleteSession}
        />
      </div>
    </AppDashboard>
  );
};

export default CigsHistory; 