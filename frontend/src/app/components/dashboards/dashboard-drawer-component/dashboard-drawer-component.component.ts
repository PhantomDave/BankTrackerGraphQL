import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
import { WidgetType } from '../../../models/dashboards/gridster-item';

@Component({
  selector: 'app-dashboard-drawer-component',
  templateUrl: './dashboard-drawer-component.component.html',
  styleUrls: ['./dashboard-drawer-component.component.css'],
  imports: [MatDrawer, MatDrawerContainer, MatDrawerContent, MatIconButton, MatIcon, FlexComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardDrawerComponentComponent {
  opened = input<boolean>(true);
  closed = output<void>();
  readonly availableWidgets = [
    {
      type: WidgetType.NetGraph,
      name: 'Net Graph',
    },
    {
      type: WidgetType.CurrentBalance,
      name: 'Remaining Budget',
    },
  ];

  onDrawerClosed() {
    this.closed.emit();
  }
}
