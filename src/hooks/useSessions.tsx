'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@/types/session';

export const useSessions = (userId: string | null, initialSessions: Session[] = []) => {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [loading, setLoading] = useState(false);

  // **FIXED: Removed 'supabase' from dependency array to satisfy ESLint**
  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: false });

      if (error) {
        throw error;
      }
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addSession = async (newSessionData: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ ...newSessionData, user_id: userId })
        .select()
        .single();

      if (error) {
        throw error;
      }
      if (data) {
        setSessions(prevSessions => [data, ...prevSessions]);
      }
    } catch (error) {
      console.error('Error adding session:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (sessionId: string, updatedData: Partial<Omit<Session, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    setLoading(true);
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
          prevSessions.map(s => (s.id === sessionId ? data : s))
        );
      }
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  return { sessions, loading, addSession, updateSession, deleteSession, fetchSessions };
};