import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FinanceRecordService } from '../../models/finance-record/finance-record-service';

@Component({
  selector: 'app-balance-component',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './balance-component.html',
  styleUrl: './balance-component.css',
})
export class BalanceComponent implements OnInit {
  private readonly financeRecordService = inject(FinanceRecordService);

  readonly balance = computed(() => {
    const records = this.financeRecordService.financeRecords();
    const total = records.reduce((sum, record) => sum + record.amount, 0);
    return total;
  });

  readonly lastUpdated = signal<Date>(new Date());

  constructor() {
    effect(() => {
      const records = this.financeRecordService.financeRecords();
      this.lastUpdated.set(new Date());
    });
  }

  readonly endOfMonthPrediction = computed(() => {
    const records = this.financeRecordService.financeRecords();
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();
    const averageExpensePerDay =
      records
        .filter((record) => {
          const recordDate = new Date(record.date);
          return (
            recordDate.getMonth() === today.getMonth() &&
            recordDate.getFullYear() === today.getFullYear()
          );
        })
        .reduce((sum, record) => {
          if (record.amount < 0) return sum + record.amount;
          return sum;
        }, 0) / daysPassed;
    const remainingDays = daysInMonth - daysPassed;
    return averageExpensePerDay * remainingDays + this.balance();
  });

  async ngOnInit(): Promise<void> {
    await this.financeRecordService.getFinanceRecords();
  }
}
