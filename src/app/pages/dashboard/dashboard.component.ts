import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MoodEntryComponent } from '../../components/mood-entry/mood-entry.component';
import { MoodStatsComponent } from '../../components/mood-stats/mood-stats.component';
import { MoodChartComponent } from '../../components/mood-chart/mood-chart.component';
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
    MoodStatsComponent,
    MoodChartComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <div class="row">
        <div class="col-12 col-md-6">
          <app-mood-entry (moodSubmit)="onMoodSubmit($event)"></app-mood-entry>
        </div>
        <div class="col-12 col-md-6">
          <app-mood-stats [moods]="recentMoods()" />
          <app-mood-chart [moods]="recentMoods()" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 1rem;
      width: 100%;
      height: 100%;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -0.5rem;
    }

    .col-12 {
      width: 100%;
      padding: 0.5rem;
    }

    @media (min-width: 768px) {
      .col-md-6 {
        width: 50%;
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
    this.moodService.addEntry(moodData);
    this.snackBar.open('Mood saved successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private loadRecentMoods(): void {
    try {
      const moods = this.moodService.getMoods();
      const sortedMoods = [...moods]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 7);
      this.recentMoods.set(sortedMoods);
    } catch (error) {
      console.error('Error loading recent moods:', error);
    }
  }
}
