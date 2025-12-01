import { WidgetType } from '../../../../generated/graphql';
import { BaseWidget, BaseWidgetConfig } from './BaseWidget';

export class CurrentBalanceWidget extends BaseWidget {
  override readonly minCols: number = 1;
  override readonly minRows: number = 1;
  override type: WidgetType = WidgetType.CURRENT_BALANCE;

  constructor(init?: Partial<BaseWidget>) {
    super(init, 1, 1);
    if (!init?.config) {
      const defaultConfig: CurrentBalanceWidgetConfig = {
        title: 'Current Balance',
        showCurrency: true,
      };
      this.config = JSON.stringify(defaultConfig);
    }
  }
}

export interface CurrentBalanceWidgetConfig extends BaseWidgetConfig {
  showCurrency?: boolean;
}
