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
export class DashboardDrawerComponent {
  opened = input<boolean>(true);
  closed = output<void>();

  // Map WidgetType enum values to display names
  private static readonly WIDGET_DISPLAY_NAMES: Record<WidgetType, string> = {
    [WidgetType.NetGraph]: 'Net Graph',
    [WidgetType.CurrentBalance]: 'Remaining Budget',
  };

  readonly availableWidgets = Object.values(WidgetType)
    .filter((value): value is WidgetType => typeof value === 'number')
    .map((type) => ({
      type,
      name: DashboardDrawerComponent.WIDGET_DISPLAY_NAMES[type] ?? String(type),
    }));

  onDrawerClosed() {
    this.closed.emit();
  }
}
