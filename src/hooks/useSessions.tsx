
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@/types/session';

export const useSessions = (userId: string | null) => {
  const [sessions, setSessions] = useState<Session[]>([]);
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
        sessionType: session.session_type as any,
        quantity: Number(session.quantity),
        participantCount: session.participant_count,
        notes: session.notes,
        rating: session.rating,
        sessionDate: session.session_date,
        createdAt: session.created_at,
        individualConsumption: Number(session.quantity) / session.participant_count
      }));

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (newSession: Omit<Session, 'id' | 'createdAt'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          session_type: newSession.sessionType,
          quantity: newSession.quantity,
          participant_count: newSession.participantCount,
          notes: newSession.notes,
          rating: newSession.rating,
          session_date: newSession.sessionDate
        })
        .select()
        .single();

      if (error) throw error;

      const formattedSession: Session = {
        id: data.id,
        sessionType: data.session_type as any,
        quantity: Number(data.quantity),
        participantCount: data.participant_count,
        notes: data.notes,
        rating: data.rating,
        sessionDate: data.session_date,
        createdAt: data.created_at,
        individualConsumption: Number(data.quantity) / data.participant_count
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
          session_type: updates.sessionType,
          quantity: updates.quantity,
          participant_count: updates.participantCount,
          notes: updates.notes,
          rating: updates.rating,
          session_date: updates.sessionDate
        })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw error;

      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              ...updates, 
              individualConsumption: updates.quantity && updates.participantCount 
                ? updates.quantity / updates.participantCount 
                : session.individualConsumption 
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
