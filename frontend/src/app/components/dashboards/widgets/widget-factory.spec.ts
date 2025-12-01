import { WidgetFactory } from './widget-factory';
import { WidgetType } from '../../../../generated/graphql';
import { CurrentBalanceWidget } from './CurrentBalanceWidget';
import { NetGraphWidget } from './NetGraphWidget';

describe('WidgetFactory', () => {
  describe('createWidget', () => {
    it('should create CurrentBalanceWidget', () => {
      const widget = WidgetFactory.createWidget(WidgetType.CURRENT_BALANCE);

      expect(widget).toBeInstanceOf(CurrentBalanceWidget);
      expect(widget.type).toBe(WidgetType.CURRENT_BALANCE);
    });

    it('should create NetGraphWidget', () => {
      const widget = WidgetFactory.createWidget(WidgetType.NET_GRAPH);

      expect(widget).toBeInstanceOf(NetGraphWidget);
      expect(widget.type).toBe(WidgetType.NET_GRAPH);
    });

    it('should create widget with custom initialization', () => {
      const widget = WidgetFactory.createWidget(WidgetType.CURRENT_BALANCE, {
        x: 5,
        y: 10,
        cols: 3,
        rows: 2,
        id: 123,
      });

      expect(widget.x).toBe(5);
      expect(widget.y).toBe(10);
      expect(widget.cols).toBe(3);
      expect(widget.rows).toBe(2);
      expect(widget.id).toBe(123);
    });

    it('should throw error for unsupported widget type', () => {
      expect(() => {
        WidgetFactory.createWidget('INVALID_TYPE' as WidgetType);
      }).toThrow('Unsupported widget type');
    });
  });

  describe('createWidgetFromData', () => {
    it('should create widget from data object', () => {
      const data = {
        type: WidgetType.NET_GRAPH,
        x: 2,
        y: 3,
        cols: 4,
        rows: 3,
        id: 456,
        config: '{"title":"Test"}',
      };

      const widget = WidgetFactory.createWidgetFromData(data);

      expect(widget).toBeInstanceOf(NetGraphWidget);
      expect(widget.type).toBe(WidgetType.NET_GRAPH);
      expect(widget.x).toBe(2);
      expect(widget.y).toBe(3);
      expect(widget.cols).toBe(4);
      expect(widget.rows).toBe(3);
      expect(widget.id).toBe(456);
      expect(widget.config).toBe('{"title":"Test"}');
    });

    it('should create CurrentBalanceWidget from data', () => {
      const data = {
        type: WidgetType.CURRENT_BALANCE,
        x: 0,
        y: 0,
        cols: 2,
        rows: 2,
      };

      const widget = WidgetFactory.createWidgetFromData(data);

      expect(widget).toBeInstanceOf(CurrentBalanceWidget);
      expect(widget.type).toBe(WidgetType.CURRENT_BALANCE);
    });

    it('should preserve widget configuration', () => {
      const config = { title: 'My Widget', subtitle: 'Subtitle' };
      const data = {
        type: WidgetType.CURRENT_BALANCE,
        config: JSON.stringify(config),
      };

      const widget = WidgetFactory.createWidgetFromData(data);
      const typedConfig = widget.getTypedConfig();

      expect(typedConfig).toEqual(config);
    });
  });
});
