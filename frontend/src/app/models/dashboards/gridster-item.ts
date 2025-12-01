import { GridsterItem } from 'angular-gridster2';
import { WidgetType } from '../../../generated/graphql';

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
