import { WidgetType } from '../../../../generated/graphql';
import { BaseWidget, BaseWidgetConfig } from './BaseWidget';

export class NetGraphWidget extends BaseWidget {
  override readonly minCols: number = 6;
  override readonly minRows: number = 6;
  override type: WidgetType = WidgetType.NET_GRAPH;

  private static createDefaultConfig(): NetGraphWidgetConfig {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      from: monthStart.toISOString(),
      to: today.toISOString(),
      title: 'Net Graph',
    };
  }

  constructor(init?: Partial<BaseWidget>) {
    super(init, 6, 6);
    if (!init?.config) {
      this.config = JSON.stringify(NetGraphWidget.createDefaultConfig());
    } else {
      // Parse existing config and merge with defaults to preserve customizations
      try {
        const existingConfig = JSON.parse(this.config) as NetGraphWidgetConfig;
        const defaults = NetGraphWidget.createDefaultConfig();
        const mergedConfig: NetGraphWidgetConfig = {
          from: existingConfig.from ?? defaults.from,
          to: existingConfig.to ?? defaults.to,
          title: existingConfig.title ?? defaults.title,
        };
        this.config = JSON.stringify(mergedConfig);
      } catch {
        // If config is invalid, use defaults
        this.config = JSON.stringify(NetGraphWidget.createDefaultConfig());
      }
    }
  }
}

export interface NetGraphWidgetConfig extends BaseWidgetConfig {
  from: string; // ISO date string
  to: string; // ISO date string
}
