import { Component, computed, input } from '@angular/core';
import { FinanceRecord } from '../../models/finance-record/finance-record';
import { CurrencyPipe } from '@angular/common';
import { WidgetWrapperComponent } from '../widget-wrapper/widget-wrapper.component';

@Component({
  selector: 'app-widget-remaining',
  templateUrl: './widget-remaining.component.html',
  styleUrls: ['./widget-remaining.component.css'],
  imports: [CurrencyPipe, WidgetWrapperComponent],
})
export class WidgetRemainingComponent {
  readonly record = input<FinanceRecord[]>([]);
  readonly currency = computed(() => this.record()[0]?.currency || 'USD');
  readonly remainingBudget = computed(() =>
    this.record().reduce((sum, record) => sum + record.amount, 0),
  );
  readonly loading = input<boolean>(false);
}
