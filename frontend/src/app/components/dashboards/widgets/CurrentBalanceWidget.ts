import { WidgetType } from '../../../../generated/graphql';
import { BaseWidget, BaseWidgetConfig } from './BaseWidget';

export class CurrentBalanceWidget extends BaseWidget {
  override readonly minCols: number = 3;
  override readonly minRows: number = 4;
  override type: WidgetType = WidgetType.CURRENT_BALANCE;

  private static createDefaultConfig(): CurrentBalanceWidgetConfig {
    return {
      title: 'Current Balance',
      showCurrency: true,
    };
  }

  constructor(init?: Partial<BaseWidget>) {
    super(init, 3, 4);
    if (!init?.config) {
      this.config = JSON.stringify(CurrentBalanceWidget.createDefaultConfig());
    } else {
      // Parse existing config and merge with defaults to preserve customizations
      try {
        const existingConfig = JSON.parse(this.config) as CurrentBalanceWidgetConfig;
        const defaults = CurrentBalanceWidget.createDefaultConfig();
        const mergedConfig: CurrentBalanceWidgetConfig = {
          title: existingConfig.title ?? defaults.title,
          showCurrency: existingConfig.showCurrency ?? defaults.showCurrency,
        };
        this.config = JSON.stringify(mergedConfig);
      } catch {
        // If config is invalid, use defaults
        this.config = JSON.stringify(CurrentBalanceWidget.createDefaultConfig());
      }
    }
  }
}

export interface CurrentBalanceWidgetConfig extends BaseWidgetConfig {
  showCurrency?: boolean;
}
