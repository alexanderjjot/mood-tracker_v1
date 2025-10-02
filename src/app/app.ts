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
      <mat-icon class="app-logo">mood</mat-icon>
      <div class="title-group">
        <span class="app-title">Mood Tracker 📊</span>
        <span class="app-tagline">Track Your Daily Wellbeing</span>
      </div>
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
    .title-group {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      margin-left: 8px;
    }
    .app-title {
      font-size: 1.2em;
      font-weight: 500;
    }
    .app-tagline {
      font-size: 0.7em;
      opacity: 0.8;
    }
    .app-logo {
      margin-right: 4px;
      vertical-align: middle;
    }
    .spacer {
      flex: 1 1 auto;
    }
    
    .main-content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: calc(100vh - 64px);
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
