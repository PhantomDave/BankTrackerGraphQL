import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FinanceRecordService } from '../../models/finance-record/finance-record-service';
import { FinanceRecord } from '../../models/finance-record/finance-record';

@Component({
  selector: 'app-balance-component',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './balance-component.html',
  styleUrl: './balance-component.css',
})
export class BalanceComponent implements OnInit {
  private readonly financeRecordService = inject(FinanceRecordService);
  private readonly records = signal<readonly FinanceRecord[]>(
    this.financeRecordService.financeRecords(),
  );

  readonly defaultCurrency = 'EUR';

  readonly balance = computed(() => {
    const records = this.records();
    const total = records.reduce((sum, record) => sum + record.amount, 0);
    return total;
  });

  today = new Date();
  daysPassed = this.today.getDate();

  readonly averageDailyExpense = computed(() => {
    return (
      this.records()
        .filter((record) => {
          const recordDate = new Date(record.date);
          return (
            recordDate.getMonth() === this.today.getMonth() &&
            recordDate.getFullYear() === this.today.getFullYear()
          );
        })
        .reduce((sum, record) => {
          if (record.amount < 0) return sum + record.amount;
          return sum;
        }, 0) / this.daysPassed
    );
  });

  readonly averageDailyIncome = computed(() => {
    return (
      this.records()
        .filter((record) => {
          const recordDate = new Date(record.date);
          return (
            recordDate.getMonth() === this.today.getMonth() &&
            recordDate.getFullYear() === this.today.getFullYear()
          );
        })
        .reduce((sum, record) => {
          if (record.amount > 0) return sum + record.amount;
          return sum;
        }, 0) / 31
    );
  });

  readonly totalRecurringExpenses = computed(() => {
    return this.records()
      .filter((record) => record.recurring && record.amount < 0)
      .reduce((sum, record) => sum + record.amount, 0);
  });

  readonly lastUpdated = signal<Date>(new Date());

  constructor() {
    effect(() => {
      this.lastUpdated.set(new Date());
    });
  }

  readonly endOfMonthPrediction = computed(() => {
    const daysInMonth = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - this.daysPassed;
    return this.averageDailyExpense() * remainingDays + this.balance();
  });

  async ngOnInit(): Promise<void> {
    await this.financeRecordService.getFinanceRecords();
  }
}
