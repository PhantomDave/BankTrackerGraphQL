# Dashboard Implementation Plan

> **Approach**: Frontend-first development to prototype UI/UX quickly, then wire up backend data layer.

## Phase 0: Research & Design
- [ ] **Library Selection** - Evaluate Angular grid/dashboard libraries (angular-gridster2, @angular/cdk drag-drop)
- [ ] **Widget Catalog** - List initial widget types and their data requirements
- [ ] **Layout System** - Define grid system (rows/columns), responsive breakpoints
- [ ] **Mock Data** - Create TypeScript interfaces and mock data for prototyping

## Phase 1: Frontend Core
**Goal**: Build the dashboard shell and widget rendering infrastructure without backend dependency.

### 1.1 Widget System Foundation
- [ ] Create `frontend/src/app/dashboard/` folder structure
- [ ] Define `Widget` interface (id, type, config, position, size)
- [ ] Define `Dashboard` interface (id, name, widgets[])
- [ ] Create `WidgetType` enum (BALANCE, RECENT_TRANSACTIONS, SPENDING_CHART, BUDGET_PROGRESS, etc.)
- [ ] Implement `WidgetRegistryService` to map widget types to component classes

### 1.2 Layout Engine
- [ ] Install chosen grid library (`npm install angular-gridster2` or use CDK)
- [ ] Create `DashboardGridComponent` with drag-drop and resize support
- [ ] Implement `WidgetHostDirective` for dynamic component loading
- [ ] Create `WidgetContainerComponent` wrapper (header, config button, body)
- [ ] Add responsive breakpoints (mobile, tablet, desktop)

### 1.3 State Management
- [ ] Create `DashboardStateService` using Angular signals
  - [ ] `activeDashboard` signal
  - [ ] `dashboards` signal (list of all dashboards)
  - [ ] `isEditMode` signal
- [ ] Implement `loadDashboard(id)`, `saveDashboard()`, `deleteDashboard(id)` methods (localStorage for now)
- [ ] Add `addWidget(type)`, `removeWidget(id)`, `updateWidgetPosition()` methods

### 1.4 Dashboard Management UI
- [ ] Create `DashboardSelectorComponent` (dropdown to switch dashboards)
- [ ] Create `DashboardCreateDialogComponent` (Material Dialog)
- [ ] Create `DashboardSettingsDialogComponent` (rename, delete)
- [ ] Add "Edit Mode" toggle button to toolbar
- [ ] Add "Add Widget" menu when in edit mode

## Phase 2: Backend Foundation
**Goal**: Persist dashboards and widgets to PostgreSQL via GraphQL.

### 2.1 Data Model
- [ ] Create `Dashboard` entity in `PhantomDave.BankTracking.Library/Models/`
  - [ ] Id (int, primary key)
  - [ ] AccountId (int, foreign key)
  - [ ] Name (string)
  - [ ] IsDefault (bool)
  - [ ] CreatedAt, UpdatedAt (DateTime)
- [ ] Create `DashboardWidget` entity
  - [ ] Id (int, primary key)
  - [ ] DashboardId (int, foreign key)
  - [ ] Type (string enum)
  - [ ] Config (string, JSON serialized)
  - [ ] X, Y, Width, Height (int, grid position)
  - [ ] Order (int, z-index)

### 2.2 Data Layer
- [ ] Add `DbSet<Dashboard>` and `DbSet<DashboardWidget>` to `ApplicationDbContext`
- [ ] Create `IDashboardRepository` interface in Data project
- [ ] Implement `DashboardRepository` with:
  - [ ] `GetByAccountIdAsync(accountId)`
  - [ ] `GetByIdAsync(id, accountId)` (ensure ownership)
  - [ ] `CreateAsync(dashboard)`
  - [ ] `UpdateAsync(dashboard)`
  - [ ] `DeleteAsync(id, accountId)`
- [ ] Create and apply EF migration

### 2.3 GraphQL API
- [ ] Create `DashboardService` in `PhantomDave.BankTracking.Api/Services/`
  - [ ] Inject `IUnitOfWork` and `IHttpContextAccessor`
  - [ ] Implement business logic methods
- [ ] Create `Types/ObjectTypes/DashboardType.cs` and `DashboardWidgetType.cs`
- [ ] Create `Types/Inputs/CreateDashboardInput.cs`, `UpdateDashboardInput.cs`, `AddWidgetInput.cs`, `UpdateWidgetInput.cs`
- [ ] Create `Types/Queries/DashboardQueries.cs`
  - [ ] `getDashboards(): [Dashboard]`
  - [ ] `getDashboard(id: Int!): Dashboard`
- [ ] Create `Types/Mutations/DashboardMutations.cs`
  - [ ] `createDashboard(input: CreateDashboardInput!): Dashboard`
  - [ ] `updateDashboard(id: Int!, input: UpdateDashboardInput!): Dashboard`
  - [ ] `deleteDashboard(id: Int!): Boolean`
  - [ ] `addWidget(dashboardId: Int!, input: AddWidgetInput!): DashboardWidget`
  - [ ] `updateWidget(id: Int!, input: UpdateWidgetInput!): DashboardWidget`
  - [ ] `removeWidget(id: Int!): Boolean`

### 2.4 Frontend Integration
- [ ] Add GraphQL operations in `frontend/src/app/dashboard/gql/`
  - [ ] `getDashboards.graphql`
  - [ ] `createDashboard.graphql`
  - [ ] `updateDashboardWidgets.graphql`
  - [ ] `deleteDashboard.graphql`
- [ ] Run `npm run codegen` to generate Apollo services
- [ ] Update `DashboardStateService` to use GraphQL instead of localStorage
- [ ] Add error handling and loading states
- [ ] Test full CRUD flow (create, edit, delete dashboards)

## Phase 3: Widget Collection
**Goal**: Implement individual widget components with real data.

### 3.1 Balance Summary Widget
- [ ] Create `BalanceSummaryWidgetComponent`
- [ ] Display current balance, total income/expense for current month
- [ ] Add configuration: date range selector, account filter
- [ ] Use existing `GetFinanceRecordsGQL` to fetch data
- [ ] Register in `WidgetRegistryService`

### 3.2 Recent Transactions Widget
- [ ] Create `RecentTransactionsWidgetComponent`
- [ ] Show last N transactions (configurable: 5, 10, 20)
- [ ] Display: date, description, category, amount
- [ ] Add click-through to full transaction detail
- [ ] Configuration: limit, show recurring/non-recurring filter

### 3.3 Spending Chart Widget
- [ ] Install charting library (`npm install chart.js ng2-charts` or similar)
- [ ] Create `SpendingChartWidgetComponent`
- [ ] Implement pie/donut chart for category breakdown
- [ ] Configuration: chart type (pie/bar/line), date range, income/expense toggle
- [ ] Fetch aggregated data (may need new GraphQL query)

### 3.4 Budget Progress Widget
- [ ] Create `BudgetProgressWidgetComponent`
- [ ] Show spending vs budget (requires budget feature from main TODO)
- [ ] Display as progress bar or gauge
- [ ] Configuration: category selection, warning threshold
- [ ] **Note**: May need to implement budgeting backend first or use mock data

### 3.5 Quick Stats Widget
- [ ] Create `QuickStatsWidgetComponent`
- [ ] Display configurable stat (total spent this month, average daily spending, biggest expense)
- [ ] Large number display with icon and trend indicator
- [ ] Configuration: stat type, date range, format

### 3.6 Category Breakdown Widget
- [ ] Create `CategoryBreakdownWidgetComponent`
- [ ] Table or list showing spending per category
- [ ] Sort by amount, show percentage of total
- [ ] Configuration: top N categories, date range

## Phase 4: Customization & Polish
**Goal**: Advanced features for power users and UI refinement.

### 4.1 Drag & Drop
- [ ] Enable widget dragging in edit mode
- [ ] Implement grid snapping
- [ ] Add visual feedback (drop zones, ghost preview)
- [ ] Persist layout changes to backend
- [ ] Add undo/redo for layout changes

### 4.2 Widget Configuration
- [ ] Create `WidgetConfigDialogComponent` (generic dialog)
- [ ] Build dynamic forms based on widget type
- [ ] Add "gear icon" to widget header in edit mode
- [ ] Validate configuration inputs
- [ ] Save config to backend

### 4.3 Widget Resize
- [ ] Add resize handles to widgets in edit mode
- [ ] Implement min/max size constraints per widget type
- [ ] Update grid on resize
- [ ] Persist size changes

### 4.4 Multiple Dashboards
- [ ] Implement dashboard switcher in toolbar
- [ ] Add keyboard shortcuts (Ctrl+1, Ctrl+2, etc.)
- [ ] Support "default dashboard" setting
- [ ] Add dashboard duplication feature (clone with widgets)

### 4.5 Import/Export
- [ ] Add "Export Dashboard" to download JSON
- [ ] Add "Import Dashboard" to upload JSON
- [ ] Validate imported dashboard structure
- [ ] Support sharing dashboard templates

### 4.6 Polish & UX
- [ ] Add loading skeletons for widgets
- [ ] Implement error boundaries for individual widgets
- [ ] Add empty state illustrations
- [ ] Add tooltips and help text
- [ ] Optimize performance (lazy load widget data, virtual scrolling for lists)
- [ ] Add animations (smooth transitions when adding/removing widgets)
- [ ] Mobile responsive adjustments (stack widgets on small screens)

## Technical Considerations

### Widget Data Fetching Strategy
- **Option A**: Each widget fetches its own data independently
  - ✅ Simple, isolated
  - ❌ Multiple API calls, potential for duplicate queries
- **Option B**: Dashboard service fetches all data, passes to widgets
  - ✅ Single query, more efficient
  - ❌ Tight coupling, harder to extend
- **Recommendation**: Start with Option A, optimize to B if performance is an issue

### Widget Configuration Storage
- Store as JSON string in `DashboardWidget.Config` column
- Example: `{"dateRange": "thisMonth", "limit": 10, "chartType": "pie"}`
- Each widget component defines its own config interface
- Validate config shape on backend to prevent malformed data

### Grid System
- Use 12-column grid (standard responsive pattern)
- Widget sizes: `{ x: number, y: number, width: number, height: number }`
- Example: `{ x: 0, y: 0, width: 6, height: 4 }` = half-width, 4 rows tall

### Responsive Behavior
- Desktop (>1200px): Full grid, drag-drop enabled
- Tablet (768-1200px): Reduced columns, drag-drop enabled
- Mobile (<768px): Single column stack, drag-drop disabled

## Next Steps After Completion

1. **Analytics Dashboard**: Create pre-built dashboard template for financial insights
2. **Widget Marketplace**: Allow community widget contributions
3. **Real-time Updates**: WebSocket support for live balance updates
4. **Dashboard Sharing**: Share read-only dashboard URLs
5. **Conditional Widgets**: Show/hide widgets based on user preferences or data availability

---

**Estimated Effort**:
- Phase 0: 1-2 days (research + design)
- Phase 1: 3-5 days (frontend core)
- Phase 2: 2-3 days (backend integration)
- Phase 3: 4-6 days (widget implementation)
- Phase 4: 3-4 days (polish)

**Total**: ~2-3 weeks for MVP with 3-4 core widgets
