import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../models/account/account-service';
import { FinanceRecord } from '../../models/finance-record/finance-record';
import { FinanceRecordService } from '../../models/finance-record/finance-record-service';

@Component({
  selector: 'app-balance-component',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgIf,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './balance-component.html',
  styleUrl: './balance-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceComponent implements OnInit {
  private readonly financeRecordService = inject(FinanceRecordService);
  private readonly accountService = inject(AccountService);
  private readonly records = computed<readonly FinanceRecord[]>(() =>
    this.financeRecordService.financeRecords(),
  );
  private readonly currentMonthRecords = computed(() => {
    const today = this.today;
    return this.records().filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === today.getMonth() &&
        recordDate.getFullYear() === today.getFullYear()
      );
    });
  });

  readonly loading = computed(
    () => this.financeRecordService.loading() || this.accountService.loading(),
  );
  private readonly account = computed(() => this.accountService.selectedAccount());

  readonly defaultCurrency = 'EUR';

  readonly balance = computed(() => this.account()?.currentBalance ?? 0);

  readonly today = new Date();
  private readonly daysInMonth = new Date(
    this.today.getFullYear(),
    this.today.getMonth() + 1,
    0,
  ).getDate();
  private readonly daysElapsed = Math.max(1, Math.min(this.daysInMonth, this.today.getDate()));

  readonly averageDailyExpense = computed(() => {
    const totalExpenses = this.currentMonthRecords()
      .filter((record) => record.amount < 0)
      .reduce((sum, record) => sum + record.amount, 0);
    return totalExpenses / this.daysElapsed;
  });

  readonly averageDailyIncome = computed(() => {
    const totalIncome = this.currentMonthRecords()
      .filter((record) => record.amount > 0)
      .reduce((sum, record) => sum + record.amount, 0);
    return totalIncome / this.daysElapsed;
  });

  readonly totalRecurringExpenses = computed(() => {
    return this.records()
      .filter((record) => record.recurring && record.amount < 0)
      .reduce((sum, record) => sum + record.amount, 0);
  });

  readonly lastUpdated = signal<Date>(new Date());

  constructor() {
    effect(() => {
      this.records();
      this.account();
      this.lastUpdated.set(new Date());
    });
  }

  readonly endOfMonthPrediction = computed(() => {
    const remainingDays = Math.max(0, this.daysInMonth - this.daysElapsed);
    const projectedDailyNet = this.averageDailyIncome() + this.averageDailyExpense();
    return this.balance() + projectedDailyNet * remainingDays;
  });

  async ngOnInit(): Promise<void> {
    await this.financeRecordService.getFinanceRecords();
    await this.accountService.getUserAccount();
  }
}
