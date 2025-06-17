import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { AppDashboard } from '@/components/AppDashboard';
import { SessionForm } from '@/components/SessionForm';
import { SessionList } from '@/components/SessionList';
import { SessionStats } from '@/components/SessionStats';
import { FilterControls } from '@/components/FilterControls';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';
import { CigSessionType } from '@/types/session';

const Cigs = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<CigSessionType | 'All'>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState('date-desc');

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex items-center justify-center">
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
        {/* Stats Section */}
        <SessionStats sessions={filteredAndSortedSessions} category="cigs" />
        
        {/* Add New Session */}
        <SessionForm category="cigs" />
        
        {/* Filter Controls */}
        <FilterControls
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          dateRange={dateRange}
          setDateRange={setDateRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          category="cigs"
        />
        
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