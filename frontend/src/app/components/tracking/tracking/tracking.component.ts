import { FinanceRecordService } from '../../../models/finance-record/finance-record-service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  OnInit,
} from '@angular/core';
import MovementsTableComponent from '../monthly-recap-component/movements-component';
import RecurringMovementsComponent from '../recurring-movements/recurring-movements.component';
import { FlexComponent } from '../../ui-library/flex-component/flex-component';
import { DateRangePickerComponent } from '../../ui-library/date-range-picker/date-range-picker.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css'],
  imports: [
    MovementsTableComponent,
    RecurringMovementsComponent,
    FlexComponent,
    DateRangePickerComponent,
    MatCardModule,
    MatProgressSpinner,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackingComponent implements OnInit {
  readonly financeRecordService = inject(FinanceRecordService);

  readonly loading = computed(() => this.financeRecordService.loading());
  readonly records = computed(() =>
    this.financeRecordService.financeRecords().filter((record) => !record.recurring),
  );
  readonly recurringRecords = computed(() => this.financeRecordService.recurringFinanceRecords());

  readonly startDate = model(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly endDate = model(new Date());

  constructor() {
    effect(() => {
      const start = this.startDate();
      const end = this.endDate();

      if (start && end) {
        this.financeRecordService.getFinanceRecords(start, end);
      }
    });
  }

  ngOnInit(): void {
    this.financeRecordService.getAllRecurringFinanceRecords();
  }
}
