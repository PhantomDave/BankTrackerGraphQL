# Plan: Spending Trends Dashboard Widget

**Spending Trends** is a feature-rich widget that visualizes spending patterns over time with charts, category breakdowns, and insights. This plan includes a new `SpendingTrends` widget type, backend GraphQL queries to aggregate spending by category/time period, and frontend components using Chart.js/ngx-charts to render interactive visualizations. Data flows through the existing finance records with optional filters by date range and category.

## Steps

### 1. Implement Categories (Foundation)
- **Location**: `PhantomDave.BankTracking.Library/Models/`
- **Files**:
  - Create `Category.cs` — Entity model with properties: `Id` (int), `AccountId` (int), `Name` (string), `Color` (string, hex code for UI), `Icon` (string, optional), `CreatedAt` (DateTime)
  - Extend `FinanceRecord.cs` — Add `CategoryId` (int?) foreign key to `Category`
- **Database**:
  - Create migration `AddCategorySupport` in `PhantomDave.BankTracking.Data/Migrations/`
  - Add `Categories` table (id, accountId, name, color, icon, createdAt) with unique constraint on (accountId, name)
  - Add `categoryId` nullable foreign key column to `FinanceRecords` table
  - Ensure cascading deletes from Account → Categories
- **Data Layer**:
  - Add `ICategoryRepository` interface in `PhantomDave.BankTracking.Data/Repositories/`
  - Implement `CategoryRepository.cs` with methods: `GetByIdAsync()`, `GetByAccountAsync()`, `GetByNameAsync()`, `AddAsync()`, `UpdateAsync()`, `DeleteAsync()`
  - Register repository in `IUnitOfWork` interface and `UnitOfWork.cs`
- **Validation**:
  - Category name must be non-empty, max 50 chars
  - Color must be valid hex code (e.g., #FF5733)
  - One category per (account, name) pair — enforce uniqueness

### 2. Expose Categories via GraphQL
- **Location**: `PhantomDave.BankTracking.Api/Types/`
- **New Type File**: `ObjectTypes/CategoryType.cs`
  - Record with properties: `Id` (int), `Name` (string), `Color` (string), `Icon` (string?), `CreatedAt` (DateTime)
  - Factory method: `FromCategory(Category category)`
- **New Input File**: `Inputs/CreateCategoryInput.cs`
  - Properties: `Name` (string), `Color` (string), `Icon` (string?)
- **New Mutation File**: `Mutations/CategoryMutations.cs`
  - Add `[Authorize]` mutation `CreateCategory(input: CreateCategoryInput!)` — returns `CategoryType` or error
  - Add `[Authorize]` mutation `UpdateCategory(id: Int!, name: String, color: String, icon: String)` — returns `CategoryType` or error
  - Add `[Authorize]` mutation `DeleteCategory(id: Int!)` — returns boolean success
- **New Query File**: `Queries/CategoryQueries.cs`
  - Add `[Authorize]` query `GetCategories()` — returns all categories for authenticated account
  - Add `[Authorize]` query `GetCategory(id: Int!)` — returns single category with error handling
- **Error Handling**:
  - `BAD_USER_INPUT` for invalid name/color format
  - `NOT_FOUND` for non-existent category
  - `CONFLICT` for duplicate (account, name) pair (optional, graceful handling)

### 3. Create Category Service
- **Location**: `PhantomDave.BankTracking.Api/Services/`
- **File**: `CategoryService.cs`
- **Methods**:
  - `GetCategoryAsync(int id)` — Fetch single category
  - `GetCategoriesForAccountAsync(int accountId)` — Fetch all categories for account
  - `CreateCategoryAsync(int accountId, string name, string color, string? icon)` — Create with validation
  - `UpdateCategoryAsync(int id, string? name, string? color, string? icon)` — Update non-null fields
  - `DeleteCategoryAsync(int id)` — Delete (consider soft-delete or mark-for-cleanup if records reference it)
- **Patterns**: Follow `AccountService`/`FinanceRecordService` patterns
  - Normalize name (trim, title case) and color (uppercase hex)
  - Validate before persistence
  - Reuse `IUnitOfWork` and repositories

### 4. Update Finance Record to include Category
- **Location**: `PhantomDave.BankTracking.Api/Types/ObjectTypes/`
- **Files**: Update `FinanceRecordType.cs`
  - Add optional property `Category` (CategoryType?)
  - Update `FromFinanceRecord()` factory to include category data (via entity navigation property or explicit join in service)
- **Backend Service**: Update `FinanceRecordService.cs`
  - Include `.Include(f => f.Category)` in queries where needed (or use eager loading in GraphQL resolver)
  - Pass category validation when creating/updating finance records with category assignment
- **GraphQL**: Update `FinanceRecordQueries.cs` resolver
  - Include `Category` in response when fetching finance records

### 5. Extend the domain model (for Spending Trends)
- **Location**: `PhantomDave.BankTracking.Library/Models/`
- **Tasks**:
  - Add `SpendingTrend` record to hold aggregated spending data (period, category, total, count)
  - Extend `DashboardWidget.cs` `WidgetType` enum to include `SpendingTrends` variant
  - Consider adding optional helper enums for `TrendPeriod` (Day, Week, Month, Quarter, Year) if needed

### 6. Create backend service for Spending Trends
- **Location**: `PhantomDave.BankTracking.Api/Services/`
- **File**: `SpendingTrendService.cs`
- **Methods**:
  - `GetSpendingByCategory(int accountId, DateTime? startDate, DateTime? endDate)` — Returns list of `SpendingTrend` grouped by category with totals and counts
  - `GetSpendingTrends(int accountId, DateTime? startDate, DateTime? endDate, TrendPeriod period)` — Returns trends over time (day/week/month)
  - `GetTopExpenseCategories(int accountId, int limit, DateTime? startDate, DateTime? endDate)` — Returns sorted list of most expensive categories
- **Patterns**: Follow existing `FinanceRecordService` patterns:
  - Reuse injected `IUnitOfWork` and `FinanceRecords` repository
  - Apply date range filtering via `Where` clauses
  - Use `AsNoTracking()` for read-only queries
  - Group finance records by category and date period using LINQ

### 7. Expose GraphQL queries for Spending Trends
- **Location**: `PhantomDave.BankTracking.Api/Types/`
- **New Type File**: `ObjectTypes/SpendingTrendType.cs`
  - Record with properties: `Period` (string), `Category` (string), `TotalAmount` (decimal), `TransactionCount` (int), `AverageTransaction` (decimal)
  - Factory method: `FromSpendingTrend(SpendingTrend trend)`
- **Extend**: `Queries/FinanceRecordQueries.cs`
  - Add `[Authorize]` method `GetSpendingTrends()` — calls service, returns `IEnumerable<SpendingTrendType>`
  - Add `[Authorize]` method `GetSpendingByCategory()` — calls service, returns categorized breakdown
  - Add `[Authorize]` method `GetTopExpenses(int limit = 5)` — calls service, returns top N categories
- **Error handling**: Use `GraphQLException` with `ErrorBuilder` for invalid inputs (negative limits, invalid date ranges)

### 8. Add GraphQL operations
- **Location**: `frontend/src/app/models/finance-record/gql/`
- **Files**:
  - `get-spending-trends.query.graphql` — Query with optional date range and period filters
  - `get-spending-by-category.query.graphql` — Query returning category breakdown
  - `get-top-expenses.query.graphql` — Query for top N categories with limit parameter
- **Workflow**:
  - Write `.graphql` files following existing naming conventions (camelCase operation names)
  - Run `npm run codegen` in `frontend/` to auto-generate `GetSpendingTrendsGQL`, `GetSpendingByCategoryGQL`, `GetTopExpensesGQL` services in `src/generated/graphql.ts`

### 9. Build frontend widget component
- **Location**: `frontend/src/app/components/`
- **New Folder**: `spending-trends-widget/`
- **Files**:
  - `spending-trends-widget.component.ts` — Standalone component with:
    - Signal-based state: `_spendingData`, `_categoryData`, `_loading`, `_error`
    - Filter signals: `_startDate`, `_endDate`, `_selectedPeriod` (Month default)
    - Use `effect()` to refetch data when filters change
    - Call generated GraphQL services with `firstValueFrom` or `.watch().valueChanges`
    - Set/reset loading and error signals before/after queries (follow `AccountService` pattern)
    - Catch errors and display via `SnackbarService.error()`
  - `spending-trends-widget.component.html` — Template with:
    - Date range picker (Material `MatDatepickerModule`)
    - Period selector (dropdown or toggle buttons)
    - Chart containers (div placeholders for Chart.js instances)
    - Loading spinner (`MatProgressSpinnerModule`)
    - Error message display
  - `spending-trends-widget.component.scss` — Styles for layout, charts, and filters
- **Chart Integration** (Phase 1: recommend Chart.js with `ng2-charts`):
  - Install: `npm install chart.js ng2-charts`
  - Use `BaseChartDirective` from `ng2-charts` for line/bar/pie charts
  - Render two charts: trends over time (line chart) and category breakdown (pie chart)
  - Update chart data when signals change (not `.mutate`, use `.set`)
- **Dependencies**: Import `MatDatepickerModule`, `MatNativeDateModule`, `MatSelectModule`, `MatProgressSpinnerModule`, `MatButtonModule`, `CommonModule`

### 10. Integrate with dashboard
- **Location**: `PhantomDave.BankTracking.Api/Services/DashboardService.cs`
- **Verify**: `AddWidgetAsync()` method works with new `WidgetType.SpendingTrends`
- **Frontend Location**: Dashboard component widget registry
- **Tasks**:
  - Ensure widget factory/mapper recognizes `SpendingTrends` and instantiates the new component
  - Test drag-drop layout (gridster) accommodates the new widget dimensions
  - Verify mutations like `AddDashboardWidget` accept `SpendingTrends` type

## Further Considerations

### 1. Chart library choice
- **Recommendation**: **Chart.js with `ng2-charts`**
  - Lightweight, excellent control, smaller bundle than ngx-charts
  - `BaseChartDirective` integrates cleanly with Angular signals
  - Good documentation and community support
- **Alternative**: ngx-charts (declarative Angular components, but heavier)

### 2. Time period granularity
- **Default**: Month-based trends (aligns with monthly financial tracking)
- **Phase 1**: Month only
- **Phase 2**: Add toggle for Week, Quarter, Year
- **Implementation**: `TrendPeriod` enum or string parameter; backend groups records using `DateOnly(year, month)` or `AddDays(-DateOnly.DayNumber + 1)` LINQ logic

### 3. Data aggregation scope
- **Include**: Recurring instances (they're materialized as real records by `RecurringFinanceRecordService`)
- **Optional filter**: If users want "non-recurring only", add boolean parameter; filter with `!IsRecurringInstance`
- **Default**: Include all records for complete spending picture

### 4. Widget configuration (Phase 2)
- **Phase 1**: Use in-widget signal filters (date range, period) — no persistence
- **Phase 2**: Save filter state to `DashboardWidget.Configuration` (JSON BLOB) so filters persist across sessions
- **Mutation**: Add optional `config` parameter to `AddDashboardWidget` or `UpdateDashboardWidget`

### 5. Performance optimization
- **For <1000 transactions**: Direct LINQ grouping in `SpendingTrendService` is sufficient
- **For >1000 transactions**: 
  - Consider database-level aggregation (pre-aggregate in a view or stored procedure)
  - Add pagination to trend queries (`limit`, `offset`)
  - Cache aggregated results with time-based invalidation
- **Current approach**: Backend aggregation via LINQ; frontend requests filter data; no pagination initially

### 6. Styling & theming
- **Material Design**: Use Angular Material color palette for chart colors
- **Consistency**: Match existing dashboard widget styles (padding, shadows, font sizes)
- **Responsive**: Ensure charts resize gracefully on mobile (Chart.js is responsive by default)

### 7. Error states
- **Invalid date range**: Catch in mutation, throw `GraphQLException` with code `BAD_USER_INPUT`
- **No data found**: Return empty array (not an error) and display "No transactions in this period" message
- **Network error**: Catch in service, set `_error` signal, show SnackbarService error

## Implementation Checklist

- [ ] Add `Category` model to Library/Models
- [ ] Create database migration for Categories table
- [ ] Create `CategoryRepository` and register in `IUnitOfWork`
- [ ] Create `CategoryService.cs`
- [ ] Create `CategoryType.cs` GraphQL type
- [ ] Create `CreateCategoryInput.cs` GraphQL input
- [ ] Extend `FinanceRecord.cs` to include `CategoryId` foreign key
- [ ] Update `FinanceRecordType.cs` to include optional `Category` property
- [ ] Create `CategoryMutations.cs` with create/update/delete resolvers
- [ ] Create `CategoryQueries.cs` with get/list resolvers
- [ ] Update `FinanceRecordQueries.cs` to include category in responses
- [ ] Run database migration to add Categories table
- [ ] Add `SpendingTrend` model to Library/Models
- [ ] Add `SpendingTrends` to `WidgetType` enum
- [ ] Create `SpendingTrendService.cs` with three main query methods
- [ ] Create `SpendingTrendType.cs` GraphQL type
- [ ] Extend `FinanceRecordQueries.cs` with three new resolver methods
- [ ] Create `.graphql` operation files (get-spending-trends, get-spending-by-category, get-top-expenses)
- [ ] Run `npm run codegen` to generate Angular services
- [ ] Create `spending-trends-widget` component folder with `.ts`, `.html`, `.scss`
- [ ] Implement component logic with signals, effects, and Apollo service calls
- [ ] Implement chart rendering (Chart.js + ng2-charts)
- [ ] Add component to dashboard widget registry/factory
- [ ] Test widget on dashboard layout (drag-drop, resize)
- [ ] Test filters (date range, period changes trigger refetch)
- [ ] Test error states (invalid input, network errors)
- [ ] Update `WidgetType` GraphQL enum export in backend schema

## Related Items

- **Category System** — New foundational feature enabling categorization of all finance records
- **Monthly Statistics Type** already exists (`MonthlyStatisticsType.cs`) — can reuse patterns
- **Dashboard Widget System** — follow existing dashboard mutation/query patterns
- **Finance Record Service** — reuse filtering and date normalization utilities
- **SnackbarService** — use for error/success feedback in component

## References

- Existing: `PhantomDave.BankTracking.Api/Services/FinanceRecordService.cs` (pattern for service queries)
- Existing: `PhantomDave.BankTracking.Api/Types/Queries/FinanceRecordQueries.cs` (pattern for GraphQL resolvers)
- Existing: `PhantomDave.BankTracking.Api/Types/ObjectTypes/MonthlyStatisticsType.cs` (pattern for aggregated data types)
- Existing: `frontend/src/app/models/account/account.service.ts` (pattern for frontend service with signals)
- Existing: `frontend/src/app/components/` (pattern for standalone components)

