import { Injectable } from '@angular/core';
import { Mood } from '../models/mood.interface';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly STORAGE_KEY = 'mood-tracker-data';

  saveMoods(entries: Mood[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving moods to storage:', error);
    }
  }

  getMoods(): Mood[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      // Ensure timestamps are properly converted back to Date objects
      return parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch (error) {
      console.error('Error loading moods from storage:', error);
      return [];
    }
  }
}