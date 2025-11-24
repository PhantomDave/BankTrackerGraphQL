import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
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
import { WidgetRemainingComponent } from '../../widgets/widget-remaining/widget-remaining.component';
import { WidgetNetGraphComponent } from '../../widgets/widget-net-graph/widget-net-graph.component';
import { Widget, WidgetType } from '../../models/dashboards/gridster-item';
import { MatIcon } from '@angular/material/icon';
import { FlexComponent } from '../ui-library/flex-component/flex-component';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  selector: 'app-dashboard',
  templateUrl: './dashboard-component.component.html',
  styleUrls: ['./dashboard-component.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly WidgetType = WidgetType;

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

    this.widgets.set([
      {
        cols: 4,
        rows: 4,
        y: 0,
        x: 0,
        type: WidgetType.CurrentBalance,
      },
      {
        cols: 8,
        rows: 6,
        y: 0,
        x: 4,
        type: WidgetType.NetGraph,
      },
    ]);
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

  addItem() {
    this.widgets().push({
      x: 0,
      y: 0,
      rows: 0,
      cols: 0,
    });
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
}
