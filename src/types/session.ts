
export type SessionType = 'Joint' | 'Bong' | 'Vape' | 'Edible' | 'Other';

export interface Session {
  id: string;
  sessionType: SessionType;
  quantity: number;
  participantCount: number;
  notes?: string;
  rating?: number; // 1-5 stars
  sessionDate: string; // ISO date string
  createdAt: string;
}
