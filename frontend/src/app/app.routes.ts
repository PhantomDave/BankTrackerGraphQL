import { Routes } from '@angular/router';
import {LoginComponent} from './components/welcome-layout/login-component/login-component';
import {RegisterComponent} from './components/welcome-layout/register-component/register-component';

export const routes: Routes = [
  {path: '', redirectTo : 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent }
];
