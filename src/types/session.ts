// /src/types/session.ts

// Category types
export type Category = 'weed' | 'cigs' | 'vapes' | 'liquor';

// Weed session types
export type WeedSessionType = 'Joint' | 'Bong' | 'Vape' | 'Edible' | 'Other';

// Cigarette session types
export type CigSessionType = 'Regular' | 'Light' | 'Menthol' | 'E-Cigarette' | 'Other';

// Vape session types
export type VapeSessionType = 'Disposable' | 'Pod' | 'Mod' | 'Pen' | 'Other';

// Liquor session types
export type LiquorSessionType = 'Beer' | 'Wine' | 'Spirits' | 'Cocktail' | 'Other';

// Liquor serving sizes in ml
export type LiquorServingSize = 
  | '30ml (Shot)'
  | '60ml (Double Shot)'
  | '150ml (Wine Glass)'
  | '250ml (Large Wine)'
  | '330ml (Beer Bottle)'
  | '500ml (Pint)'
  | '750ml (Wine Bottle)'
  | '1000ml (Large Bottle)'
  | 'Custom';

// Combined session type for backward compatibility
export type SessionType = WeedSessionType | CigSessionType | VapeSessionType | LiquorSessionType;

// **FIXED: This type now EXACTLY matches your Supabase database schema**
export interface Session {
  id: string;
  user_id: string;
  category: Category;
  session_type: SessionType;
  quantity: number;
  participant_count: number;
  notes: string | null;
  rating: number | null;
  session_date: string;
  created_at: string;
  updated_at: string;
  liquor_serving_size?: LiquorServingSize;
}

// Category-specific session interfaces for type safety
export interface WeedSession extends Omit<Session, 'session_type' | 'category'> {
  category: 'weed';
  session_type: WeedSessionType;
}

export interface CigSession extends Omit<Session, 'session_type' | 'category'> {
  category: 'cigs';
  session_type: CigSessionType;
}

export interface VapeSession extends Omit<Session, 'session_type' | 'category'> {
  category: 'vapes';
  session_type: VapeSessionType;
}

export interface LiquorSession extends Omit<Session, 'session_type' | 'category'> {
  category: 'liquor';
  session_type: LiquorSessionType;
}