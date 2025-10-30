import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {SideNavComponent} from '../components/side-nav-component/side-nav-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Banking Helper');

  isAuthenticated = signal(false);

  constructor() {
    const token = localStorage.getItem('auth_token');
    this.isAuthenticated.set(token !== null);
  }
}
