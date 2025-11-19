import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FinanceRecord } from '../../../models/finance-record/finance-record';
import { FinanceRecordService } from '../../../models/finance-record/finance-record-service';
import { AddEntry } from '../add-entry/add-entry';
import FinancialTableComponent from '../financial/financial.component';

@Component({
  selector: 'app-movements-table',
  imports: [
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FinancialTableComponent,
  ],
  templateUrl: './movements-component.html',
  styleUrl: './movements-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MovementsTableComponent {
  private readonly dialog = inject(MatDialog);
  private readonly financeRecordService = inject(FinanceRecordService);

  readonly title = input<string>('Movements');
  readonly loading = input<boolean>(false);
  readonly records = input<readonly FinanceRecord[]>([]);

  readonly filteredMovements = computed(() => this.records().filter((record) => !record.recurring));

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

export default MovementsTableComponent;
