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
  templateUrl: './mood-entry.component.html',
  styleUrls: ['./mood-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoodEntryComponent {
  protected readonly moodSubmit = output<Omit<Mood, 'id' | 'timestamp'>>();
  protected readonly moodLevels = [1, 2, 3, 4, 5];
  
  protected readonly moodForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.moodForm = this.fb.group({
      moodLevel: [null, Validators.required],
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
  
  getMoodColor(level: number): string {
    const colors = ['#ef4444', '#f97316', '#facc15', '#4ade80', '#22c55e'];
    return colors[level - 1] || '#e5e7eb';
  }
}
