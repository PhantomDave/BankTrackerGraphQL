import { GridsterItem } from 'angular-gridster2';

export interface Widget extends GridsterItem {
  x: number;
  y: number;
  cols: number;
  rows: number;
  // Custom properties
  id?: number;
  type?: WidgetType;
  config?: string;
}

export enum WidgetType {
  CurrentBalance,
  NetGraph,
  Placeholder,
}
