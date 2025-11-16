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
}
