import { DashboardService } from './../../../models/dashboards/dashboard.service';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import {
  CompactType,
  DisplayGrid,
  Gridster,
  GridsterConfig,
  GridsterItemConfig,
  GridsterItem,
  GridType,
} from 'angular-gridster2';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WidgetNetGraphComponent } from '../../../widgets/widget-net-graph/widget-net-graph.component';
import { WidgetRemainingComponent } from '../../../widgets/widget-remaining/widget-remaining.component';
import { DashboardDrawerComponent } from '../dashboard-drawer-component/dashboard-drawer-component.component';
import { WidgetType } from '../../../../generated/graphql';
import { Widget } from '../../../models/dashboards/gridster-item';
import { WidgetFactory } from '../widgets/widget-factory';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { WIDGET_DISPLAY_NAMES } from '../../../constants/widget-names';
import { BaseWidget } from '../widgets/BaseWidget';

@Component({
  standalone: true,
  imports: [
    Gridster,
    GridsterItem,
    WidgetRemainingComponent,
    WidgetNetGraphComponent,
    MatIcon,
    MatButtonModule,
    DashboardDrawerComponent,
  ],
  selector: 'app-dashboard',
  templateUrl: './dashboard-component.component.html',
  styleUrls: ['./dashboard-component.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly WidgetType = WidgetType;
  private readonly snackbarService = inject(SnackbarService);
  private readonly dashboardService = inject(DashboardService);

  options!: GridsterConfig;
  readonly widgets = signal<Widget[]>([]);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedDashboard = this.dashboardService.selectedDashboard;

  constructor() {
    effect(
      () => {
        const dashboard = this.selectedDashboard();
        const currentWidgets = this.widgets();
        if (dashboard) {
          const newWidgetsData = dashboard.widgets;
          const areWidgetsSame =
            currentWidgets.length === newWidgetsData.length &&
            currentWidgets.every((cw) =>
              newWidgetsData.some(
                (nw) =>
                  nw.id === cw.id &&
                  nw.cols === cw.cols &&
                  nw.rows === cw.rows &&
                  nw.x === cw.x &&
                  nw.y === cw.y &&
                  nw.widgetType === cw.type,
              ),
            );

          if (!areWidgetsSame) {
            const widgets = newWidgetsData.map((w) =>
              WidgetFactory.createWidgetFromData({
                ...w,
                type: w.widgetType,
              }),
            );
            this.widgets.set(widgets);
          }
        } else if (currentWidgets.length > 0) {
          this.widgets.set([]);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    this.options = {
      gridType: GridType.VerticalFixed,
      compactType: CompactType.None,
      margin: 10,
      outerMargin: false,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      useTransformPositioning: true,
      mobileBreakpoint: 768,
      minCols: 12,
      maxCols: 12,
      minRows: 8,
      maxRows: 20,
      maxItemCols: 12,
      minItemCols: 1,
      maxItemRows: 12,
      minItemRows: 1,
      maxItemArea: 2500,
      minItemArea: 1,
      defaultItemCols: 6,
      defaultItemRows: 4,
      fixedColWidth: undefined,
      fixedRowHeight: 100,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      enableOccupiedCellDrop: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      draggable: {
        enabled: false,
        ignoreContent: true,
        dragHandleClass: 'drag-handle',
      },
      resizable: {
        enabled: false,
      },
      swap: false,
      pushItems: false,
      disablePushOnDrag: true,
      disablePushOnResize: true,
      pushDirections: { north: false, east: false, south: false, west: false },
      pushResizeItems: false,
      allowMultiLayer: false,
      defaultLayerIndex: 0,
      displayGrid: DisplayGrid.OnDragAndResize,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false,
      setGridSize: true,
    };
    this.dashboardService.getDashboards();
  }

  async removeItem(itemId: number) {
    try {
      const success = await this.dashboardService.removeWidget(itemId);
      if (success) {
        this.snackbarService.success('Widget removed from dashboard.');
      } else {
        this.snackbarService.error('Failed to remove widget from dashboard.');
      }
    } catch {
      this.snackbarService.error('Failed to remove widget from dashboard.');
    }
  }

  editDashboard() {
    const newEditMode = !this.isEditMode();
    this.isEditMode.set(newEditMode);

    this.options = {
      ...this.options,
      draggable: {
        ...this.options.draggable,
        enabled: newEditMode,
      },
      resizable: {
        ...this.options.resizable,
        enabled: newEditMode,
      },
    };
  }

  onDrawerClosed() {
    this.isEditMode.set(false);

    this.options = {
      ...this.options,
      draggable: {
        ...this.options.draggable,
        enabled: false,
      },
      resizable: {
        ...this.options.resizable,
        enabled: false,
      },
    };

    this.widgets().forEach((widget) => {
      const financeWidget = widget as BaseWidget;
      this.dashboardService.updateWidget({
        id: financeWidget.id!,
        cols: financeWidget.cols,
        rows: financeWidget.rows,
        x: financeWidget.x,
        y: financeWidget.y,
        type: financeWidget.getType(),
      });
    });
  }

  async onWidgetSelected(widgetType: WidgetType) {
    try {
      if (this.selectedDashboard() == null) {
        const created = await this.dashboardService.createDashboard({ name: 'New Dashboard' });
        if (!created) {
          this.snackbarService.error('Failed to create dashboard. Please try again.');
          return;
        }
      }

      const widget = WidgetFactory.createWidget(widgetType);
      const addedWidget = await this.dashboardService.addWidget({
        dashboardId: this.selectedDashboard()!.id,
        cols: widget.cols,
        rows: widget.rows,
        x: widget.x,
        y: widget.y,
        type: widget.getType(),
      });

      if (addedWidget) {
        const widgetName = WIDGET_DISPLAY_NAMES[widgetType] ?? String(widgetType);
        this.snackbarService.success(`Added ${widgetName} widget to dashboard.`);
      }
    } catch {
      this.snackbarService.error('Failed to add widget to dashboard.');
    }
  }
}
