import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import {
  ChartOptions,
  ChartWrapperComponent,
} from '../../components/ui-library/chart-wrapper-component/chart-wrapper-component.component';
import { WidgetWrapperComponent } from '../widget-wrapper/widget-wrapper.component';
import { FinanceRecordService } from '../../models/finance-record/finance-record-service';

@Component({
  selector: 'app-widget-net-graph',
  templateUrl: './widget-net-graph.component.html',
  styleUrls: ['./widget-net-graph.component.css'],
  imports: [WidgetWrapperComponent, ChartWrapperComponent],
  providers: [CurrencyPipe, DatePipe],
})
export class WidgetNetGraphComponent implements OnInit {
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);
  private readonly financeRecords = inject(FinanceRecordService);

  startDate = input(this.getDefaultStartDate());
  endDate = input(new Date());
  isEditMode = input<boolean>(false);

  readonly loading = computed(() => this.financeRecords.loading());
  readonly error = computed(() => this.financeRecords.error());
  readonly comparisonData = computed(() => this.financeRecords.monthlyComparison());

  ngOnInit() {
    this.financeRecords.getMonthlyComparison(this.startDate(), this.endDate());
  }

  readonly chartOptions = computed<ChartOptions>(() => {
    const data = this.comparisonData()?.monthlyData || [];
    const netValues = data.map((month) => month.netAmount);
    const positiveColor = this.getCssVar('--bt-positive') || '#059669';
    const negativeColor = this.getCssVar('--bt-negative') || '#dc2626';

    return {
      series: [
        {
          name: 'Net Balance',
          data: netValues,
        },
      ],
      chart: {
        height: 350,
        type: 'line',
      },
      title: {
        text: 'Net Balance Over Time',
      },
      xaxis: {
        categories: data.map((month) => this.formatMonthLabel(month.year, month.month)),
      },
      yaxis: {
        labels: {
          formatter: (value: number) =>
            this.currencyPipe.transform(value, 'EUR', 'symbol', '1.0-0') ?? '',
        },
      },
      stroke: {
        curve: 'monotoneCubic',
        width: 3,
      },

      dataLabels: {
        enabled: false,
      },
      grid: {
        strokeDashArray: 4,
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value: number) =>
            this.currencyPipe.transform(value, 'EUR', 'symbol', '1.0-2') ?? '',
        },
      },
      annotations: {
        yaxis: [
          {
            y: 0,
            borderColor: positiveColor,
            strokeDashArray: 8,
            label: {
              text: 'Break Even',
              style: {
                color: 'var(--mat-sys-on-surface)',
                background: 'var(--mat-sys-surface-variant)',
              },
            },
          },
        ],
      },
      markers: {
        size: 5,
        discrete: netValues.map((value, index) => ({
          seriesIndex: 0,
          dataPointIndex: index,
          fillColor: value >= 0 ? positiveColor : negativeColor,
          size: 5,
        })),
        strokeColors: 'var(--mat-sys-surface)',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
    };
  });

  private getCssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '';
  }

  private formatMonthLabel(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return this.datePipe.transform(date, 'MMM yyyy') ?? '';
  }

  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    date.setDate(1);
    return date;
  }
}
