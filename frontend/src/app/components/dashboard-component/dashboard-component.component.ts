import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
import { FinanceRecordService } from '../../models/finance-record/finance-record-service';

@Component({
  standalone: true,
  imports: [GridsterComponent, GridsterItemComponent, WidgetRemainingComponent],
  selector: 'app-dashboard',
  templateUrl: './dashboard-component.component.html',
  styleUrls: ['./dashboard-component.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly financeRecords = inject(FinanceRecordService);

  options!: GridsterConfig;
  widgets = signal<GridsterItem[]>([]);
  readonly financeRecordsComputed = computed(() => this.financeRecords.financeRecords());
  readonly loading = computed(() => this.financeRecords.loading());

  ngOnInit() {
    const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = new Date();
    this.financeRecords.getFinanceRecords(startDate, endDate);

    this.options = {
      gridType: GridType.Fit,
      compactType: CompactType.None,
      margin: 8,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      useTransformPositioning: true,
      mobileBreakpoint: 768,
      minCols: 12,
      maxCols: 12,
      minRows: 20,
      maxRows: 100,
      maxItemCols: 12,
      minItemCols: 1,
      maxItemRows: 10,
      minItemRows: 1,
      maxItemArea: 2500,
      minItemArea: 1,
      defaultItemCols: 4,
      defaultItemRows: 2,
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
        enabled: true,
        ignoreContent: true,
        dragHandleClass: 'drag-handle',
      },
      resizable: {
        enabled: true,
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
        cols: 2,
        rows: 1,
        y: 0,
        x: 0,
        component: 'widget-remaining',
        data: this.financeRecordsComputed(),
        dragEnabled: true,
        resizeEnabled: true,
      },
      {
        cols: 4,
        rows: 2,
        y: 0,
        x: 4,
        component: 'widget-placeholder',
      },
    ]);
  }

  itemChange(item: GridsterItem, itemComponent: GridsterItemComponentInterface) {
    console.info('itemChanged', item, itemComponent);
  }

  itemResize(item: GridsterItem, itemComponent: GridsterItemComponentInterface) {
    console.info('itemResized', item, itemComponent);
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
}
