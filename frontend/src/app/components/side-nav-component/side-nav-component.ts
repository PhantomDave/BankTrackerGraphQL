import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatListItem,
  MatListItemIcon,
  MatListItemLine,
  MatListItemTitle,
  MatNavList,
} from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AccountService } from '../../models/account/account-service';
import { FlexComponent } from '../ui-library/flex-component/flex-component';

@Component({
  selector: 'app-side-nav-component',
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatListItemLine,
    MatIcon,
    MatIconButton,
    RouterLink,
    RouterLinkActive,
    FlexComponent,
  ],
  templateUrl: './side-nav-component.html',
  styleUrl: './side-nav-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  protected async onLogout(): Promise<void> {
    this.accountService.logout();
    await this.router.navigate(['/login']);
  }
}
