import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
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
    FlexComponent,
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

  options!: GridsterConfig;
  readonly widgets = signal<Widget[]>([]);
  readonly isEditMode = signal<boolean>(false);

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
      minItemCols: 2,
      maxItemRows: 8,
      minItemRows: 2,
      maxItemArea: 2500,
      minItemArea: 4,
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
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: { north: true, east: true, south: true, west: true },
      pushResizeItems: false,
      displayGrid: DisplayGrid.OnDragAndResize,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false,
      itemChangeCallback: this.itemChange.bind(this),
      itemResizeCallback: this.itemResize.bind(this),
    };
  }

  itemChange(_item: GridsterItemConfig) {
    // Item changed callback
  }

  itemResize(_item: GridsterItemConfig) {
    // Item resized callback
  }

  removeItem(item: GridsterItemConfig) {
    this.widgets().splice(this.widgets().indexOf(item), 1);
  }

  editDashboard() {
    const newEditMode = !this.isEditMode();
    this.isEditMode.set(newEditMode);

    // Create new options object to trigger change detection
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

    // Create new options object to trigger change detection
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

  onWidgetSelected(widgetType: WidgetType) {
    try {
      const widget = WidgetFactory.createWidget(widgetType);
      this.widgets.set([...this.widgets(), widget]);

      const widgetName = WIDGET_DISPLAY_NAMES[widgetType] ?? String(widgetType);
      this.snackbarService.success(`Added ${widgetName} widget to dashboard.`);
    } catch {
      this.snackbarService.error('Failed to add widget to dashboard.');
    }
  }
}
