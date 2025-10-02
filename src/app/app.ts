import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, 
    RouterModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Mood Tracker 📊</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/dashboard" routerLinkActive="active">
        <mat-icon>dashboard</mat-icon>
        Dashboard
      </button>
      <button mat-button routerLink="/history" routerLinkActive="active">
        <mat-icon>history</mat-icon>
        History
      </button>
      <button mat-button (click)="openSettings()">
        <mat-icon>settings</mat-icon>
        Settings
      </button>
    </mat-toolbar>
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    .main-content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }
    
    button {
      margin-right: 8px;
    }
    
    button.active {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class App {
  constructor(private dialog: MatDialog) {}

  openSettings() {
    this.dialog.open(SettingsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }
}
