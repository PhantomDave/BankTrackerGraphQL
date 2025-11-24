import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatToolbar } from '@angular/material/toolbar';
import { MatDivider } from '@angular/material/divider';
import { filter } from 'rxjs';

import { AccountService } from '../../models/account/account-service';
import { ThemeService } from '../../services/theme.service';
import { BreadcrumbComponent } from '../ui-library/breadcrumb/breadcrumb.component';

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
    MatIcon,
    MatIconButton,
    RouterLink,
    RouterLinkActive,
    BreadcrumbComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatToolbar,
    MatDivider,
  ],
  templateUrl: './side-nav-component.html',
  styleUrl: './side-nav-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent {
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  // Track which panels are expanded
  protected readonly homeExpanded = signal(false);
  protected readonly movementsExpanded = signal(false);
  protected readonly analyticsExpanded = signal(false);

  constructor() {
    // Set initial state based on current route
    this.updateExpandedPanels(this.router.url);

    // Listen to route changes and update expanded panels
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event: NavigationEnd) => {
        this.updateExpandedPanels(event.urlAfterRedirects);
      });
  }

  private updateExpandedPanels(url: string): void {
    // Reset all panels
    this.homeExpanded.set(false);
    this.movementsExpanded.set(false);
    this.analyticsExpanded.set(false);

    // Expand the appropriate panel based on the current route
    if (url.startsWith('/home')) {
      this.homeExpanded.set(true);
    } else if (url.startsWith('/movements')) {
      this.movementsExpanded.set(true);
    } else if (url.startsWith('/analytics')) {
      this.analyticsExpanded.set(true);
    }
  }

  protected async onLogout(): Promise<void> {
    this.accountService.logout();
    await this.router.navigate(['/login']);
  }

  protected onToggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
