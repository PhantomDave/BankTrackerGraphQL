import { CurrencyPipe, DatePipe } from '@angular/common';
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
import { FlexComponent } from '../../components/ui-library/flex-component/flex-component';

@Component({
  selector: 'app-balance-component',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    FlexComponent,
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

  readonly currentMonthTotals = computed(() => {
    const totals = { income: 0, expense: 0 };
    for (const record of this.currentMonthRecords()) {
      if (record.amount >= 0) {
        totals.income += record.amount;
        continue;
      }
      totals.expense += record.amount;
    }
    return totals;
  });

  readonly remainingBudget = computed(() => {
    const { income, expense } = this.currentMonthTotals();
    return income + expense;
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
  private readonly averageWindowDays = 30;

  readonly averageDailyExpense = computed(() => {
    return this.currentMonthTotals().expense / this.averageWindowDays;
  });

  readonly averageDailyIncome = computed(() => {
    return this.currentMonthTotals().income / this.averageWindowDays;
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

  readonly startDate = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly endDate = signal(new Date());

  async ngOnInit(): Promise<void> {
    await this.financeRecordService.getFinanceRecords(this.startDate(), this.endDate());
    await this.accountService.getUserAccount();
  }
}
