import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MoodEntryComponent } from '../../components/mood-entry/mood-entry.component';
import { MoodStatsComponent } from '../../components/mood-stats/mood-stats.component';
import { Mood } from '../../models/mood.interface';
import { MoodService } from '../../services/mood.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MoodEntryComponent,
    MoodStatsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <div class="dashboard-content">
        <div class="left-panel">
          <app-mood-entry (moodSubmit)="onMoodSubmit($event)"></app-mood-entry>
        </div>
        <div class="right-panel">
          <app-mood-stats [moods]="recentMoods()"></app-mood-stats>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .dashboard {
      padding: 1.5rem;
      width: 100%;
      min-height: 100vh;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
      max-width: 1200px;
      margin: 0;
    }

    .left-panel {
      width: 100%;
    }

    .right-panel {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Make sure mat-card takes full width */
    ::ng-deep .mat-mdc-card {
      width: 100%;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    /* Ensure proper spacing between chart items */
    ::ng-deep .stat-item {
      margin-bottom: 1rem;
    }

    @media (min-width: 768px) {
      .dashboard {
        padding: 2rem;
      }

      .dashboard-content {
        flex-direction: row;
        gap: 2rem;
      }

      .left-panel {
        flex: 0 0 400px;
        position: sticky;
        top: 2rem;
        height: fit-content;
      }

      .right-panel {
        flex: 1;
        min-width: 0;
      }
    }

    @media (min-width: 1200px) {
      .dashboard-content {
        gap: 3rem;
      }
    }
  `]
})
export class DashboardComponent {
  private readonly moodService = inject(MoodService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly recentMoods = signal<Mood[]>([]);

  constructor() {
    this.loadRecentMoods();
  }

  protected onMoodSubmit(moodData: Omit<Mood, 'id' | 'timestamp'>): void {
    console.log('Submitting mood data:', moodData);
    this.moodService.addEntry(moodData);
    // Refresh the recent moods to include the new entry
    this.loadRecentMoods();
    this.snackBar.open('Mood saved successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private loadRecentMoods(): void {
    try {
      const moods = this.moodService.getMoods();
      console.log('Loaded moods from service:', moods);
      const sortedMoods = [...moods]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 7);
      console.log('Sorted and limited moods:', sortedMoods);
      this.recentMoods.set(sortedMoods);
    } catch (error) {
      console.error('Error loading recent moods:', error);
    }
  }
}
