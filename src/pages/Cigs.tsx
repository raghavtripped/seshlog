import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { AppDashboard } from '@/components/AppDashboard';
import { SessionForm } from '@/components/SessionForm';
import { SessionList } from '@/components/SessionList';
import { SessionStats } from '@/components/SessionStats';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';
import { CigSessionType } from '@/types/session';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterSortDialog } from '@/components/FilterSortDialog';

const Cigs = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<CigSessionType | 'All'>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState('date-desc');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const isMobile = useIsMobile();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const { sessions, loading, error } = useSessions('cigs');

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions;

    // Filter by type
    if (selectedType !== 'All') {
      filtered = filtered.filter(session => session.session_type === selectedType);
    }

    // Filter by date range
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

    // Sort sessions
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.session_date).getTime() - new Date(b.session_date).getTime();
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating-asc':
          return (a.rating || 0) - (b.rating || 0);
        case 'individual-desc':
          return (b.quantity / b.participant_count) - (a.quantity / a.participant_count);
        case 'individual-asc':
          return (a.quantity / a.participant_count) - (b.quantity / b.participant_count);
        case 'type':
          return a.session_type.localeCompare(b.session_type);
        default: // 'date-desc'
          return new Date(b.session_date).getTime() - new Date(a.session_date).getTime();
      }
    });

    return sorted;
  }, [sessions, selectedType, dateRange, sortBy]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-900 dark:via-slate-900/20 dark:to-zinc-900/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="brand-logo mx-auto float">
            <span className="brand-emoji">🚬</span>
          </div>
          <h1 className="heading-lg text-gray-800 dark:text-gray-200">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <AppDashboard 
      title="Cigarette Tracker"
      emoji="🚬"
      category="cigs"
      onBackToCategories={() => navigate('/categories')}
    >
      <div className="space-y-8">
        {/* Top Action Row */}
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-6'} items-center justify-center w-full max-w-4xl mx-auto`}>
          <Dialog open={showSessionForm} onOpenChange={setShowSessionForm}>
            <DialogTrigger asChild>
              <Button
                className="flex-1 text-lg font-semibold py-5 rounded-xl shadow-lg bg-gradient-to-r from-gray-500 to-slate-600 text-white hover:opacity-90 transition-all duration-200"
                size={isMobile ? 'lg' : 'lg'}
                style={{ minWidth: 0 }}
                onClick={() => setShowSessionForm(true)}
              >
                <Plus className="w-6 h-6" />
                Log New Session
              </Button>
            </DialogTrigger>
            <DialogContent size={isMobile ? 'lg' : 'md'} mobile={isMobile} className="p-0 bg-transparent border-none shadow-none">
              <div className="bg-background rounded-lg p-4 sm:p-8 max-h-[80vh] overflow-y-auto">
                <SessionForm category="cigs" />
              </div>
            </DialogContent>
          </Dialog>
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
        {/* Stats Section */}
        <SessionStats sessions={filteredAndSortedSessions} category="cigs" />
        {/* Sessions List */}
        <SessionList 
          sessions={filteredAndSortedSessions} 
          loading={loading} 
          error={error}
          category="cigs"
        />
      </div>
    </AppDashboard>
  );
};

export default Cigs; 