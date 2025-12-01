import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
import { WidgetType } from '../../../../generated/graphql';
import { WIDGET_DISPLAY_NAMES } from '../../../constants/widget-names';

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

  readonly availableWidgets = Object.values(WidgetType).map((type) => ({
    type,
    name: WIDGET_DISPLAY_NAMES[type] ?? String(type),
  }));

  addWidgetToDashboard(widget: { type: WidgetType; name: string }) {
    this.widgetSelected.emit(widget.type);
  }

  onDrawerClosed() {
    this.closed.emit();
  }
}
