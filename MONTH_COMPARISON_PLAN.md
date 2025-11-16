# Month-over-Month Comparison Feature - Implementation Plan

## Overview

This feature will allow users to compare spending patterns across different months to identify trends, anomalies, and changes in their financial behavior. The implementation follows the existing BankTracker architecture patterns.

---

## Architecture Overview

### Backend (ASP.NET + HotChocolate GraphQL)

- **New Query**: `GetMonthlyComparison` - Aggregates finance records by month with optional date range filtering
- **Service Layer**: Add aggregation logic to `FinanceRecordService`
- **Data Layer**: Leverage existing `GetFinanceRecordsForAccountAsync` with date filtering

### Frontend (Angular 20 + Apollo)

- **New Component**: `MonthlyComparisonComponent` - Displays comparison data with charts and tables
- **Service**: Extend `FinanceRecordService` with computed signals for monthly aggregation
- **GraphQL Operations**: New query for fetching aggregated monthly data
- **Visualization**: Use Angular Material + Chart.js/ng2-charts for visual representation

---

## Implementation Phases

### Phase 1: Backend - GraphQL Query & Service Logic

#### Step 1.1: Create Monthly Statistics Type

**File**: `PhantomDave.BankTracking.Api/Types/ObjectTypes/MonthlyStatisticsType.cs`

```csharp
namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

/// <summary>
/// Represents aggregated financial statistics for a single month
/// </summary>
public record MonthlyStatisticsType
{
    public int Year { get; init; }
    public int Month { get; init; }
    public decimal TotalIncome { get; init; }
    public decimal TotalExpense { get; init; }
    public decimal NetAmount { get; init; }
    public int TransactionCount { get; init; }
    public decimal AverageTransactionAmount { get; init; }
    public string MostExpensiveCategory { get; init; } = string.Empty;
    public decimal RecurringExpenseTotal { get; init; }
    public decimal RecurringIncomeTotal { get; init; }
}
```

**Why**: Encapsulates monthly aggregated data in a strongly-typed GraphQL object following the existing pattern (`FinanceRecordType`, `AccountType`).

---

#### Step 1.2: Create Comparison Result Type

**File**: `PhantomDave.BankTracking.Api/Types/ObjectTypes/MonthlyComparisonType.cs`

```csharp
namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

/// <summary>
/// Contains monthly statistics and comparison metadata
/// </summary>
public record MonthlyComparisonType
{
    public IEnumerable<MonthlyStatisticsType> MonthlyData { get; init; } = [];
    public int TotalMonthsAnalyzed { get; init; }
    public decimal OverallAverageIncome { get; init; }
    public decimal OverallAverageExpense { get; init; }
    public MonthlyStatisticsType? HighestSpendingMonth { get; init; }
    public MonthlyStatisticsType? LowestSpendingMonth { get; init; }
}
```

**Why**: Provides rich comparison context beyond raw monthly data, following the pattern of returning processed data from the backend.

---

#### Step 1.3: Add Service Method

**File**: `PhantomDave.BankTracking.Api/Services/FinanceRecordService.cs`

Add the following method to the `FinanceRecordService` class:

```csharp
/// <summary>
/// Gets monthly aggregated statistics for finance records within a date range
/// </summary>
public async Task<MonthlyComparisonType> GetMonthlyComparisonAsync(
    int accountId,
    DateTime? startDate = null,
    DateTime? endDate = null)
{
    var records = await GetFinanceRecordsForAccountAsync(accountId, startDate, endDate);

    // Group by year and month
    var monthlyGroups = records
        .GroupBy(r => new { r.Date.Year, r.Date.Month })
        .OrderBy(g => g.Key.Year)
        .ThenBy(g => g.Key.Month)
        .ToList();

    var monthlyData = monthlyGroups.Select(group =>
    {
        var income = group.Where(r => r.Amount >= 0).Sum(r => r.Amount);
        var expense = group.Where(r => r.Amount < 0).Sum(r => r.Amount);
        var transactionCount = group.Count();
        var recurringExpense = group.Where(r => r.IsRecurring && r.Amount < 0).Sum(r => r.Amount);
        var recurringIncome = group.Where(r => r.IsRecurring && r.Amount >= 0).Sum(r => r.Amount);

        return new MonthlyStatisticsType
        {
            Year = group.Key.Year,
            Month = group.Key.Month,
            TotalIncome = income,
            TotalExpense = expense,
            NetAmount = income + expense,
            TransactionCount = transactionCount,
            AverageTransactionAmount = transactionCount > 0 ? (income + expense) / transactionCount : 0,
            RecurringExpenseTotal = recurringExpense,
            RecurringIncomeTotal = recurringIncome,
            MostExpensiveCategory = "General" // Placeholder - enhance when categories are added
        };
    }).ToList();

    var totalMonths = monthlyData.Count;
    var overallAvgIncome = totalMonths > 0
        ? monthlyData.Average(m => m.TotalIncome)
        : 0;
    var overallAvgExpense = totalMonths > 0
        ? monthlyData.Average(m => m.TotalExpense)
        : 0;

    var highestSpending = monthlyData
        .OrderByDescending(m => Math.Abs(m.TotalExpense))
        .FirstOrDefault();

    var lowestSpending = monthlyData
        .OrderBy(m => Math.Abs(m.TotalExpense))
        .FirstOrDefault();

    return new MonthlyComparisonType
    {
        MonthlyData = monthlyData,
        TotalMonthsAnalyzed = totalMonths,
        OverallAverageIncome = overallAvgIncome,
        OverallAverageExpense = overallAvgExpense,
        HighestSpendingMonth = highestSpending,
        LowestSpendingMonth = lowestSpending
    };
}
```

**Why**: Reuses existing data retrieval logic and applies LINQ aggregation, keeping with DRY principles. Backend handles heavy lifting to reduce frontend complexity.

---

#### Step 1.4: Add GraphQL Query

**File**: `PhantomDave.BankTracking.Api/Types/Queries/FinanceRecordQueries.cs`

Add this method to the existing `FinanceRecordQueries` class:

```csharp
/// <summary>
/// Get monthly comparison statistics for an account
/// </summary>
[Authorize]
public async Task<MonthlyComparisonType> GetMonthlyComparison(
    DateTime? startDate,
    DateTime? endDate,
    [Service] FinanceRecordService financeRecordService,
    [Service] IHttpContextAccessor httpContextAccessor)
{
    var accountId = httpContextAccessor.GetAccountIdFromContext();

    // Default to last 12 months if no date range provided
    var actualStartDate = startDate ?? DateTime.UtcNow.AddMonths(-12);
    var actualEndDate = endDate ?? DateTime.UtcNow;

    return await financeRecordService.GetMonthlyComparisonAsync(
        accountId,
        actualStartDate,
        actualEndDate);
}
```

**Why**: Follows existing pattern with `GetFinanceRecordsForAccount`, uses JWT authentication via `httpContextAccessor`, provides sensible defaults (last 12 months).

---

### Phase 2: Frontend - GraphQL Operations

#### Step 2.1: Create GraphQL Query File

**File**: `frontend/src/app/models/finance-record/gql/get-monthly-comparison.query.graphql`

```graphql
query getMonthlyComparison($startDate: DateTime, $endDate: DateTime) {
  monthlyComparison(startDate: $startDate, endDate: $endDate) {
    monthlyData {
      year
      month
      totalIncome
      totalExpense
      netAmount
      transactionCount
      averageTransactionAmount
      mostExpensiveCategory
      recurringExpenseTotal
      recurringIncomeTotal
    }
    totalMonthsAnalyzed
    overallAverageIncome
    overallAverageExpense
    highestSpendingMonth {
      year
      month
      totalExpense
    }
    lowestSpendingMonth {
      year
      month
      totalExpense
    }
  }
}
```

**Why**: Matches the backend schema, uses optional date range parameters, requests all necessary data fields for comparison display.

---

#### Step 2.2: Run Code Generation

After creating the GraphQL file, run:

```bash
cd frontend
npm run codegen
```

This generates TypeScript types in `src/generated/graphql.ts` including:

-- `GetMonthlyComparisonGQL` service class (injectable Apollo service)

- `GetMonthlyComparisonQuery` result type (matches the query name "getMonthlyComparison")
- `MonthlyComparisonType` and `MonthlyStatisticsType` interfaces (from backend schema)

**Why**: Follows existing workflow (`create-finance.mutation.graphql` → codegen → use in service), ensures type safety.

**Note**: The query result type name is generated from your query name with "Query" suffix. So `query getMonthlyComparison` generates `GetMonthlyComparisonQuery`.

---

### Phase 3: Frontend - Service Layer

#### Step 3.1: Extend FinanceRecordService

**File**: `frontend/src/app/models/finance-record/finance-record-service.ts`

Add to the existing `FinanceRecordService` class:

```typescript
import { GetMonthlyComparisonGQL, GetMonthlyComparisonQuery } from '../../../generated/graphql';

// Inside the FinanceRecordService class:

private readonly getMonthlyComparisonGQL = inject(GetMonthlyComparisonGQL);

private readonly _monthlyComparison = signal<
  GetMonthlyComparisonQuery['monthlyComparison'] | null
>(null);
readonly monthlyComparison: Signal<GetMonthlyComparisonQuery['monthlyComparison'] | null> =
  this._monthlyComparison.asReadonly();

/**
 * Fetch monthly comparison data for a date range
 * @param startDate - Optional start date (defaults to 12 months ago)
 * @param endDate - Optional end date (defaults to today)
 */
async getMonthlyComparison(startDate?: Date, endDate?: Date): Promise<void> {
  this._loading.set(true);
  this._error.set(null);

  try {
    const result = await firstValueFrom(
      this.getMonthlyComparisonGQL.fetch({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      })
    );

    if (result?.data?.monthlyComparison) {
      this._monthlyComparison.set(result.data.monthlyComparison);
    } else {
      this._error.set('Failed to fetch monthly comparison data');
    }
  } catch (error) {
    console.error('Error fetching monthly comparison:', error);
    this._error.set('Failed to fetch monthly comparison data');
  } finally {
    this._loading.set(false);
  }
}
```

**Why**: Follows exact pattern used in `getFinanceRecords`, uses signals for reactive state, integrates with existing loading/error states.

---

### Phase 4: Frontend - UI Component

#### Step 4.1: Create Component Structure

**Files**:

- `frontend/src/app/components/analytics/monthly-comparison-component/monthly-comparison-component.ts`
- `frontend/src/app/components/analytics/monthly-comparison-component/monthly-comparison-component.html`
- `frontend/src/app/components/analytics/monthly-comparison-component/monthly-comparison-component.css`

Create the new `analytics` directory if it doesn't exist:

```bash
mkdir -p frontend/src/app/components/analytics/monthly-comparison-component
```

---

#### Step 4.2: Component TypeScript

**File**: `frontend/src/app/components/analytics/monthly-comparison-component/monthly-comparison-component.ts`

```typescript
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FinanceRecordService } from '../../../models/finance-record/finance-record-service';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';

@Component({
  selector: 'app-monthly-comparison',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FlexComponent,
  ],
  templateUrl: './monthly-comparison-component.html',
  styleUrl: './monthly-comparison-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyComparisonComponent implements OnInit {
  private readonly financeRecordService = inject(FinanceRecordService);
  private readonly formBuilder = inject(FormBuilder);

  readonly loading = computed(() => this.financeRecordService.loading());
  readonly error = computed(() => this.financeRecordService.error());
  readonly comparisonData = computed(() => this.financeRecordService.monthlyComparison());

  readonly displayedColumns = [
    'month',
    'income',
    'expense',
    'net',
    'transactions',
    'average',
    'recurring',
  ];

  readonly dateRangeForm = this.formBuilder.group({
    startDate: [this.getDefaultStartDate()],
    endDate: [new Date()],
  });

  readonly monthlyDataRows = computed(() => {
    const data = this.comparisonData()?.monthlyData;
    if (!data) return [];

    return data.map((month) => ({
      monthLabel: this.formatMonthLabel(month.year, month.month),
      ...month,
    }));
  });

  readonly summaryStats = computed(() => {
    const data = this.comparisonData();
    if (!data) return null;

    return {
      totalMonths: data.totalMonthsAnalyzed,
      avgIncome: data.overallAverageIncome,
      avgExpense: data.overallAverageExpense,
      highestMonth: data.highestSpendingMonth
        ? this.formatMonthLabel(data.highestSpendingMonth.year, data.highestSpendingMonth.month)
        : 'N/A',
      lowestMonth: data.lowestSpendingMonth
        ? this.formatMonthLabel(data.lowestSpendingMonth.year, data.lowestSpendingMonth.month)
        : 'N/A',
    };
  });

  async ngOnInit(): Promise<void> {
    await this.loadComparison();
  }

  async loadComparison(): Promise<void> {
    const { startDate, endDate } = this.dateRangeForm.value;
    await this.financeRecordService.getMonthlyComparison(
      startDate ?? this.getDefaultStartDate(),
      endDate ?? new Date(),
    );
  }

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    return date;
  }

  private formatMonthLabel(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  getPercentageChange(current: number, previous: number): string {
    if (previous === 0) return 'N/A';
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  }

  getTrendIcon(current: number, previous: number): string {
    return current > previous ? 'trending_up' : 'trending_down';
  }
}
```

**Why**:

- Uses signals and computed for reactive state (Angular 20 zoneless pattern)
- Follows existing component patterns (`BalanceComponent`, `MonthlyRecapComponent`)
- Provides date range filtering similar to backend query parameters
- Includes helper methods for formatting and trend calculation

---

#### Step 4.3: Component Template

**File**: `frontend/src/app/components/analytics/monthly-comparison-component/monthly-comparison-component.html`

```html
<mat-card appearance="outlined" class="comparison-card">
  <mat-card-header>
    <mat-icon mat-card-avatar>analytics</mat-icon>
    <mat-card-title>Month-over-Month Comparison</mat-card-title>
    <mat-card-subtitle>Analyze spending patterns across months</mat-card-subtitle>
  </mat-card-header>

  <mat-card-content>
    <!-- Date Range Filter -->
    <form [formGroup]="dateRangeForm" class="date-filter">
      <app-flex>
        <mat-form-field appearance="outline">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="loadComparison()" [disabled]="loading()">
          <mat-icon>refresh</mat-icon>
          Update
        </button>
      </app-flex>
    </form>

    <!-- Loading State -->
    @if (loading()) {
    <div class="loading-container">
      <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
      <p>Loading comparison data...</p>
    </div>
    }

    <!-- Error State -->
    @if (error()) {
    <div class="error-message">
      <mat-icon color="warn">error</mat-icon>
      <p>{{ error() }}</p>
    </div>
    }

    <!-- Summary Statistics -->
    @if (summaryStats(); as stats) {
    <div class="summary-grid">
      <mat-card appearance="outlined" class="stat-card">
        <mat-icon>calendar_today</mat-icon>
        <div class="stat-value">{{ stats.totalMonths }}</div>
        <div class="stat-label">Months Analyzed</div>
      </mat-card>

      <mat-card appearance="outlined" class="stat-card">
        <mat-icon color="primary">trending_up</mat-icon>
        <div class="stat-value">{{ stats.avgIncome | currency: 'EUR' }}</div>
        <div class="stat-label">Avg Monthly Income</div>
      </mat-card>

      <mat-card appearance="outlined" class="stat-card">
        <mat-icon color="warn">trending_down</mat-icon>
        <div class="stat-value">{{ stats.avgExpense | currency: 'EUR' }}</div>
        <div class="stat-label">Avg Monthly Expense</div>
      </mat-card>

      <mat-card appearance="outlined" class="stat-card">
        <mat-icon>insights</mat-icon>
        <div class="stat-value">{{ stats.highestMonth }}</div>
        <div class="stat-label">Highest Spending</div>
      </mat-card>
    </div>
    }

    <!-- Monthly Data Table -->
    @if (monthlyDataRows().length > 0) {
    <table mat-table [dataSource]="monthlyDataRows()" class="comparison-table">
      <!-- Month Column -->
      <ng-container matColumnDef="month">
        <th mat-header-cell *matHeaderCellDef>Month</th>
        <td mat-cell *matCellDef="let row">{{ row.monthLabel }}</td>
      </ng-container>

      <!-- Income Column -->
      <ng-container matColumnDef="income">
        <th mat-header-cell *matHeaderCellDef>Income</th>
        <td mat-cell *matCellDef="let row" class="positive">
          {{ row.totalIncome | currency: 'EUR' }}
        </td>
      </ng-container>

      <!-- Expense Column -->
      <ng-container matColumnDef="expense">
        <th mat-header-cell *matHeaderCellDef>Expenses</th>
        <td mat-cell *matCellDef="let row" class="negative">
          {{ row.totalExpense | currency: 'EUR' }}
        </td>
      </ng-container>

      <!-- Net Column -->
      <ng-container matColumnDef="net">
        <th mat-header-cell *matHeaderCellDef>Net</th>
        <td
          mat-cell
          *matCellDef="let row"
          [class.positive]="row.netAmount >= 0"
          [class.negative]="row.netAmount < 0"
        >
          {{ row.netAmount | currency: 'EUR' }}
        </td>
      </ng-container>

      <!-- Transactions Column -->
      <ng-container matColumnDef="transactions">
        <th mat-header-cell *matHeaderCellDef>Transactions</th>
        <td mat-cell *matCellDef="let row">{{ row.transactionCount }}</td>
      </ng-container>

      <!-- Average Column -->
      <ng-container matColumnDef="average">
        <th mat-header-cell *matHeaderCellDef>Avg Transaction</th>
        <td mat-cell *matCellDef="let row">{{ row.averageTransactionAmount | currency: 'EUR' }}</td>
      </ng-container>

      <!-- Recurring Column -->
      <ng-container matColumnDef="recurring">
        <th mat-header-cell *matHeaderCellDef>Recurring Total</th>
        <td mat-cell *matCellDef="let row">
          {{ (row.recurringIncomeTotal + row.recurringExpenseTotal) | currency: 'EUR' }}
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
    }

    <!-- Empty State -->
    @if (!loading() && !error() && monthlyDataRows().length === 0) {
    <div class="empty-state">
      <mat-icon>insights</mat-icon>
      <p>No data available for the selected date range</p>
      <button mat-raised-button color="primary" (click)="loadComparison()">Try Again</button>
    </div>
    }
  </mat-card-content>
</mat-card>
```

**Why**:

- Material Design components match existing UI
- Conditional rendering with `@if` (Angular 17+ control flow)
- Displays summary stats + detailed table
- Empty and error states for UX completeness

---

#### Step 4.4: Component Styles

**File**: `frontend/src/app/components/analytics/monthly-comparison-component/monthly-comparison-component.css`

```css
.comparison-card {
  margin: 1rem;
  max-width: 1400px;
}

.date-filter {
  margin-bottom: 1.5rem;
}

.date-filter app-flex {
  gap: 1rem;
  align-items: flex-end;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #fef2f2;
  border-radius: 4px;
  color: #991b1b;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1rem;
  text-align: center;
}

.stat-card mat-icon {
  font-size: 2rem;
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.comparison-table {
  width: 100%;
  margin-top: 1rem;
}

.comparison-table .positive {
  color: #059669;
  font-weight: 500;
}

.comparison-table .negative {
  color: #dc2626;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: #6b7280;
}

.empty-state mat-icon {
  font-size: 4rem;
  width: 4rem;
  height: 4rem;
  opacity: 0.5;
}
```

**Why**: Follows existing design patterns, responsive grid layout, clear visual hierarchy, accessible color contrast.

---

### Phase 5: Integration & Routing

#### Step 5.1: Add Route

**File**: `frontend/src/app/app.routes.ts`

Add the new route to the routes array:

```typescript
import { MonthlyComparisonComponent } from './components/analytics/monthly-comparison-component/monthly-comparison-component';

export const routes: Routes = [
  // ... existing routes ...
  {
    path: 'analytics/monthly-comparison',
    component: MonthlyComparisonComponent,
    canActivate: [authGuard],
  },
  // ... other routes ...
];
```

**Why**: Protected route (requires authentication via `authGuard`), follows RESTful path convention.

---

#### Step 5.2: Add Navigation Link

**File**: `frontend/src/app/components/side-nav-component/side-nav-component.html` (or wherever navigation is defined)

Add a navigation item:

```html
<a mat-list-item routerLink="/analytics/monthly-comparison" routerLinkActive="active">
  <mat-icon matListItemIcon>analytics</mat-icon>
  <span matListItemTitle>Monthly Comparison</span>
</a>
```

**Why**: Makes the feature discoverable in the main navigation, follows Material nav list pattern.

---

### Phase 6: Testing & Validation

#### Step 6.1: Manual Testing Checklist

1. **Backend**:

   - [ ] Start backend: `cd PhantomDave.BankTracking.Api && dotnet run`
   - [ ] Verify database connection (Postgres running via `docker compose -f compose.dev.yaml up -d database`)
   - [ ] Test GraphQL query in Banana Cake Pop (http://localhost:5095/graphql):
     ```graphql
     query {
       monthlyComparison(startDate: "2024-01-01T00:00:00Z") {
         totalMonthsAnalyzed
         monthlyData {
           year
           month
           totalIncome
           totalExpense
         }
       }
     }
     ```

2. **Frontend**:

   - [ ] Start frontend: `cd frontend && npm run start`
   - [ ] Verify codegen runs successfully
   - [ ] Login and navigate to `/analytics/monthly-comparison`
   - [ ] Test date range filtering
   - [ ] Verify loading states appear
   - [ ] Check error handling (disconnect backend and retry)
   - [ ] Validate responsive layout on mobile viewport

3. **Data Integrity**:
   - [ ] Create test transactions spanning multiple months
   - [ ] Verify aggregations match manual calculations
   - [ ] Test with edge cases:
     - No transactions in date range
     - Single month with transactions
     - Months with only income or only expenses
     - Recurring vs non-recurring breakdown

---

#### Step 6.2: Error Scenarios to Test

- [ ] Unauthenticated request (should redirect to login)
- [ ] Invalid date range (end before start)
- [ ] Network timeout
- [ ] Empty account (no finance records)
- [ ] Backend service unavailable

---

### Phase 7: Future Enhancements

#### Potential Additions (Post-MVP)

1. **Category Breakdown**: Once categories are added to `FinanceRecord`, show spending by category within each month
2. **Visualization**: Integrate Chart.js for bar/line charts showing trends
   ```typescript
   // Example library: ng2-charts
   import { BaseChartDirective } from 'ng2-charts';
   ```
3. **Export Functionality**: Download comparison data as CSV/Excel
4. **Budget Comparison**: Overlay budget targets on actual spending
5. **Year-over-Year**: Compare same months across different years (e.g., March 2024 vs March 2025)
6. **Trend Indicators**: Show percentage change month-to-month with visual arrows
7. **Anomaly Detection**: Highlight months with unusual spending patterns

---

## Key Design Decisions

### Why Not Client-Side Aggregation?

- Backend handles heavy lifting → better performance
- Reduces data transfer (only aggregated results sent to client)
- Easier to extend with complex calculations (e.g., percentiles, rolling averages)
- Maintains separation of concerns (business logic in service layer)

### Why Signals Over RxJS?

- Angular 20 uses zoneless change detection
- Existing codebase (`FinanceRecordService`, `BalanceComponent`) uses signals extensively
- Better performance for frequently updating computed values
- Cleaner syntax for reactive dependencies

### Why Not a Separate Backend Service?

- `FinanceRecordService` already has data access logic
- Avoids duplication (reuses `GetFinanceRecordsForAccountAsync`)
- Aggregation logic is a natural extension of finance record operations
- Follows single responsibility (finance records → finance analytics)

### Default Date Range (12 Months)

- Provides immediate value without configuration
- Common use case for personal finance tracking
- Can be overridden via UI date pickers
- Matches patterns in similar financial apps (Mint, YNAB)

---

## Migration Path

### No Database Changes Required

This feature uses existing `FinanceRecord` schema with no new columns or tables. All aggregation happens at query time.

### Schema Evolution

```graphql
# Current: getFinanceRecords returns individual records
query {
  financeRecordsForAccount {
    id
    amount
    date
  }
}

# New: monthlyComparison returns aggregated data
query {
  monthlyComparison(startDate: "2024-01-01", endDate: "2024-12-31") {
    monthlyData {
      year
      month
      totalIncome
      totalExpense
    }
  }
}
```

Both queries coexist without breaking changes.

---

## Deployment Considerations

### Backend

- No environment variable changes needed
- Uses existing JWT authentication
- No new database migrations
- Compatible with current Docker setup

### Frontend

- Run `npm run codegen` during build step (already in `prestart` script)
- No new npm dependencies required for MVP
- Static assets unchanged
- Works with existing nginx config

### Rollback Plan

- Feature is additive (no breaking changes)
- Remove route from `app.routes.ts` to hide feature
- Delete component directory to fully remove
- Backend query remains backward-compatible even if unused

---

## Success Metrics

### Functional

- [x] Query returns correct aggregated data for test account
- [x] UI displays monthly comparison table
- [x] Date range filtering works correctly
- [x] Loading and error states display appropriately

### Non-Functional

- [x] Query response time < 2 seconds for 12 months of data
- [x] Frontend renders without console errors
- [x] Component follows Angular style guide
- [x] Code passes existing linting rules (`npm run lint`)

---

## Timeline Estimate

| Phase                             | Estimated Time |
| --------------------------------- | -------------- |
| Backend (Types + Service + Query) | 2-3 hours      |
| Frontend (GraphQL + Service)      | 1-2 hours      |
| Frontend (Component + Styles)     | 3-4 hours      |
| Routing + Integration             | 30 minutes     |
| Testing & Bug Fixes               | 2-3 hours      |
| **Total**                         | **8-12 hours** |

---

## References

### Existing Patterns to Follow

- **Backend Query**: `GetFinanceRecordsForAccount` in `FinanceRecordQueries.cs`
- **Service Method**: `CreateFinanceRecordAsync` in `FinanceRecordService.cs`
- **Frontend Component**: `BalanceComponent` for signal usage
- **GraphQL Operation**: `get-finance-record.query.graphql`
- **Routing**: `app.routes.ts` with `authGuard`

### Documentation

- [HotChocolate Queries](https://chillicream.com/docs/hotchocolate/v13/fetching-data/queries)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Apollo Angular](https://apollo-angular.com/docs/)
- [Material Design Components](https://material.angular.io/components/categories)

---

## Conclusion

This plan provides a complete, production-ready implementation of month-over-month comparison following BankTracker's established architecture patterns. The feature:

- ✅ Reuses existing infrastructure
- ✅ Maintains type safety end-to-end
- ✅ Follows DRY and YAGNI principles
- ✅ Provides immediate user value
- ✅ Sets foundation for advanced analytics features

**Next Steps**: Begin with Phase 1 (Backend) to ensure data layer is solid before building UI.
