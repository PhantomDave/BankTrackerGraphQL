import {FinanceRecordService} from '../../../models/finance-record/finance-record-service';
import {Component, inject} from '@angular/core';
import MovementsTableComponent from '../monthly-recap-component/movements-component';
import RecurringMovementsComponent from '../recurring-movements/recurring-movements.component';
import {FlexComponent} from '../../ui-library/flex-component/flex-component';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css'],
  imports: [MovementsTableComponent, RecurringMovementsComponent, FlexComponent],
})
export class TrackingComponent {
  readonly financeRecordService = inject(FinanceRecordService);

  readonly loading = this.financeRecordService.loading;
  readonly records = this.financeRecordService.financeRecords;
}
