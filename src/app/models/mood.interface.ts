export interface Mood {
  id: string;
  moodLevel: number; // 1-5 scale
  notes?: string;
  timestamp: Date;
}
