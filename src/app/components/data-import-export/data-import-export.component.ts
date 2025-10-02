import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataExportService } from '../../services/data-export.service';
import { MoodService } from '../../services/mood.service';
import { Mood } from '../../models/mood.interface';

@Component({
  selector: 'app-data-import-export',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card class="data-card">
      <mat-card-header>
        <mat-card-title>Data Management</mat-card-title>
        <mat-card-subtitle>Import and export your mood data</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content class="actions-container">
        <div class="action-group">
          <h3>Export Data</h3>
          <p>Download your mood data for backup or analysis</p>
          <div class="button-group">
            <button mat-raised-button color="primary" (click)="exportData('json')">
              <mat-icon>file_download</mat-icon>
              Export as JSON
            </button>
            <button mat-raised-button (click)="exportData('csv')">
              <mat-icon>file_download</mat-icon>
              Export as CSV
            </button>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="action-group">
          <h3>Import Data</h3>
          <p>Upload previously exported mood data</p>
          <div class="file-upload">
            <input 
              type="file" 
              id="file-upload" 
              (change)="importData($event)" 
              accept=".json,.csv"
              #fileInput
              hidden
            >
            <button mat-raised-button color="accent" (click)="fileInput.click()">
              <mat-icon>file_upload</mat-icon>
              Choose File
            </button>
            <span class="file-name" *ngIf="selectedFile">{{ selectedFile.name }}</span>
          </div>
          <p class="hint">Supported formats: JSON, CSV</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .data-card {
      margin: 1rem 0;
    }
    
    .actions-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .action-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .divider {
      height: 1px;
      background-color: rgba(0, 0, 0, 0.12);
      margin: 0.5rem 0;
    }
    
    .file-upload {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .file-name {
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .hint {
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.6);
      margin-top: -0.5rem;
    }
    
    button mat-icon {
      margin-right: 0.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataImportExportComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dataExportService = inject(DataExportService);
  private readonly moodService = inject(MoodService);
  
  selectedFile: File | null = null;

  exportData(format: 'json' | 'csv'): void {
    this.moodService.getMoods$().subscribe({
      next: (moods: Mood[]) => {
        if (moods.length === 0) {
          this.snackBar.open('No mood data available to export', 'Close', { duration: 3000 });
          return;
        }
        
        try {
          if (format === 'json') {
            this.dataExportService.exportToJson(moods, 'mood-export');
            this.snackBar.open('Data exported as JSON', 'Close', { duration: 3000 });
          } else {
            this.dataExportService.exportToCsv(moods, 'mood-export');
            this.snackBar.open('Data exported as CSV', 'Close', { duration: 3000 });
          }
        } catch (error) {
          this.snackBar.open('Error exporting data', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
          console.error('Export error:', error);
        }
      },
      error: (error: Error) => {
        this.snackBar.open('Error loading mood data', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.snackBar.open('No file selected', 'Close', { duration: 3000 });
      return;
    }
    
    this.selectedFile = input.files[0];
    
    if (!this.selectedFile) {
      this.snackBar.open('No valid file selected', 'Close', { duration: 3000 });
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: Expected an array of mood entries');
        }
        
        // Import the data
        this.moodService.importMoods(data);
        this.snackBar.open('Data imported successfully', 'Close', { duration: 3000 });
        this.selectedFile = null;
        
        // Reset the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
      } catch (error) {
        console.error('Error importing data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during import';
        this.snackBar.open(`Import failed: ${errorMessage}`, 'Close', { duration: 5000 });
      }
    };
    
    reader.onerror = () => {
      this.snackBar.open('Error reading file', 'Close', { duration: 3000 });
    };
    
    reader.readAsText(this.selectedFile);
  }
  
  private showMessage(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: `snackbar-${type}`,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
