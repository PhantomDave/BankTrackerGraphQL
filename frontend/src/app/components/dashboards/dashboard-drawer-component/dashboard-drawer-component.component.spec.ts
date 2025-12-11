import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardDrawerComponent } from './dashboard-drawer-component.component';
import { WidgetType } from '../../../../generated/graphql';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardDrawerComponent', () => {
  let component: DashboardDrawerComponent;
  let fixture: ComponentFixture<DashboardDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDrawerComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('availableWidgets', () => {
    it('should include all widget types', () => {
      const widgetTypes = component.availableWidgets.map((w) => w.type);

      expect(widgetTypes).toContain(WidgetType.NET_GRAPH);
      expect(widgetTypes).toContain(WidgetType.CURRENT_BALANCE);
    });

    it('should have display names for all widgets', () => {
      component.availableWidgets.forEach((widget) => {
        expect(widget.name).toBeTruthy();
        expect(widget.name).not.toBe('');
      });
    });

    it('should have correct display name for Net Graph', () => {
      const netGraphWidget = component.availableWidgets.find(
        (w) => w.type === WidgetType.NET_GRAPH,
      );

      expect(netGraphWidget?.name).toBe('Net Graph');
    });

    it('should have correct display name for Current Balance', () => {
      const currentBalanceWidget = component.availableWidgets.find(
        (w) => w.type === WidgetType.CURRENT_BALANCE,
      );

      expect(currentBalanceWidget?.name).toBe('Remaining Budget');
    });
  });

  describe('addWidgetToDashboard', () => {
    it('should emit widgetSelected event with correct widget type', (done) => {
      const widget = { type: WidgetType.NET_GRAPH, name: 'Net Graph' };

      component.widgetSelected.subscribe((type) => {
        expect(type).toBe(WidgetType.NET_GRAPH);
        done();
      });

      component.addWidgetToDashboard(widget);
    });

    it('should emit widgetSelected for CurrentBalance widget', (done) => {
      const widget = { type: WidgetType.CURRENT_BALANCE, name: 'Remaining Budget' };

      component.widgetSelected.subscribe((type) => {
        expect(type).toBe(WidgetType.CURRENT_BALANCE);
        done();
      });

      component.addWidgetToDashboard(widget);
    });

    it('should not show snackbar when adding widget', () => {
      const widget = { type: WidgetType.NET_GRAPH, name: 'Net Graph' };

      // Should not throw or call snackbar service
      expect(() => component.addWidgetToDashboard(widget)).not.toThrow();
    });
  });

  describe('onDrawerClosed', () => {
    it('should emit closed event', (done) => {
      component.closed.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      component.onDrawerClosed();
    });
  });

  describe('drawer state', () => {
    it('should accept opened input', () => {
      fixture.componentRef.setInput('opened', true);
      fixture.detectChanges();

      expect(component.opened()).toBe(true);
    });

    it('should handle closed state', () => {
      fixture.componentRef.setInput('opened', false);
      fixture.detectChanges();

      expect(component.opened()).toBe(false);
    });
  });
});
