import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  stroke?: ApexStroke;
  dataLabels?: ApexDataLabels;
  legend?: ApexLegend;
  colors?: string[];
  tooltip?: ApexTooltip;
  fill?: ApexFill;
  plotOptions?: ApexPlotOptions;
  grid?: ApexGrid;
  theme?: ApexTheme;
  markers?: ApexMarkers;
  annotations?: ApexAnnotations;
};

/**
 * Reusable wrapper component for ApexCharts
 * Follows signal-based pattern used in FlexComponent
 * Supports all ApexCharts configuration options
 * Applies Material Design theming by default
 */
@Component({
  selector: 'app-chart',
  templateUrl: './chart-wrapper-component.component.html',
  styleUrls: ['./chart-wrapper-component.component.css'],
  imports: [NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartWrapperComponent {
  /** Complete chart configuration object */
  chartOptions = input.required<ChartOptions>();

  /** Optional height override (defaults to chart.height in chartOptions) */
  height = input<string | number>();

  /** Optional width override (defaults to '100%') */
  width = input<string | number>('100%');

  /** Whether to auto-update the chart when data changes */
  autoUpdateSeries = input<boolean>(true);

  /** Merged chart options with Material Design theme defaults */
  readonly themedOptions = computed<ChartOptions>(() => {
    const options = this.chartOptions();
    return this.applyMaterialTheme(options);
  });

  private applyMaterialTheme(options: ChartOptions): ChartOptions {
    const defaults: Partial<ChartOptions> = {
      chart: {
        ...options.chart,
        background: options.chart.background ?? 'transparent',
        foreColor: options.chart.foreColor ?? 'var(--mat-sys-on-surface)',
      },
      colors: options.colors ?? ['var(--mat-sys-primary)'],
      grid: {
        borderColor: 'var(--mat-sys-outline-variant)',
        ...options.grid,
      },
      tooltip: {
        theme: 'dark',
        ...options.tooltip,
      },
    };

    // Apply themed defaults to xaxis
    if (options.xaxis) {
      defaults.xaxis = {
        ...options.xaxis,
        labels: {
          ...options.xaxis.labels,
          style: {
            colors: 'var(--mat-sys-on-surface)',
            ...options.xaxis.labels?.style,
          },
        },
        axisBorder: {
          color: 'var(--mat-sys-outline-variant)',
          ...options.xaxis.axisBorder,
        },
        axisTicks: {
          color: 'var(--mat-sys-outline-variant)',
          ...options.xaxis.axisTicks,
        },
      };
    }

    // Apply themed defaults to yaxis
    if (options.yaxis) {
      const yaxisArray = Array.isArray(options.yaxis) ? options.yaxis : [options.yaxis];
      defaults.yaxis = yaxisArray.map((axis) => ({
        ...axis,
        labels: {
          ...axis.labels,
          style: {
            colors: 'var(--mat-sys-on-surface)',
            ...axis.labels?.style,
          },
        },
      }));
      if (!Array.isArray(options.yaxis)) {
        defaults.yaxis = defaults.yaxis[0];
      }
    }

    // Apply themed defaults to title
    if (options.title) {
      defaults.title = {
        ...options.title,
        style: {
          color: 'var(--mat-sys-on-surface)',
          ...options.title.style,
        },
      };
    }

    return { ...options, ...defaults };
  }
}
