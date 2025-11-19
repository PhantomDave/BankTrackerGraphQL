import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FinanceRecordService } from '../../../models/finance-record/finance-record-service';
import { AddEntry } from '../add-entry/add-entry';
import { FinanceRecord } from '../../../models/finance-record/finance-record';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-financial-table',
  imports: [
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DatePipe,
    CurrencyPipe,
    MatPaginatorModule,
  ],
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FinancialTableComponent implements AfterViewInit {
  private readonly dialog = inject(MatDialog);
  private readonly financeRecordService = inject(FinanceRecordService);

  readonly title = input<string>('Financial Records');
  readonly showFooter = input<boolean>(true);

  readonly loading = input<boolean>(false);
  readonly records = input<readonly FinanceRecord[]>([]);
  readonly dataSource = new MatTableDataSource<FinanceRecord>([]);
  readonly recordCount = computed(() => this.records().length);
  readonly recurringCount = computed(
    () => this.records().filter((record) => record.recurring).length,
  );
  readonly totalAmount = computed(() =>
    this.records().reduce((sum, record) => sum + record.amount, 0),
  );
  readonly primaryCurrency = computed(() => this.records()[0]?.currency ?? 'USD');
  readonly signedTotalAmount = computed(() => {
    const total = this.totalAmount();
    const currency = this.primaryCurrency();
    return { total, currency };
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource.data = this.records() as FinanceRecord[];
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  readonly displayedColumns: string[] = [
    'name',
    'description',
    'recurring',
    'recurrenceFrequency',
    'amount',
    'date',
    'actions',
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

  async onDeleteClicked(record: FinanceRecord) {
    await this.financeRecordService.deleteFinanceRecordAsync(record.id!);
  }
  onEditClicked(record: FinanceRecord) {
    const dialogRef = this.dialog.open(AddEntry, {
      data: record,
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'add-entry-dialog',
    });

    dialogRef.afterClosed().subscribe(async (result: FinanceRecord | undefined) => {
      if (result) {
        await this.financeRecordService.updateFinanceRecord(result);
      }
    });
  }
}

export default FinancialTableComponent;
