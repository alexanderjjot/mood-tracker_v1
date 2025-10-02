import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HistoryComponent } from './pages/history/history.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    title: 'Dashboard - Mood Tracker'
  },
  { 
    path: 'history', 
    component: HistoryComponent,
    title: 'History - Mood Tracker'
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];
