import { WidgetType } from '../../../../generated/graphql';
import { BaseWidget } from './BaseWidget';
import { CurrentBalanceWidget } from './CurrentBalanceWidget';
import { NetGraphWidget } from './NetGraphWidget';

export class WidgetFactory {
  static createWidget(type: WidgetType, init?: Partial<BaseWidget>): BaseWidget {
    switch (type) {
      case WidgetType.CURRENT_BALANCE:
        return new CurrentBalanceWidget(init);
      case WidgetType.NET_GRAPH:
        return new NetGraphWidget(init);
      default:
        throw new Error(`Unsupported widget type: ${type}`);
    }
  }

  static createWidgetFromData(data: Partial<BaseWidget> & { type: WidgetType }): BaseWidget {
    return WidgetFactory.createWidget(data.type, data);
  }
}
