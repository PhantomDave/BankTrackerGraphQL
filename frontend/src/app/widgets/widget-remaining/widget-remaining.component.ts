import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, output, OnInit } from '@angular/core';
import { FinanceRecordService } from '../../models/finance-record/finance-record-service';
import { WidgetWrapperComponent } from '../widget-wrapper/widget-wrapper.component';

@Component({
  selector: 'app-widget-remaining',
  templateUrl: './widget-remaining.component.html',
  styleUrls: ['./widget-remaining.component.css'],
  imports: [CurrencyPipe, WidgetWrapperComponent],
})
export class WidgetRemainingComponent implements OnInit {
  private readonly financeRecords = inject(FinanceRecordService);

  widgetId = input.required<number>();
  startDate = input(this.getDefaultStartDate());
  endDate = input(new Date());
  isEditMode = input<boolean>(false);
  delete = output<number>();

  readonly loading = computed(() => this.financeRecords.loading());
  readonly error = computed(() => this.financeRecords.error());
  readonly record = computed(() => this.financeRecords.financeRecords());
  readonly currency = computed(() => this.record()[0]?.currency || 'USD');
  readonly remainingBudget = computed(() =>
    this.record().reduce((sum, record) => sum + record.amount, 0),
  );

  ngOnInit() {
    this.financeRecords.getFinanceRecords(this.startDate(), this.endDate());
  }

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    date.setDate(1);
    return date;
  }

  protected onDeleteWidget(widgetId: number) {
    this.delete.emit(widgetId);
  }
}
