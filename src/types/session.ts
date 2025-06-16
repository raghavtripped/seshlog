
export type SessionType = 'Joint' | 'Bong' | 'Vape' | 'Edible' | 'Other';

export interface Session {
  id: string;
  sessionType: SessionType;
  participantCount: number;
  notes?: string;
  rating?: number; // 1-5 stars
  createdAt: string;
}
