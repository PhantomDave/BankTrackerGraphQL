import { Routes } from '@angular/router';

import { LoginComponent } from './components/welcome-layout/login-component/login-component';
import { RegisterComponent } from './components/welcome-layout/register-component/register-component';
import { authenticateGuard } from './guards/authenticate-guard';
import { BalanceComponent } from './balance/balance-component/balance-component';
import { SettingsComponent } from './components/settings-component/settings-component';
import { ImportWizardComponent } from './components/import/import-wizard-component/import-wizard-component';
import { MonthlyComparisonComponent } from './components/analytics/monthly-comparison-component/monthly-comparison-component';
import { TrackingComponent } from './components/tracking/tracking/tracking.component';
import { DashboardComponent } from './components/dashboard-component/dashboard-component.component';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { MovementsLayoutComponent } from './layouts/movements-layout/movements-layout.component';
import { AnalyticsLayoutComponent } from './layouts/analytics-layout/analytics-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { breadcrumb: 'Login' } },
  { path: 'register', component: RegisterComponent, data: { breadcrumb: 'Register' } },
  {
    path: 'home',
    component: HomeLayoutComponent,
    canActivate: [authenticateGuard],
    data: { breadcrumb: 'Home' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, data: { breadcrumb: 'Dashboard' } },
      { path: 'balance', component: BalanceComponent, data: { breadcrumb: 'Balance' } },
    ],
  },
  {
    path: 'movements',
    component: MovementsLayoutComponent,
    canActivate: [authenticateGuard],
    data: { breadcrumb: 'Movements' },
    children: [
      { path: '', redirectTo: 'tracking', pathMatch: 'full' },
      { path: 'tracking', component: TrackingComponent, data: { breadcrumb: 'Tracking' } },
      { path: 'import', component: ImportWizardComponent, data: { breadcrumb: 'Import' } },
    ],
  },
  {
    path: 'analytics',
    component: AnalyticsLayoutComponent,
    canActivate: [authenticateGuard],
    data: { breadcrumb: 'Analytics' },
    children: [
      { path: '', redirectTo: 'monthly-comparison', pathMatch: 'full' },
      {
        path: 'monthly-comparison',
        component: MonthlyComparisonComponent,
        data: { breadcrumb: 'Monthly Comparison' },
      },
    ],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authenticateGuard],
    data: { breadcrumb: 'Settings' },
  },
  { path: '**', redirectTo: 'login' },
];
