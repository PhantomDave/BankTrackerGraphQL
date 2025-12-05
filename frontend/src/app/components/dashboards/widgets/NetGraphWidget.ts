import { WidgetType } from '../../../../generated/graphql';
import { BaseWidget, BaseWidgetConfig } from './BaseWidget';

export class NetGraphWidget extends BaseWidget {
  override readonly minCols: number = 6;
  override readonly minRows: number = 6;
  override type: WidgetType = WidgetType.NET_GRAPH;

  constructor(init?: Partial<BaseWidget>) {
    super(init, 6, 6);
    if (!init?.config) {
      const defaultConfig: NetGraphWidgetConfig = {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        to: new Date().toISOString(),
        title: 'Net Graph',
      };
      this.config = JSON.stringify(defaultConfig);
    }
  }
}

export interface NetGraphWidgetConfig extends BaseWidgetConfig {
  from: string; // ISO date string
  to: string; // ISO date string
}
