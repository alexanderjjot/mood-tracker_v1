import { ChangeDetectionStrategy, Component, input, computed, effect } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Mood } from '../../models/mood.interface';

interface MoodStat {
  level: number;
  label: string;
  emoji: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-mood-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatCardModule, MatIconModule],
  template: `
    <mat-card class="stats-card">
      <mat-card-header>
        <mat-card-title>Mood Statistics</mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        @if (moods().length === 0) {
          <div class="no-data">
            <mat-icon>sentiment_dissatisfied</mat-icon>
            <p>No mood data available</p>
          </div>
        }
        
        @if (moods().length > 0) {
          <div class="stats-container">
            @for (stat of moodStats(); track stat.level) {
              <div class="stat-item">
                <span class="emoji">{{ stat.emoji }}</span>
                <div class="progress-container">
                  <div class="progress-bar" [style.width.%]="stat.percentage"></div>
                </div>
                <span class="count">{{ stat.count }} ({{ stat.percentage }}%)</span>
              </div>
            }
            
            <div class="summary">
              <div class="summary-item">
                <mat-icon>calendar_today</mat-icon>
                <span>Last 7 days: {{ moods().length }} entries</span>
              </div>
              <div class="summary-item">
                <mat-icon>trending_up</mat-icon>
                <span>Average: {{ averageMood() | number:'1.1-1' }}/5</span>
              </div>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stats-card {
      margin-bottom: 1rem;
    }
    
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      color: rgba(0, 0, 0, 0.54);
      
      mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
      }
      
      p {
        margin: 0;
        font-size: 1.1rem;
      }
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      margin: 0.5rem 0;
      
      .emoji {
        font-size: 1.5rem;
        width: 2rem;
        text-align: center;
      }
      
      .progress-container {
        flex: 1;
        height: 1.5rem;
        background-color: #f0f0f0;
        border-radius: 0.75rem;
        margin: 0 1rem;
        overflow: hidden;
      }
      
      .progress-bar {
        height: 100%;
        background-color: #3f51b5;
        border-radius: 0.75rem;
        transition: width 0.5s ease-in-out;
      }
      
      .count {
        width: 5rem;
        text-align: right;
        font-size: 0.9rem;
        color: rgba(0, 0, 0, 0.6);
      }
    }
    
    .summary {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      
      .summary-item {
        display: flex;
        align-items: center;
        margin: 0.5rem 0;
        
        mat-icon {
          margin-right: 0.5rem;
          color: #3f51b5;
        }
      }
    }
  `]
})
export class MoodStatsComponent {
  readonly moods = input<Mood[]>([]);
  
  private readonly moodLabels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'];
  private readonly moodEmojis = ['😢', '🙁', '😐', '🙂', '😊'];
  
  protected readonly moodStats = computed<MoodStat[]>(() => {
    const moodsValue = this.moods();
    if (moodsValue.length === 0) {
      return [];
    }
    
    const counts = [0, 0, 0, 0, 0];
    
    moodsValue.forEach(mood => {
      if (mood.moodLevel >= 1 && mood.moodLevel <= 5) {
        counts[mood.moodLevel - 1]++;
      }
    });
    
    return counts.map((count, index) => ({
      level: index + 1,
      label: this.moodLabels[index],
      emoji: this.moodEmojis[index],
      count,
      percentage: Math.round((count / moodsValue.length) * 100) || 0
    }));
  });
  
  protected readonly averageMood = computed<number>(() => {
    const moodsValue = this.moods();
    if (moodsValue.length === 0) {
      return 0;
    }
    
    const totalMood = moodsValue.reduce((sum, mood) => {
      if (mood.moodLevel >= 1 && mood.moodLevel <= 5) {
        return sum + mood.moodLevel;
      }
      return sum;
    }, 0);
    
    return totalMood / moodsValue.length;
  });
}