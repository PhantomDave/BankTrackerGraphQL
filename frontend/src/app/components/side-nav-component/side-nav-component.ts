import { ChangeDetectionStrategy, Component } from '@angular/core';
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
import { RouterLink, RouterLinkActive } from '@angular/router';

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
export class SideNavComponent {}
