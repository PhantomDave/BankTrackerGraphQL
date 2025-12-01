import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  CompactType,
  DisplayGrid,
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent,
  GridsterItemComponentInterface,
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

@Component({
  standalone: true,
  imports: [
    GridsterComponent,
    GridsterItemComponent,
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

  itemChange(_item: GridsterItem, _itemComponent: GridsterItemComponentInterface) {
    // Item changed callback
  }

  itemResize(_item: GridsterItem, _itemComponent: GridsterItemComponentInterface) {
    // Item resized callback
  }

  changedOptions() {
    // this.options.api?.optionsChanged();
  }

  removeItem(item: GridsterItem) {
    this.widgets().splice(this.widgets().indexOf(item), 1);
  }

  editDashboard() {
    const newEditMode = !this.isEditMode();
    this.isEditMode.set(newEditMode);

    if (this.options.draggable) {
      this.options.draggable.enabled = newEditMode;
    }
    if (this.options.resizable) {
      this.options.resizable.enabled = newEditMode;
    }

    this.options.api?.optionsChanged?.();
  }

  onDrawerClosed() {
    this.isEditMode.set(false);

    if (this.options.draggable) {
      this.options.draggable.enabled = false;
    }
    if (this.options.resizable) {
      this.options.resizable.enabled = false;
    }

    this.options.api?.optionsChanged?.();
  }

  onWidgetSelected(widgetType: WidgetType) {
    try {
      const widget = WidgetFactory.createWidget(widgetType);
      this.widgets.set([...this.widgets(), widget]);
      
      const widgetNames: Record<WidgetType, string> = {
        [WidgetType.NET_GRAPH]: 'Net Graph',
        [WidgetType.CURRENT_BALANCE]: 'Remaining Budget',
      };
      const widgetName = widgetNames[widgetType] ?? String(widgetType);
      this.snackbarService.success(`Added ${widgetName} widget to dashboard.`);
    } catch (error) {
      this.snackbarService.error('Failed to add widget to dashboard.');
    }
  }
}
