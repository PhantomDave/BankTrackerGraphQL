import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.css'],
  imports: [MatDatepickerModule, MatFormFieldModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePickerComponent {
  readonly label = input<string>('Enter a date range');
  readonly startPlaceholder = input<string>('Start date');
  readonly endPlaceholder = input<string>('End date');

  readonly startDate = model<Date | null>(null);
  readonly endDate = model<Date | null>(null);
}
