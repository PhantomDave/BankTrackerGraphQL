import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
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
import {
  ChartOptions,
  ChartWrapperComponent,
} from '../../ui-library/chart-wrapper-component/chart-wrapper-component.component';

@Component({
  selector: 'app-monthly-comparison',
  standalone: true,
  imports: [
    CurrencyPipe,
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
    ChartWrapperComponent,
  ],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './monthly-comparison-component.html',
  styleUrl: './monthly-comparison-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyComparisonComponent implements OnInit {
  private readonly financeRecordService = inject(FinanceRecordService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);

  readonly loading = computed(() => this.financeRecordService.loading());
  readonly error = computed(() => this.financeRecordService.error());
  readonly comparisonData = computed(() => this.financeRecordService.monthlyComparison());

  readonly chartOptions = computed<ChartOptions>(() => {
    const data = this.comparisonData()?.monthlyData || [];
    const netValues = data.map((month) => month.netAmount);
    const positiveColor = this.getCssVar('--bt-positive');
    const negativeColor = this.getCssVar('--bt-negative');

    return {
      series: [
        {
          name: 'Net Balance',
          data: netValues,
        },
      ],
      chart: {
        height: 350,
        type: 'line',
      },
      title: {
        text: 'Net Balance Over Time',
      },
      xaxis: {
        categories: data.map((month) => this.formatMonthLabel(month.year, month.month)),
      },
      yaxis: {
        labels: {
          formatter: (value) => this.currencyPipe.transform(value, 'EUR', 'symbol', '1.0-0') ?? '',
        },
      },
      stroke: {
        curve: 'monotoneCubic',
        width: 3,
      },

      dataLabels: {
        enabled: false,
      },
      grid: {
        strokeDashArray: 4,
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value) => this.currencyPipe.transform(value, 'EUR', 'symbol', '1.0-2') ?? '',
        },
      },
      annotations: {
        yaxis: [
          {
            y: 0,
            borderColor: positiveColor,
            strokeDashArray: 8,
            label: {
              text: 'Break Even',
              style: {
                color: 'var(--mat-sys-on-surface)',
                background: 'var(--mat-sys-surface-variant)',
              },
            },
          },
        ],
      },
      markers: {
        size: 5,
        discrete: netValues.map((value, index) => ({
          seriesIndex: 0,
          dataPointIndex: index,
          fillColor: value >= 0 ? positiveColor : negativeColor,
          size: 5,
        })),
        strokeColors: 'var(--mat-sys-surface)',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
    };
  });

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
        ? this.datePipe.transform(
            new Date(data.highestSpendingMonth.year, data.highestSpendingMonth.month - 1, 1),
            'MMM yyyy',
          )
        : 'N/A',
      lowestMonth: data.lowestSpendingMonth
        ? this.datePipe.transform(
            new Date(data.lowestSpendingMonth.year, data.lowestSpendingMonth.month - 1, 1),
            'MMM yyyy',
          )
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

  private getCssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '';
  }

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    date.setDate(1);
    return date;
  }

  private formatMonthLabel(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return this.datePipe.transform(date, 'MMM yyyy') ?? '';
  }
}
