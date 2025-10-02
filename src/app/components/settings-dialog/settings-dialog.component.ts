import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DataImportExportComponent } from '../data-import-export/data-import-export.component';

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    DataImportExportComponent
  ],
  template: `
    <h2 mat-dialog-title>Settings</h2>
    <mat-dialog-content>
      <mat-tab-group>
        <mat-tab label="Data Management">
          <app-data-import-export></app-data-import-export>
        </mat-tab>
        <!-- Add more tabs for other settings here -->
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
      min-width: 500px;
    }
    
    .mat-mdc-tab-body-wrapper {
      padding: 16px 0;
    }
  `]
})
export class SettingsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
