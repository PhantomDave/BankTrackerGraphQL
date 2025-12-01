import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
import { WidgetType } from '../../../../generated/graphql';

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
  widgetSelected = output<WidgetType>();

  private static readonly WIDGET_DISPLAY_NAMES: Record<WidgetType, string> = {
    [WidgetType.NET_GRAPH]: 'Net Graph',
    [WidgetType.CURRENT_BALANCE]: 'Remaining Budget',
  };

  readonly availableWidgets = Object.values(WidgetType).map((type) => ({
    type,
    name: DashboardDrawerComponent.WIDGET_DISPLAY_NAMES[type] ?? String(type),
  }));

  addWidgetToDashboard(widget: { type: WidgetType; name: string }) {
    this.widgetSelected.emit(widget.type);
  }

  onDrawerClosed() {
    this.closed.emit();
  }
}
