import { Routes } from '@angular/router';

import MonthlyRecapComponent from './components/tracking/monthly-recap-component/monthly-recap-component';
import { HomeComponent } from './components/home-component/home-component';
import { LoginComponent } from './components/welcome-layout/login-component/login-component';
import { RegisterComponent } from './components/welcome-layout/register-component/register-component';
import { authenticateGuard } from './guards/authenticate-guard';
import { BalanceComponent } from './balance/balance-component/balance-component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authenticateGuard] },
  { path: 'config', component: MonthlyRecapComponent, canActivate: [authenticateGuard] },
  { path: 'balance', component: BalanceComponent, canActivate: [authenticateGuard] },
  { path: '**', redirectTo: 'login' },
];
