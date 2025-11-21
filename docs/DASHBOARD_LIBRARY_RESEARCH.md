# Dashboard Grid Library Research

## Libraries Evaluated

### 1. angular-gridster2
**NPM**: `angular-gridster2`  
**Version**: 20.2.3 (Angular 20 compatible) ✅  
**Weekly Downloads**: 161,214  
**License**: MIT  
**Demo**: http://tiberiuzuld.github.io/angular-gridster2

#### Pros
- ✅ **Actively maintained** - Updated 1 month ago, Angular 20.x support
- ✅ **Purpose-built for dashboards** - Drag, drop, resize out of the box
- ✅ **Mature library** - 251 versions, 96 dependents, proven track record
- ✅ **Standalone component support** - Works with Angular's new architecture
- ✅ **Simple API** - `GridsterComponent` + `GridsterItemComponent` with options config
- ✅ **Grid-based layout** - Uses `{x, y, cols, rows}` positioning (matches our needs)
- ✅ **Callbacks for changes** - `itemChangeCallback`, `itemResizeCallback` for persistence
- ✅ **Responsive** - Built-in support for breakpoints
- ✅ **Good documentation** - Clear examples for drag handlers, interactive content

#### Cons
- ⚠️ **Parent container must have explicit size** - Needs wrapper with height/width
- ⚠️ **iFrame issues** - May interfere with drag/resize (workaround available)
- ⚠️ **Less flexible than CDK** - More opinionated, harder to customize deeply

#### Example Usage
```typescript
import { GridsterComponent, GridsterItemComponent } from 'angular-gridster2';

@Component({
  standalone: true,
  imports: [GridsterComponent, GridsterItemComponent],
  template: `
    <gridster [options]="options">
      @for (item of dashboard; track item.id) {
        <gridster-item [item]="item">
          <!-- Widget content here -->
        </gridster-item>
      }
    </gridster>
  `
})
export class DashboardComponent {
  options: GridsterConfig = {
    itemChangeCallback: this.itemChanged.bind(this),
    itemResizeCallback: this.itemResized.bind(this),
    draggable: { enabled: true },
    resizable: { enabled: true }
  };
  
  dashboard: GridsterItem[] = [
    { x: 0, y: 0, cols: 2, rows: 1 },
    { x: 2, y: 0, cols: 2, rows: 2 }
  ];
  
  itemChanged(item: GridsterItem) {
    // Persist to backend
  }
  
  itemResized(item: GridsterItem) {
    // Persist to backend
  }
}
```

---

### 2. @angular/cdk (Drag-Drop Module)
**NPM**: `@angular/cdk`  
**Version**: 21.0.0 (Angular 21 compatible, works with 20) ✅  
**Weekly Downloads**: 2,997,845  
**License**: MIT  
**Docs**: https://material.angular.io/cdk/drag-drop

#### Pros
- ✅ **Official Angular library** - Maintained by Angular team, guaranteed compatibility
- ✅ **Already in project** - Used for Angular Material, no new dependency
- ✅ **Highly flexible** - Low-level primitives, full customization control
- ✅ **Massive adoption** - 3M weekly downloads, 3250 dependents
- ✅ **Comprehensive** - More than just drag-drop (a11y, layout, overlays, etc.)
- ✅ **Future-proof** - Will always match Angular version updates

#### Cons
- ❌ **More boilerplate** - Need to build grid system from scratch
- ❌ **No built-in resize** - Only handles drag-drop, must implement resize manually
- ❌ **Steeper learning curve** - Lower-level API requires more setup
- ❌ **Not dashboard-specific** - General-purpose tool, needs adaptation

#### Example Usage (Simplified)
```typescript
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  standalone: true,
  imports: [DragDropModule],
  template: `
    <div cdkDropList (cdkDropListDropped)="drop($event)">
      @for (item of widgets; track item.id) {
        <div cdkDrag>
          <!-- Widget content -->
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  widgets = [...];
  
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.widgets, event.previousIndex, event.currentIndex);
    // Still need to implement grid positioning, resize, collision detection...
  }
}
```

---

### 3. Alternative Libraries (Not Recommended)

#### ngx-dashboard
- ⚠️ **Outdated** - Last update 2+ years ago, Angular 13 max
- ❌ Not compatible with Angular 20

#### gridstack.js + Angular wrapper
- ⚠️ **jQuery dependency** - Goes against Angular best practices
- ⚠️ **Heavy** - Larger bundle size
- ❌ Less Angular-idiomatic

---

## Recommendation: angular-gridster2

### Why angular-gridster2 Wins

1. **Perfect for our use case**: Dashboard-specific library with all features we need (drag, drop, resize, grid positioning)
2. **Angular 20 compatibility**: Version 20.2.3 released just last month
3. **Developer experience**: Simple API means faster implementation
4. **Proven reliability**: 161K weekly downloads, actively maintained since 2016
5. **Time-to-market**: Get a working prototype in hours, not days

### When to Use CDK Instead
- Need absolute positioning control (non-grid layout)
- Want to minimize dependencies
- Building a highly custom drag-drop interaction beyond dashboards
- Team has deep CDK expertise

### Implementation Plan with angular-gridster2

#### Phase 1.2 Integration
```bash
cd frontend
npm install angular-gridster2 --save
```

#### Data Model Mapping
```typescript
// Backend: DashboardWidget entity
interface DashboardWidget {
  id: number;
  type: string;
  config: string; // JSON
  x: number;
  y: number;
  width: number;  // Called "cols" in gridster
  height: number; // Called "rows" in gridster
}

// Frontend: GridsterItem
interface GridsterItem {
  x: number;
  y: number;
  cols: number;  // Maps to widget.width
  rows: number;  // Maps to widget.height
  // Custom properties
  id?: number;
  type?: WidgetType;
  config?: any;
}
```

#### Configuration Recommendations
```typescript
const gridsterOptions: GridsterConfig = {
  gridType: GridType.Fit, // Fit to container
  compactType: CompactType.None, // Don't auto-compact
  margin: 16, // 16px gap between widgets
  outerMargin: true,
  outerMarginTop: null,
  outerMarginRight: null,
  outerMarginBottom: null,
  outerMarginLeft: null,
  useTransformPositioning: true, // Better performance
  mobileBreakpoint: 768,
  minCols: 12, // 12-column grid
  maxCols: 12,
  minRows: 1,
  maxRows: 100,
  maxItemCols: 12,
  minItemCols: 1,
  maxItemRows: 10,
  minItemRows: 1,
  maxItemArea: 2500,
  minItemArea: 1,
  defaultItemCols: 4,
  defaultItemRows: 2,
  fixedColWidth: null,
  fixedRowHeight: 100, // Each row = 100px
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
    enabled: false, // Controlled by edit mode
    ignoreContent: true,
    dragHandleClass: 'drag-handle', // Only drag from handle
  },
  resizable: {
    enabled: false, // Controlled by edit mode
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
  itemChangeCallback: this.itemChanged.bind(this),
  itemResizeCallback: this.itemResized.bind(this),
};
```

### Migration Path (if needed later)
If we outgrow angular-gridster2, we can migrate to CDK:
1. Keep the same data model (x, y, width, height)
2. Build custom grid component using CDK drag-drop
3. Swap components without backend changes

---

## Decision

✅ **Use angular-gridster2** for MVP and initial release.

**Fallback**: If we encounter limitations, CDK is always available as the project already includes `@angular/cdk`.

**Next Steps**:
1. Update Phase 1.2 in `DASHBOARD_PLAN.md` with angular-gridster2 specifics
2. Install library: `npm install angular-gridster2`
3. Create proof-of-concept with 2 mock widgets
4. Validate drag, drop, resize, and persistence workflow
