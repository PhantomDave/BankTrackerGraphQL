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
    effect(() => {
      const dashboard = this.selectedDashboard();
      if (dashboard) {
        const widgets = dashboard.widgets.map((w) =>
          WidgetFactory.createWidgetFromData({
            ...w,
            type: w.widgetType,
          }),
        );
        this.widgets.set(widgets);
      } else {
        this.widgets.set([]);
      }
    });
  }

  ngOnInit() {
    this.options = {
      gridType: GridType.Fit,
      compactType: CompactType.None,
      margin: 10,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      useTransformPositioning: true,
      mobileBreakpoint: 768,
      minCols: 12,
      maxCols: 12,
      minRows: 12,
      maxRows: 100,
      maxItemCols: 12,
      minItemCols: 1,
      maxItemRows: 8,
      minItemRows: 1,
      maxItemArea: 2500,
      minItemArea: 1,
      defaultItemCols: 4,
      defaultItemRows: 3,
      fixedColWidth: undefined,
      fixedRowHeight: 80,
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
      displayGrid: DisplayGrid.OnDragAndResize,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false,
      itemChangeCallback: this.itemChange.bind(this),
      itemResizeCallback: this.itemResize.bind(this),
    };
    this.dashboardService.getDashboards();
  }

  itemChange(item: GridsterItemConfig) {
    const widget = item as Widget;
    if (widget.id && this.selectedDashboard()) {
      this.dashboardService.updateWidget({
        id: widget.id,
        x: widget.x,
        y: widget.y,
        cols: widget.cols,
        rows: widget.rows,
      });
    }
  }

  itemResize(item: GridsterItemConfig) {
    const widget = item as Widget;
    if (widget.id && this.selectedDashboard()) {
      this.dashboardService.updateWidget({
        id: widget.id,
        x: widget.x,
        y: widget.y,
        cols: widget.cols,
        rows: widget.rows,
      });
    }
  }

  removeItem(item: GridsterItemConfig) {
    this.widgets.update(widgets => widgets.filter(w => w !== item));
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
        this.widgets.set([...this.widgets(), widget]);
        const widgetName = WIDGET_DISPLAY_NAMES[widgetType] ?? String(widgetType);
        this.snackbarService.success(`Added ${widgetName} widget to dashboard.`);
      }
    } catch {
      this.snackbarService.error('Failed to add widget to dashboard.');
    }
  }
}
