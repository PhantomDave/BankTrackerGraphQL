import { WidgetType } from '../../generated/graphql';

export const WIDGET_DISPLAY_NAMES: Record<WidgetType, string> = {
  [WidgetType.NET_GRAPH]: 'Net Graph',
  [WidgetType.CURRENT_BALANCE]: 'Remaining Budget',
};
