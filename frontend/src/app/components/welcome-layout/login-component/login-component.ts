import { Component } from '@angular/core';
import {WelcomeLayoutComponent} from '../welcome-layout-component/welcome-layout-component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login-component',
  imports: [
    WelcomeLayoutComponent,
    FormsModule
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  protected email: string | null = null;
  protected password: string | null = null;

  protected onSubmit() {
    console.log('Username:', this.email);
    console.log('Password:', this.password);
  }
}
