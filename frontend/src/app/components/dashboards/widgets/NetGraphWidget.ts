import { WidgetType } from '../../../../generated/graphql';
import { BaseWidget, BaseWidgetConfig } from './BaseWidget';

export class NetGraphWidget extends BaseWidget {
  override readonly minCols: number = 2;
  override readonly minRows: number = 2;
  override type: WidgetType = WidgetType.NET_GRAPH;

  constructor(init?: Partial<BaseWidget>) {
    super(init, 2, 2);
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
