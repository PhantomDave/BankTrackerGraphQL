import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FinanceRecord } from '../../../models/finance-record/finance-record';
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

  readonly title = input<string>('Movements');
  readonly loading = input<boolean>(false);
  readonly records = input<readonly FinanceRecord[]>([]);

  readonly filteredMovements = computed(() => this.records().filter((record) => !record.recurring));
}

export default MovementsTableComponent;
