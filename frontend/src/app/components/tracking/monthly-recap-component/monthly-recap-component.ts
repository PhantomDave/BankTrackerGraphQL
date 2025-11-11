import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FinanceRecordService } from '../../../models/finance-record/finance-record-service';
import { AddEntry } from '../add-entry/add-entry';
import { FinanceRecord } from '../../../models/finance-record/finance-record';

@Component({
  selector: 'app-configurator',
  imports: [
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './monthly-recap-component.html',
  styleUrl: './monthly-recap-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MonthlyRecapComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly financeRecordService = inject(FinanceRecordService);
  private readonly locale = inject(LOCALE_ID);

  readonly loading = computed(() => this.financeRecordService.loading());
  readonly data = computed(() => this.financeRecordService.financeRecords());
  readonly recordCount = computed(() => this.data().length);
  readonly recurringCount = computed(() => this.data().filter((record) => record.recurring).length);
  readonly totalAmount = computed(() =>
    this.data().reduce((sum, record) => sum + record.amount, 0),
  );
  readonly primaryCurrency = computed(() => this.data()[0]?.currency ?? 'USD');
  readonly signedTotalAmount = computed(() => {
    const total = this.totalAmount();
    const currency = this.primaryCurrency();
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
    }).format(total);
  });

  async ngOnInit(): Promise<void> {
    await this.financeRecordService.getFinanceRecords();
  }

  readonly displayedColumns: string[] = [
    'name',
    'description',
    'recurring',
    'recurrenceFrequency',
    'amount',
    'date',
  ];

  async onCreateClicked(): Promise<void> {
    const dialogRef = this.dialog.open(AddEntry, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'add-entry-dialog',
    });

    dialogRef.afterClosed().subscribe(async (result: FinanceRecord | undefined) => {
      if (result) {
        await this.financeRecordService.createFinanceRecord(result);
      }
    });
  }
}

export default MonthlyRecapComponent;
