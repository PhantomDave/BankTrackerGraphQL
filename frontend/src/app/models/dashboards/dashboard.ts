import { WidgetType } from '../../../generated/graphql';

export interface DashboardWidget {
  id: number;
  widgetType: WidgetType;
  title?: string | null;
  subtitle?: string | null;
  config?: string | null;
  cols: number;
  rows: number;
  x: number;
  y: number;
}

export interface Dashboard {
  id: number;
  name?: string | null;
  widgets: DashboardWidget[];
}
