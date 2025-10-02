import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Mood } from '../models/mood.interface';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class MoodService {
  private readonly storageService = inject(StorageService);
  
  private moodEntries = new BehaviorSubject<Mood[]>([]);
  public moodEntries$ = this.moodEntries.asObservable();

  constructor() {
    this.loadInitialData();
  }

  addEntry(entry: Omit<Mood, 'id' | 'timestamp'>): void {
    const newEntry: Mood = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    const currentEntries = [...this.moodEntries.value, newEntry];
    this.moodEntries.next(currentEntries);
    this.storageService.saveMoods(currentEntries);
  }

  getWeeklyData(): Mood[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.moodEntries.value.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= oneWeekAgo;
    });
  }
  private loadInitialData(): void {
    const saved = this.storageService.getMoods();
    this.moodEntries.next(saved);
  }

  // Get moods as a synchronous array
  getMoods(): Mood[] {
    return this.moodEntries.value;
  }

  // Get moods as an observable
  getMoods$(): Observable<Mood[]> {
    return this.moodEntries.asObservable();
  }

  deleteMood(id: string): Observable<void> {
    return new Observable(subscriber => {
      try {
        const currentEntries = this.moodEntries.value.filter(entry => entry.id !== id);
        this.moodEntries.next(currentEntries);
        this.storageService.saveMoods(currentEntries);
        subscriber.next();
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  importMoods(moods: Mood[]) {
    // Validate the imported data
    const validMoods = moods.filter(mood => 
      mood && 
      typeof mood.moodLevel === 'number' && 
      mood.timestamp && 
      !isNaN(new Date(mood.timestamp).getTime())
    );
    
    // Update the current entries with the imported data
    this.moodEntries.next(validMoods);
    this.storageService.saveMoods(validMoods);
    
    return this.moodEntries$;
  }

  deleteEntry(id: string): void {
    const updatedEntries = this.moodEntries.value.filter(entry => entry.id !== id);
    this.moodEntries.next(updatedEntries);
    this.storageService.saveMoods(updatedEntries);
    this.storageService.saveMoods(updatedEntries);
  }

  /**
   * Replace all mood entries with a new set of entries
   * @param entries New mood entries to replace existing ones
   */
  replaceAll(entries: Mood[]): void {
    // Ensure all entries have required fields and proper types
    const validatedEntries = entries.map(entry => ({
      id: entry.id || this.generateId(),
      timestamp: new Date(entry.timestamp),
      moodLevel: entry.moodLevel,
      notes: entry.notes || ''
    }));
    
    this.moodEntries.next(validatedEntries);
    this.storageService.saveMoods(validatedEntries);
  }

  private generateId(): string {
    return Date.now().toString();
  }
}