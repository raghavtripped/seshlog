
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, SessionType } from '@/types/session';

export const useSessions = (userId: string | null, initialSessions?: Session[]) => {
  const [sessions, setSessions] = useState<Session[]>(initialSessions || []);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: false });

      if (error) throw error;

      const formattedSessions: Session[] = data.map(session => ({
        id: session.id,
        user_id: session.user_id,
        session_type: session.session_type as SessionType,
        quantity: Number(session.quantity),
        participant_count: session.participant_count,
        notes: session.notes,
        rating: session.rating,
        session_date: session.session_date,
        created_at: session.created_at,
        updated_at: session.updated_at
      }));

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (newSession: Omit<Session, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          session_type: newSession.session_type,
          quantity: newSession.quantity,
          participant_count: newSession.participant_count,
          notes: newSession.notes,
          rating: newSession.rating,
          session_date: newSession.session_date
        })
        .select()
        .single();

      if (error) throw error;

      const formattedSession: Session = {
        id: data.id,
        user_id: data.user_id,
        session_type: data.session_type as SessionType,
        quantity: Number(data.quantity),
        participant_count: data.participant_count,
        notes: data.notes,
        rating: data.rating,
        session_date: data.session_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setSessions(prev => [formattedSession, ...prev]);
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<Session>) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          session_type: updates.session_type,
          quantity: updates.quantity,
          participant_count: updates.participant_count,
          notes: updates.notes,
          rating: updates.rating,
          session_date: updates.session_date
        })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw error;

      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              ...updates
            }
          : session
      ));
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  return {
    sessions,
    loading,
    addSession,
    updateSession,
    deleteSession,
    refetch: fetchSessions
  };
};
