import { BaseWidget } from './BaseWidget';
import { CurrentBalanceWidget, CurrentBalanceWidgetConfig } from './CurrentBalanceWidget';
import { NetGraphWidget, NetGraphWidgetConfig } from './NetGraphWidget';
import { WidgetType } from '../../../../generated/graphql';

describe('BaseWidget', () => {
  class TestWidget extends BaseWidget {
    override readonly minCols = 2;
    override readonly minRows = 2;
    override type = WidgetType.CURRENT_BALANCE;

    constructor(init?: Partial<BaseWidget>) {
      super(init, 2, 2);
    }
  }

  it('should initialize with default values', () => {
    const widget = new TestWidget();

    expect(widget.x).toBe(0);
    expect(widget.y).toBe(0);
    expect(widget.cols).toBe(2);
    expect(widget.rows).toBe(2);
    expect(widget.config).toBe('');
  });

  it('should initialize with provided values', () => {
    const widget = new TestWidget({
      x: 5,
      y: 10,
      cols: 4,
      rows: 3,
      id: 123,
      config: '{"title":"Test"}',
    });

    expect(widget.x).toBe(5);
    expect(widget.y).toBe(10);
    expect(widget.cols).toBe(4);
    expect(widget.rows).toBe(3);
    expect(widget.id).toBe(123);
    expect(widget.config).toBe('{"title":"Test"}');
  });

  it('should get typed config', () => {
    const config = { title: 'Test Title', subtitle: 'Test Subtitle' };
    const widget = new TestWidget({ config: JSON.stringify(config) });

    const typedConfig = widget.getTypedConfig();

    expect(typedConfig).toEqual(config);
  });

  it('should set typed config', () => {
    const widget = new TestWidget();
    const config = { title: 'New Title', subtitle: 'New Subtitle' };

    widget.setTypedConfig(config);

    expect(widget.config).toBe(JSON.stringify(config));
    expect(widget.getTypedConfig()).toEqual(config);
  });

  it('should return undefined for empty config', () => {
    const widget = new TestWidget();

    expect(widget.getTypedConfig()).toBeUndefined();
  });

  it('should return widget type', () => {
    const widget = new TestWidget();

    expect(widget.getType()).toBe(WidgetType.CURRENT_BALANCE);
  });
});

describe('CurrentBalanceWidget', () => {
  it('should create with default values', () => {
    const widget = new CurrentBalanceWidget();

    expect(widget.type).toBe(WidgetType.CURRENT_BALANCE);
    expect(widget.minCols).toBe(1);
    expect(widget.minRows).toBe(1);
    expect(widget.cols).toBe(1);
    expect(widget.rows).toBe(1);
  });

  it('should create with default config', () => {
    const widget = new CurrentBalanceWidget();
    const config = widget.getTypedConfig<CurrentBalanceWidgetConfig>();

    expect(config).toBeDefined();
    expect(config?.title).toBe('Current Balance');
    expect(config?.showCurrency).toBe(true);
  });

  it('should preserve provided config', () => {
    const customConfig: CurrentBalanceWidgetConfig = {
      title: 'My Balance',
      subtitle: 'Account 1',
      showCurrency: false,
    };
    const widget = new CurrentBalanceWidget({ config: JSON.stringify(customConfig) });
    const config = widget.getTypedConfig<CurrentBalanceWidgetConfig>();

    expect(config).toEqual(customConfig);
  });

  it('should initialize with custom dimensions', () => {
    const widget = new CurrentBalanceWidget({ cols: 3, rows: 2 });

    expect(widget.cols).toBe(3);
    expect(widget.rows).toBe(2);
  });

  it('should respect minimum dimensions', () => {
    const widget = new CurrentBalanceWidget();

    expect(widget.minCols).toBe(1);
    expect(widget.minRows).toBe(1);
  });
});

describe('NetGraphWidget', () => {
  it('should create with default values', () => {
    const widget = new NetGraphWidget();

    expect(widget.type).toBe(WidgetType.NET_GRAPH);
    expect(widget.minCols).toBe(2);
    expect(widget.minRows).toBe(2);
    expect(widget.cols).toBe(2);
    expect(widget.rows).toBe(2);
  });

  it('should create with default config', () => {
    const widget = new NetGraphWidget();
    const config = widget.getTypedConfig<NetGraphWidgetConfig>();

    expect(config).toBeDefined();
    expect(config?.title).toBe('Net Graph');
    expect(config?.from).toBeDefined();
    expect(config?.to).toBeDefined();
  });

  it('should set default date range in config', () => {
    const widget = new NetGraphWidget();
    const config = widget.getTypedConfig<NetGraphWidgetConfig>();

    expect(typeof config?.from).toBe('string');
    expect(typeof config?.to).toBe('string');

    const from = new Date(config!.from);
    const to = new Date(config!.to);
    const now = new Date();

    expect(from.getMonth()).toBe(now.getMonth());
    expect(from.getDate()).toBe(1);
    expect(to.getDate()).toBe(now.getDate());
  });

  it('should preserve provided config', () => {
    const fromDate = new Date(2024, 0, 1);
    const toDate = new Date(2024, 11, 31);
    const customConfig: NetGraphWidgetConfig = {
      title: 'Custom Net Graph',
      subtitle: 'Year 2024',
      from: fromDate,
      to: toDate,
    };
    const widget = new NetGraphWidget({ config: JSON.stringify(customConfig) });
    const config = widget.getTypedConfig<NetGraphWidgetConfig>();

    expect(config).toBeDefined();
    expect(config?.title).toBe('Custom Net Graph');
    expect(config?.subtitle).toBe('Year 2024');
  });

  it('should initialize with custom dimensions', () => {
    const widget = new NetGraphWidget({ cols: 6, rows: 4 });

    expect(widget.cols).toBe(6);
    expect(widget.rows).toBe(4);
  });

  it('should respect minimum dimensions', () => {
    const widget = new NetGraphWidget();

    expect(widget.minCols).toBe(2);
    expect(widget.minRows).toBe(2);
  });
});
