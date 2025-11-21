# Chart Wrapper Component - Usage Guide

## Basic Usage

The `ChartWrapperComponent` provides a signal-based, type-safe wrapper for ApexCharts.

### Import the Component

```typescript
import { ChartWrapperComponent, ChartOptions } from './components/ui-library/chart-wrapper-component/chart-wrapper-component.component';
```

### Example 1: Line Chart (Monthly Income/Expense)

```typescript
import { Component, computed, signal } from '@angular/core';
import { ChartWrapperComponent, ChartOptions } from './components/ui-library/chart-wrapper-component/chart-wrapper-component.component';

@Component({
  selector: 'app-finance-chart',
  imports: [ChartWrapperComponent],
  template: `
    <app-chart [chartOptions]="lineChartOptions()" />
  `
})
export class FinanceChartComponent {
  private monthlyData = signal([
    { month: 'Jan', income: 5000, expense: -3500 },
    { month: 'Feb', income: 5200, expense: -3800 },
    { month: 'Mar', income: 4800, expense: -3200 },
  ]);

  lineChartOptions = computed<ChartOptions>(() => ({
    series: [
      {
        name: 'Income',
        data: this.monthlyData().map(d => d.income),
      },
      {
        name: 'Expenses',
        data: this.monthlyData().map(d => Math.abs(d.expense)),
      },
    ],
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: true,
      },
    },
    xaxis: {
      categories: this.monthlyData().map(d => d.month),
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: ['#059669', '#dc2626'],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'top',
    },
  }));
}
```

### Example 2: Bar Chart (Category Breakdown)

```typescript
barChartOptions = computed<ChartOptions>(() => ({
  series: [
    {
      name: 'Spending',
      data: [1200, 800, 600, 400, 300],
    },
  ],
  chart: {
    type: 'bar',
    height: 350,
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
    },
  },
  xaxis: {
    categories: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'],
  },
  colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
  dataLabels: {
    enabled: true,
    formatter: (val) => `€${val}`,
  },
}));
```

### Example 3: Donut Chart (Budget Allocation)

```typescript
donutChartOptions = computed<ChartOptions>(() => ({
  series: [44, 55, 13, 33],
  chart: {
    type: 'donut',
    height: 350,
  },
  labels: ['Rent', 'Groceries', 'Entertainment', 'Savings'],
  colors: ['#dc2626', '#059669', '#3b82f6', '#f59e0b'],
  legend: {
    position: 'bottom',
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`,
  },
}));
```

### Example 4: Area Chart (Account Balance Over Time)

```typescript
areaChartOptions = computed<ChartOptions>(() => ({
  series: [
    {
      name: 'Balance',
      data: [10000, 12000, 11500, 13000, 15000, 14800],
    },
  ],
  chart: {
    type: 'area',
    height: 350,
    zoom: {
      enabled: true,
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
  stroke: {
    curve: 'smooth',
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
  colors: ['#059669'],
  dataLabels: {
    enabled: false,
  },
}));
```

## Advanced Features

### Dynamic Data Updates

The chart automatically updates when signal data changes:

```typescript
export class DynamicChartComponent {
  private financeRecordService = inject(FinanceRecordService);
  
  // Chart auto-updates when records change
  chartOptions = computed<ChartOptions>(() => {
    const records = this.financeRecordService.financeRecords();
    
    return {
      series: [{
        name: 'Transactions',
        data: records.map(r => r.amount),
      }],
      chart: {
        type: 'line',
        height: 350,
      },
      xaxis: {
        categories: records.map(r => new Date(r.date).toLocaleDateString()),
      },
    };
  });
}
```

### Custom Dimensions

```html
<app-chart 
  [chartOptions]="myChartOptions()" 
  [height]="500"
  [width]="'80%'"
/>
```

### Multiple Charts in One Component

```typescript
export class DashboardComponent {
  incomeChartOptions = computed<ChartOptions>(() => ({ ... }));
  expenseChartOptions = computed<ChartOptions>(() => ({ ... }));
  balanceChartOptions = computed<ChartOptions>(() => ({ ... }));
}
```

```html
<app-flex [vertical]="true" [gap]="'1rem'">
  <app-chart [chartOptions]="incomeChartOptions()" />
  <app-chart [chartOptions]="expenseChartOptions()" />
  <app-chart [chartOptions]="balanceChartOptions()" />
</app-flex>
```

## Integration with Monthly Comparison

Based on your `MONTH_COMPARISON_PLAN.md`:

```typescript
// In monthly-comparison-component.ts
import { ChartWrapperComponent, ChartOptions } from '../../ui-library/chart-wrapper-component/chart-wrapper-component.component';

export class MonthlyComparisonComponent {
  private readonly financeRecordService = inject(FinanceRecordService);
  
  readonly comparisonData = computed(() => this.financeRecordService.monthlyComparison());
  
  readonly monthlyTrendChart = computed<ChartOptions>(() => {
    const data = this.comparisonData();
    if (!data) return this.getEmptyChart();
    
    return {
      series: [
        {
          name: 'Income',
          data: data.monthlyData.map(m => m.totalIncome),
        },
        {
          name: 'Expenses',
          data: data.monthlyData.map(m => Math.abs(m.totalExpense)),
        },
        {
          name: 'Net',
          data: data.monthlyData.map(m => m.netAmount),
        },
      ],
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: true },
      },
      xaxis: {
        categories: data.monthlyData.map(m => 
          new Date(m.year, m.month - 1).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          })
        ),
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      colors: ['#059669', '#dc2626', '#3b82f6'],
      legend: {
        position: 'top',
      },
      yaxis: {
        labels: {
          formatter: (val) => `€${val.toFixed(0)}`,
        },
      },
    };
  });
  
  private getEmptyChart(): ChartOptions {
    return {
      series: [],
      chart: { type: 'line', height: 350 },
    };
  }
}
```

```html
<!-- In monthly-comparison-component.html -->
<mat-card appearance="outlined">
  <mat-card-header>
    <mat-card-title>Monthly Trends</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    @if (comparisonData()) {
      <app-chart [chartOptions]="monthlyTrendChart()" />
    } @else {
      <p>No data available</p>
    }
  </mat-card-content>
</mat-card>
```

## Chart Types Supported

- `line` - Line charts
- `area` - Area charts
- `bar` - Bar charts (vertical/horizontal)
- `pie` - Pie charts
- `donut` - Donut charts
- `radialBar` - Radial bar charts
- `scatter` - Scatter plots
- `bubble` - Bubble charts
- `heatmap` - Heatmaps
- `candlestick` - Financial candlestick charts
- `radar` - Radar charts

## TypeScript Benefits

Full type safety with the `ChartOptions` type:

```typescript
// TypeScript catches errors at compile time
const invalidOptions: ChartOptions = {
  series: [{ name: 'Data', data: [1, 2, 3] }],
  chart: { type: 'invalidType' }, // ❌ Type error!
};

// Auto-completion for all ApexCharts options
const validOptions: ChartOptions = {
  series: [{ name: 'Data', data: [1, 2, 3] }],
  chart: { type: 'line', height: 350 }, // ✅ Full IntelliSense support
  stroke: { curve: 'smooth' }, // ✅ Auto-complete available
};
```

## Common Patterns

### Responsive Charts

```typescript
chartOptions = computed<ChartOptions>(() => ({
  series: [...],
  chart: {
    type: 'line',
    height: 350,
    // Responsive breakpoints
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: { position: 'bottom' },
          chart: { height: 300 },
        },
      },
    ],
  },
}));
```

### Currency Formatting

```typescript
chartOptions = computed<ChartOptions>(() => ({
  // ...
  yaxis: {
    labels: {
      formatter: (val) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(val),
    },
  },
  tooltip: {
    y: {
      formatter: (val) => `€${val.toFixed(2)}`,
    },
  },
}));
```
