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
    } else {
      // Parse existing config and merge with defaults to preserve customizations
      try {
        const existingConfig = JSON.parse(this.config) as NetGraphWidgetConfig;
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const mergedConfig: NetGraphWidgetConfig = {
          from: existingConfig.from ?? monthStart.toISOString(),
          to: existingConfig.to ?? today.toISOString(),
          title: existingConfig.title ?? 'Net Graph',
        };
        this.config = JSON.stringify(mergedConfig);
      } catch {
        // If config is invalid, use defaults
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.config = JSON.stringify({
          from: monthStart.toISOString(),
          to: today.toISOString(),
          title: 'Net Graph',
        });
      }
    }
  }
}

export interface NetGraphWidgetConfig extends BaseWidgetConfig {
  from: string; // ISO date string
  to: string; // ISO date string
}
