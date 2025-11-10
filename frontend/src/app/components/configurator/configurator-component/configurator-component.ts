import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
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
  templateUrl: './configurator-component.html',
  styleUrl: './configurator-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfiguratorComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly financeRecordService = inject(FinanceRecordService);

  readonly loading = computed(() => this.financeRecordService.loading());
  readonly data = computed(() => this.financeRecordService.financeRecords());

  async ngOnInit(): Promise<void> {
    await this.financeRecordService.getFinanceRecords();
  }

  displayedColumns: string[] = ['name', 'description', 'recurring', 'amount', 'date'];

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

export default ConfiguratorComponent;
