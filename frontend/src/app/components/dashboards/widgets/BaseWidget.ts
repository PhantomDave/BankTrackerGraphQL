import { Widget } from '../../../models/dashboards/gridster-item';
import { WidgetType } from '../../../../generated/graphql';

export abstract class BaseWidget implements Widget {
  x: number;
  y: number;
  cols: number;
  rows: number;
  id?: number;
  config: string;
  type!: WidgetType;

  // Abstract properties that each widget must define
  abstract readonly minCols: number;
  abstract readonly minRows: number;

  protected constructor(init?: Partial<BaseWidget>, minCols: number = 1, minRows: number = 1) {
    this.x = init?.x ?? 0;
    this.y = init?.y ?? 0;
    this.cols = init?.cols ?? minCols;
    this.rows = init?.rows ?? minRows;
    this.id = init?.id;
    this.config = init?.config ?? '';
    if (init?.type) {
      this.type = init.type;
    }
  }

  getTypedConfig<T extends BaseWidgetConfig>(): T | undefined {
    return this.config ? JSON.parse(this.config) : undefined;
  }

  setTypedConfig(config: BaseWidgetConfig): void {
    this.config = JSON.stringify(config);
  }

  getType(): WidgetType {
    return this.type;
  }
}

export interface BaseWidgetConfig {
  title?: string;
  subtitle?: string;
}
