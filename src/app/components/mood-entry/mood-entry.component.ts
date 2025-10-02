import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Mood } from '../../models/mood.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mood-entry',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>How are you feeling today?</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="moodForm" (ngSubmit)="onSubmit()">
          <div class="mood-buttons">
            @for (level of moodLevels; track level) {
              <button
                type="button"
                mat-fab
                [color]="moodForm.get('moodLevel')?.value === level ? 'primary' : 'accent'"
                [class]="'mood-button mood-level-' + level"
                (click)="selectMoodLevel(level)"
                [matTooltip]="getMoodLabel(level)"
                matTooltipPosition="above"
              >
                <span class="mood-emoji">{{ getMoodEmoji(level) }}</span>
              </button>
            }
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes (optional)</mat-label>
            <textarea
              matInput
              formControlName="notes"
              placeholder="Add any notes about your mood..."
              rows="3"
            ></textarea>
          </mat-form-field>

          <div class="actions">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!moodForm.get('moodLevel')?.value"
            >
              Save Mood
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .mood-buttons {
      display: flex;
      justify-content: space-around;
      margin: 1.5rem 0;
    }

    .mood-button {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 80px;
      height: 80px;
      border-radius: 50%;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .mood-emoji {
      font-size: 2rem;
      line-height: 1;
      z-index: 2;
      position: relative;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .mood-buttons button:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .mood-buttons button[color="primary"] {
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    /* Mood level background colors */
    .mood-level-1 {
      background-color: #e74c3c !important;
      color: white !important;
    }
    .mood-level-2 {
      background-color: #e67e22 !important;
      color: white !important;
    }
    .mood-level-3 {
      background-color: #f1c40f !important;
      color: #333 !important;
    }
    .mood-level-4 {
      background-color: #2ecc71 !important;
      color: white !important;
    }
    .mood-level-5 {
      background-color: #27ae60 !important;
      color: white !important;
    }

    .full-width {
      width: 100%;
      margin: 1rem 0;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .actions button {
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoodEntryComponent {
  protected readonly moodSubmit = output<Omit<Mood, 'id' | 'timestamp'>>();

  protected readonly moodForm: FormGroup;
  protected readonly moodLevels = [1, 2, 3, 4, 5];

  constructor(private fb: FormBuilder) {
    this.moodForm = this.fb.group({
      moodLevel: [null],
      notes: ['']
    });
  }

  protected selectMoodLevel(level: number): void {
    this.moodForm.patchValue({ moodLevel: level });
  }

  protected onSubmit(): void {
    if (this.moodForm.valid && this.moodForm.value.moodLevel !== null) {
      this.moodSubmit.emit({
        moodLevel: this.moodForm.value.moodLevel,
        notes: this.moodForm.value.notes?.trim() || ''
      });

      // Reset form
      this.moodForm.reset();
    }
  }
  
  getMoodEmoji(level: number): string {
    const emojis = ['😢', '😞', '😐', '🙂', '😊'];
    return emojis[level - 1] || '';
  }
  
  getMoodLabel(level: number): string {
    const labels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'];
    return labels[level - 1] || '';
  }
}
