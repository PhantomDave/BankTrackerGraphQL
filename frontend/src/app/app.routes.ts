import { Routes } from '@angular/router';
import {LoginComponent} from '../components/welcome-layout/login-component/login-component';
import {RegisterComponent} from '../components/welcome-layout/register-component/register-component';
import {HomeComponent} from '../components/home-component/home-component';
import {authenticateGuard} from '../guards/authenticate-guard';
import {ConfiguratorComponent} from '../components/configurator/configurator/configurator-component';

export const routes: Routes = [
  {path: '', redirectTo : 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent },
  {path: 'home', component: HomeComponent, canActivate: [authenticateGuard]},
  {path: 'config', component: ConfiguratorComponent, canActivate: [authenticateGuard] },
  {path: '**', redirectTo : 'login' }
];
