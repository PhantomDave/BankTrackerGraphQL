import { Routes } from '@angular/router';

import { HomeComponent } from './components/home-component/home-component';
import { LoginComponent } from './components/welcome-layout/login-component/login-component';
import { RegisterComponent } from './components/welcome-layout/register-component/register-component';
import { authenticateGuard } from './guards/authenticate-guard';
import { BalanceComponent } from './balance/balance-component/balance-component';
import { SettingsComponent } from './components/settings-component/settings-component';
import { ImportWizardComponent } from './components/import/import-wizard-component/import-wizard-component';
import { MonthlyComparisonComponent } from './components/analytics/monthly-comparison-component/monthly-comparison-component';
import { TrackingComponent } from './components/tracking/tracking/tracking.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authenticateGuard] },
  { path: 'movements', component: TrackingComponent, canActivate: [authenticateGuard] },
  { path: 'balance', component: BalanceComponent, canActivate: [authenticateGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authenticateGuard] },
  { path: 'import', component: ImportWizardComponent, canActivate: [authenticateGuard] },
  {
    path: 'analytics/monthly-comparison',
    component: MonthlyComparisonComponent,
    canActivate: [authenticateGuard],
  },
  { path: '**', redirectTo: 'login' },
];
