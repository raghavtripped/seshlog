// /src/hooks/useSessions.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, Category, SessionType, LiquorServingSize } from '@/types/session';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

// Use auto-generated types for database interactions
type SessionRow = Database['public']['Tables']['sessions']['Row'];
type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
type SessionUpdate = Database['public']['Tables']['sessions']['Update'];

/**
 * Transforms a raw database row into the strongly-typed application-level Session.
 */
const fromDatabase = (dbSession: SessionRow): Session => {
  return {
    ...dbSession,
    category: dbSession.category as Category,
    session_type: dbSession.session_type as SessionType,
    liquor_serving_size: dbSession.liquor_serving_size as LiquorServingSize | undefined,
  };
};

export const useSessions = (category: Category) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .order('session_date', { ascending: false })
        .limit(10000);

      if (dbError) throw dbError;
      setSessions(data.map(fromDatabase));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      console.error('Error fetching sessions:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, category]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  const addSession = async (newSessionData: SessionInsert) => {
    if (!user) throw new Error("User not authenticated.");

    setIsSubmitting(true);
    setError(null);
    
    const tempId = `temp-${Date.now()}`;
    const optimisticSession: Session = {
      id: tempId,
      user_id: user.id,
      category: category,
      session_type: newSessionData.session_type as SessionType,
      quantity: newSessionData.quantity || 0,
      participant_count: newSessionData.participant_count || 1,
      notes: newSessionData.notes || null,
      rating: newSessionData.rating || null,
      liquor_serving_size: (newSessionData.liquor_serving_size as LiquorServingSize) || undefined,
      session_date: newSessionData.session_date ? new Date(newSessionData.session_date).toISOString() : new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSessions(prev => [optimisticSession, ...prev]);

    try {
      const submissionData: SessionInsert = {
        ...newSessionData,
        user_id: user.id,
        category,
        session_date: newSessionData.session_date ? new Date(newSessionData.session_date).toISOString() : new Date().toISOString(),
      };

      const { data, error: dbError } = await supabase
        .from('sessions')
        .insert(submissionData)
        .select()
        .single();

      if (dbError) throw dbError;

      setSessions(prev => prev.map(s => (s.id === tempId ? fromDatabase(data) : s)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add session';
      console.error('Error adding session:', errorMessage);
      setSessions(prev => prev.filter(s => s.id !== tempId)); // Revert optimistic update
      setError(errorMessage);
      // FIX: Re-throw the error to be caught by the calling component (SessionForm)
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSession = async (sessionId: string, updatedData: SessionUpdate) => {
    setIsSubmitting(true);
    setError(null);

    const originalSession = sessions.find(s => s.id === sessionId);
    if (!originalSession) {
      setIsSubmitting(false);
      throw new Error("Session to update not found.");
    }
    
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, ...updatedData } as Session : s))
    );

    try {
      const submissionData = { ...updatedData };
      if (updatedData.session_date) {
        submissionData.session_date = new Date(updatedData.session_date).toISOString();
      }
      
      const { data, error: dbError } = await supabase
        .from('sessions')
        .update(submissionData)
        .eq('id', sessionId)
        .select()
        .single();
        
      if (dbError) throw dbError;

      setSessions(prev => prev.map(s => (s.id === sessionId ? fromDatabase(data) : s)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      console.error('Error updating session:', errorMessage);
      setSessions(prev => prev.map(s => (s.id === sessionId ? originalSession : s))); // Revert optimistic update
      setError(errorMessage);
      // FIX: Re-throw the error to be caught by the calling component (SessionForm)
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    setIsSubmitting(true);
    setError(null);
    
    const originalSessions = [...sessions];
    setSessions(prev => prev.filter(s => s.id !== sessionId));

    try {
      const { error: dbError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
        
      if (dbError) throw dbError;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      console.error('Error deleting session:', errorMessage);
      setSessions(originalSessions); // Revert optimistic update
      setError(errorMessage);
      // FIX: Re-throw the error to be caught by the calling component
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    sessions, 
    isLoading,
    isSubmitting,
    error, 
    addSession, 
    updateSession, 
    deleteSession, 
    fetchSessions 
  };
};