import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Mood } from '../../models/mood.interface';
import { MoodService } from '../../services/mood.service';

@Component({
  selector: 'app-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Mood History</mat-card-title>
        <button mat-icon-button (click)="clearFilters()" matTooltip="Clear all filters">
          <mat-icon>filter_alt_off</mat-icon>
        </button>
      </mat-card-header>
      
      <mat-card-content>
        <div class="filter-container">
          <mat-form-field appearance="outline">
            <mat-label>Search Notes</mat-label>
            <input matInput placeholder="Search in notes..." [formControl]="searchControl">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mood Level</mat-label>
            <mat-select [formControl]="moodLevelFilter" multiple>
              @for (level of moodLevels; track level) {
                <mat-option [value]="level">
                  {{ getMoodLabel(level) }} ({{ getMoodEmoji(level) }})
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" [formControl]="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" [formControl]="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        @if (filteredMoods().length > 0) {
          <div class="table-container">
            <table mat-table [dataSource]="filteredMoods()" matSort (matSortChange)="sortData($event)" class="mat-elevation-z1">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let mood">
                  <div class="date-cell">
                    <div class="date">{{ mood.timestamp | date:'mediumDate' }}</div>
                    <div class="time">{{ mood.timestamp | date:'shortTime' }}</div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="mood">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Mood</th>
                <td mat-cell *matCellDef="let mood">
                  <div class="mood-cell" [class]="'mood-level-' + mood.moodLevel">
                    <div class="mood-indicator"></div>
                    <span class="emoji">
                      {{ getMoodEmoji(mood.moodLevel) }}
                    </span>
                    <span class="mood-label">{{ getMoodLabel(mood.moodLevel) }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="notes">
                <th mat-header-cell *matHeaderCellDef>Notes</th>
                <td mat-cell *matCellDef="let mood">
                  <div class="notes-cell" [matTooltip]="mood.notes || 'No notes'" matTooltipPosition="above">
                    {{ mood.notes || '-' }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let mood">
                  <button mat-icon-button color="warn" (click)="deleteEntry(mood.id)" matTooltip="Delete entry">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns();"></tr>
            </table>
          </div>
        }

        @if (filteredMoods().length === 0) {
          <div class="no-data-message">
            <mat-icon>sentiment_dissatisfied</mat-icon>
            <p>No mood entries found matching your filters.</p>
            <button mat-raised-button color="primary" (click)="clearFilters()">
              Clear Filters
            </button>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .filter-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
      
      mat-form-field {
        min-width: 200px;
      }
      
      mat-form-field {
        width: 100%;
      }

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .table-container {
      overflow-x: auto;
      border-radius: 4px;
    }

    table {
      width: 100%;
    }

    .date-cell {
      display: flex;
      flex-direction: column;
      
      .date {
        font-weight: 500;
      }
      
      .time {
        font-size: 0.8em;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .mood-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .emoji {
        font-size: 1.5em;
        line-height: 1;
        position: relative;
      }

      .mood-label {
        font-weight: 500;
      }

      // Color indicators for mood levels
      .mood-indicator {
        width: 4px;
        height: 20px;
        border-radius: 2px;
        margin-right: 0.25rem;
      }
    }

    // Apply colors to mood indicators instead of emojis
    .mood-level-1 .mood-indicator { background-color: #e74c3c; }
    .mood-level-2 .mood-indicator { background-color: #e67e22; }
    .mood-level-3 .mood-indicator { background-color: #f1c40f; }
    .mood-level-4 .mood-indicator { background-color: #2ecc71; }
    .mood-level-5 .mood-indicator { background-color: #27ae60; }

    .notes-cell {
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
      
      mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
        color: #9e9e9e;
      }
      
      p {
        margin: 0 0 1rem;
        font-size: 1.1rem;
      }
    }

    .mood-level-1 { color: #e74c3c; } /* Red for sad - DEPRECATED: now using mood-indicator */
    .mood-level-2 { color: #e67e22; } /* Orange - DEPRECATED: now using mood-indicator */
    .mood-level-3 { color: #f1c40f; } /* Yellow for neutral - DEPRECATED: now using mood-indicator */
    .mood-level-4 { color: #2ecc71; } /* Green - DEPRECATED: now using mood-indicator */
    .mood-level-5 { color: #27ae60; } /* Dark green for happy - DEPRECATED: now using mood-indicator */
  `]
})
export class HistoryComponent {
  private readonly moodService = inject(MoodService);

  protected readonly displayedColumns = signal<string[]>(['date', 'mood', 'notes', 'actions']);
  protected readonly moods = signal<Mood[]>([]);
  protected readonly moodLevels = [1, 2, 3, 4, 5];

  // Form controls
  protected readonly searchControl = new FormControl('')
  protected readonly moodLevelFilter = new FormControl<number[]>([])
  protected readonly startDate = new FormControl<Date | null>(null)
  protected readonly endDate = new FormControl<Date | null>(null)
  private sortState: Sort = { active: 'date', direction: 'desc' }

  // Signal to trigger computed updates when form controls change
  private readonly filterTrigger = signal(0);

  // Initialize moods when component is created
  constructor() {
    // Set up reactive updates when form controls change
    this.searchControl.valueChanges.subscribe(() => {
      this.filterTrigger.update((value: number) => value + 1);
    });

    this.moodLevelFilter.valueChanges.subscribe(() => {
      this.filterTrigger.update((value: number) => value + 1);
    });

    this.startDate.valueChanges.subscribe(() => {
      this.filterTrigger.update((value: number) => value + 1);
    });

    this.endDate.valueChanges.subscribe(() => {
      this.filterTrigger.update((value: number) => value + 1);
    });

    // Load initial moods
    this.moods.set(this.moodService.getMoods());
  }

  // Computed property for filtered moods
  protected readonly filteredMoods = computed<Mood[]>(() => {
    // Depend on filterTrigger to re-evaluate when form controls change
    this.filterTrigger();

    const moods = this.moods();
    if (!moods?.length) return [];

    const searchTerm = this.searchControl.value?.toLowerCase().trim() || '';
    const selectedLevels = this.moodLevelFilter.value || [];
    const startDate = this.startDate.value ? new Date(this.startDate.value) : null;
    const endDate = this.endDate.value ? new Date(this.endDate.value) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    return moods.filter((mood: Mood) => {
      // Search in notes if search term exists
      if (searchTerm && !mood.notes?.toLowerCase().includes(searchTerm)) {
        return false;
      }

      // Filter by mood level if any levels are selected
      if (selectedLevels.length > 0 && !selectedLevels.includes(mood.moodLevel)) {
        return false;
      }

      // Filter by date range
      if (mood.timestamp) {
        const moodDate = new Date(mood.timestamp);

        if (startDate && moodDate < startDate) return false;
        if (endDate && moodDate > endDate) return false;
      }

      return true;
    }).sort((a, b) => {
        const { active, direction } = this.sortState;
        if (!active || !direction) return 0;

        const isAsc = direction === 'asc';
        switch (active) {
          case 'date':
            return this.compare(
              new Date(a.timestamp).getTime(),
              new Date(b.timestamp).getTime(),
              isAsc
            );
          case 'mood':
            return this.compare(a.moodLevel, b.moodLevel, isAsc);
          default:
            return 0;
        }
      });
});

  protected clearFilters(): void {
    this.searchControl.reset();
    this.moodLevelFilter.reset();
    this.startDate.reset();
    this.endDate.reset();
  }

  protected getMoodLabel(level: number): string {
    const labels: { [key: number]: string } = {
      1: 'Very Bad',
      2: 'Bad',
      3: 'Neutral',
      4: 'Good',
      5: 'Very Good'
    };
    return labels[level] || 'Unknown';
  }

  protected getMoodEmoji(level: number): string {
    const emojis: { [key: number]: string } = {
      1: '😡',  // Very Bad
      2: '😔',  // Bad
      3: '😐',  // Neutral
      4: '🙂',  // Good
      5: '😊'   // Very Good
    };
    return emojis[level] || '❓'; // Default to question mark for unknown levels
  }

  ngOnInit(): void {
    this.moods.set(this.moodService.getMoods());
  }

  protected compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  protected sortData(sort: Sort): void {
    this.sortState = sort;
    // Trigger recomputation of filtered moods
    this.filterTrigger.update((value: number) => value + 1);
  }

  protected deleteEntry(id: string): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this mood entry?')) {
      this.moodService.deleteMood(id)
        .subscribe({
          next: () => {
            // The mood was deleted successfully
            // The MoodService will update the entries, so we just need to reload
            this.moods.set(this.moodService.getMoods());
            // Optional: Show a success message
            // this.snackBar.open('Mood entry deleted', 'Close', { duration: 3000 });
          },
          error: (error: Error) => {
            console.error('Error deleting mood entry:', error);
            // Optional: Show an error message
            // this.snackBar.open('Error deleting mood entry', 'Close', { duration: 3000 });
          }
        });
    }
  }
}