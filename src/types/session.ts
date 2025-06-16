// /src/types/session.ts

export type SessionType = 'Joint' | 'Bong' | 'Vape' | 'Edible' | 'Other';

// **FIXED: This type now EXACTLY matches your Supabase database schema**
export interface Session {
  id: string;
  user_id: string;
  session_type: SessionType;
  quantity: number;
  participant_count: number;
  notes: string | null;
  rating: number | null;
  session_date: string;
  created_at: string;
  updated_at: string;
}