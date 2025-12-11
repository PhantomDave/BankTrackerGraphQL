import { WidgetType } from '../../../../generated/graphql';
import { BaseWidget, BaseWidgetConfig } from './BaseWidget';

export class CurrentBalanceWidget extends BaseWidget {
  override readonly minCols: number = 3;
  override readonly minRows: number = 4;
  override type: WidgetType = WidgetType.CURRENT_BALANCE;

  constructor(init?: Partial<BaseWidget>) {
    super(init, 3, 4);
    if (!init?.config) {
      const defaultConfig: CurrentBalanceWidgetConfig = {
        title: 'Current Balance',
        showCurrency: true,
      };
      this.config = JSON.stringify(defaultConfig);
    } else {
      // Parse existing config and merge with defaults to preserve customizations
      try {
        const existingConfig = JSON.parse(this.config) as CurrentBalanceWidgetConfig;
        const mergedConfig: CurrentBalanceWidgetConfig = {
          title: existingConfig.title ?? 'Current Balance',
          showCurrency: existingConfig.showCurrency ?? true,
        };
        this.config = JSON.stringify(mergedConfig);
      } catch {
        // If config is invalid, use defaults
        this.config = JSON.stringify({
          title: 'Current Balance',
          showCurrency: true,
        });
      }
    }
  }
}

export interface CurrentBalanceWidgetConfig extends BaseWidgetConfig {
  showCurrency?: boolean;
}
