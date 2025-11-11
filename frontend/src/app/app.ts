import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SideNavComponent } from './components/side-nav-component/side-nav-component';
import { AccountService } from './models/account/account-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly accountService = inject(AccountService);
  protected readonly title = signal('Banking Helper');
  protected readonly isAuthenticated = this.accountService.isAuthenticated;
}
