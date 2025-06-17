'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, SessionType, Category } from '@/types/session';
import { useAuth } from '@/hooks/useAuth';

// Database session type (what we get from Supabase)
interface DatabaseSession {
  id: string;
  user_id: string;
  category: string;
  session_type: string;
  quantity: number;
  participant_count: number;
  notes: string | null;
  rating: number | null;
  session_date: string;
  created_at: string;
  updated_at: string;
}

// Helper function to transform database response to properly typed Session
const transformDatabaseSession = (dbSession: DatabaseSession): Session => ({
  ...dbSession,
  category: dbSession.category as Category,
  session_type: dbSession.session_type as SessionType,
});

export const useSessions = (category: Category) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .order('session_date', { ascending: false });

      if (error) {
        throw error;
      }
      setSessions((data || []).map(transformDatabaseSession));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [user, category]);

  const addSession = async (newSessionData: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'category'>) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ 
          ...newSessionData, 
          user_id: user.id,
          category: category
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      if (data) {
        setSessions(prevSessions => [transformDatabaseSession(data), ...prevSessions]);
      }
    } catch (error) {
      console.error('Error adding session:', error);
      setError(error instanceof Error ? error.message : 'Failed to add session');
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (sessionId: string, updatedData: Partial<Omit<Session, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'category'>>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(updatedData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      if (data) {
        setSessions(prevSessions =>
          prevSessions.map(s => (s.id === sessionId ? transformDatabaseSession(data) : s))
        );
      }
    } catch (error) {
      console.error('Error updating session:', error);
      setError(error instanceof Error ? error.message : 'Failed to update session');
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw error;
      }
      setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, addSession, updateSession, deleteSession, fetchSessions };
};