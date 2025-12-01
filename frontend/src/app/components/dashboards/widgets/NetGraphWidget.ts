import { WidgetType } from '../../../../generated/graphql';
import { BaseWidget, BaseWidgetConfig } from './BaseWidget';

export class NetGraphWidget extends BaseWidget {
  override readonly minCols: number = 2;
  override readonly minRows: number = 2;
  override type: WidgetType = WidgetType.NET_GRAPH;

  constructor(init?: Partial<BaseWidget>) {
    super(init, 2, 2);
    this.type = WidgetType.NET_GRAPH;
    if (!init?.config) {
      const defaultConfig: NetGraphWidgetConfig = {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
        title: 'Net Graph',
      };
      this.config = JSON.stringify(defaultConfig);
    }
  }
}

export interface NetGraphWidgetConfig extends BaseWidgetConfig {
  from: Date;
  to: Date;
}
