import { Component, Input, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { Mood } from '../../models/mood.interface';

interface MoodStat {
  moodLevel: number;
  emoji: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-mood-stats',
  templateUrl: './mood-stats.component.html',
  styleUrls: ['./mood-stats.component.scss'],
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoodStatsComponent implements OnChanges {
  @Input() moods: Mood[] = [];

  moodStats: MoodStat[] = [
    { moodLevel: 1, emoji: '😢', label: 'Very Bad', color: '#ef4444', count: 0, percentage: 0 },
    { moodLevel: 2, emoji: '😞', label: 'Bad', color: '#f97316', count: 0, percentage: 0 },
    { moodLevel: 3, emoji: '😐', label: 'Neutral', color: '#facc15', count: 0, percentage: 0 },
    { moodLevel: 4, emoji: '🙂', label: 'Good', color: '#4ade80', count: 0, percentage: 0 },
    { moodLevel: 5, emoji: '😊', label: 'Very Good', color: '#22c55e', count: 0, percentage: 0 }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges() {
    this.calculateStats(this.moods || []);
  }

  hasMoodData(): boolean {
    return this.moodStats.some(stat => stat.count > 0);
  }

  private calculateStats(moods: Mood[]): void {
    console.log('Calculating stats in MoodStatsComponent with moods:', moods);
    
    // Create a new array to ensure change detection works
    const newStats = this.moodStats.map(stat => ({ ...stat, count: 0, percentage: 0 }));
    
    if (moods && moods.length) {
      // Count each mood level
      moods.forEach(mood => {
        const stat = newStats.find(s => s.moodLevel === mood.moodLevel);
        if (stat) {
          stat.count++;
          console.log(`Incremented count for moodLevel ${stat.moodLevel} to ${stat.count}`);
        } else {
          console.warn(`No matching stat found for mood level ${mood.moodLevel}`);
        }
      });

      // Calculate percentages
      const total = moods.length;
      newStats.forEach(stat => {
        stat.percentage = Math.round((stat.count / total) * 100);
        console.log(`moodLevel ${stat.moodLevel}: ${stat.count}/${total} = ${stat.percentage}%`);
      });
    } else {
      console.log('No mood data to calculate stats');
    }

    // Update the reference to trigger change detection
    this.moodStats = newStats;
    this.cdr.markForCheck();
  }
}