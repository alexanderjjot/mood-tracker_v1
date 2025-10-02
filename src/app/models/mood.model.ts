export interface Mood {
  id?: string;
  level: number; // 1-5 scale or similar
  timestamp: Date;
  notes?: string;
  // Add any other relevant fields based on your application's needs
}
