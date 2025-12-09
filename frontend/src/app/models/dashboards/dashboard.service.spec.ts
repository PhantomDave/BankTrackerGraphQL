import { TestBed } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { DashboardService } from './dashboard.service';
import { Dashboard } from './dashboard';
import { WidgetType } from '../../../generated/graphql';

describe('DashboardService', () => {
  let service: DashboardService;
  let controller: ApolloTestingController;

  const mockDashboard: Dashboard = {
    id: 1,
    name: 'Test Dashboard',
    widgets: [
      {
        id: 1,
        widgetType: WidgetType.Remaining,
        cols: 4,
        rows: 3,
        x: 0,
        y: 0,
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [DashboardService],
    });
    service = TestBed.inject(DashboardService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  describe('Initial State', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have empty dashboards initially', () => {
      expect(service.dashboards()).toEqual([]);
    });

    it('should have null selected dashboard initially', () => {
      expect(service.selectedDashboard()).toBeNull();
    });

    it('should not be loading initially', () => {
      expect(service.loading()).toBeFalse();
    });

    it('should have no error initially', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('getDashboards', () => {
    it('should fetch dashboards and select the last one', async () => {
      const promise = service.getDashboards();

      const op = controller.expectOne('getDashboards');
      op.flush({
        data: {
          dashboards: [mockDashboard],
        },
      });

      await promise;

      expect(service.dashboards()).toEqual([mockDashboard]);
      expect(service.selectedDashboard()).toEqual(mockDashboard);
      expect(service.loading()).toBeFalse();
    });

    it('should handle errors when fetching dashboards', async () => {
      const promise = service.getDashboards();

      const op = controller.expectOne('getDashboards');
      op.graphqlErrors([{ message: 'Failed to fetch' }]);

      await promise;

      expect(service.error()).toContain('Failed to fetch');
      expect(service.loading()).toBeFalse();
    });
  });

  describe('getDashboard', () => {
    it('should fetch a specific dashboard and update arrays', async () => {
      // Pre-populate dashboards array
      const promise1 = service.getDashboards();
      const op1 = controller.expectOne('getDashboards');
      op1.flush({ data: { dashboards: [mockDashboard] } });
      await promise1;

      const updatedDashboard = { ...mockDashboard, name: 'Updated Name' };
      const promise2 = service.getDashboard(1);

      const op2 = controller.expectOne('getDashboard');
      op2.flush({ data: { dashboard: updatedDashboard } });

      await promise2;

      expect(service.selectedDashboard()?.name).toBe('Updated Name');
      expect(service.dashboards()[0].name).toBe('Updated Name');
    });
  });

  describe('createDashboard', () => {
    it('should create a dashboard and add it to the list', async () => {
      const promise = service.createDashboard({ name: 'New Dashboard' });

      const op = controller.expectOne('createDashboard');
      op.flush({
        data: {
          createDashboard: mockDashboard,
        },
      });

      const result = await promise;

      expect(result).toEqual(mockDashboard);
      expect(service.dashboards()).toContain(mockDashboard);
      expect(service.selectedDashboard()).toEqual(mockDashboard);
    });

    it('should handle errors when creating dashboard', async () => {
      const promise = service.createDashboard({ name: 'New Dashboard' });

      const op = controller.expectOne('createDashboard');
      op.graphqlErrors([{ message: 'Failed to create' }]);

      const result = await promise;

      expect(result).toBeNull();
      expect(service.error()).toContain('Failed to create');
    });
  });

  describe('updateDashboard', () => {
    it('should update a dashboard in both arrays', async () => {
      // Pre-populate dashboards
      const promise1 = service.getDashboards();
      const op1 = controller.expectOne('getDashboards');
      op1.flush({ data: { dashboards: [mockDashboard] } });
      await promise1;

      const updatedDashboard = { ...mockDashboard, name: 'Updated Name' };
      const promise2 = service.updateDashboard({ id: 1, name: 'Updated Name' });

      const op2 = controller.expectOne('updateDashboard');
      op2.flush({ data: { updateDashboard: updatedDashboard } });

      await promise2;

      expect(service.dashboards()[0].name).toBe('Updated Name');
      expect(service.selectedDashboard()?.name).toBe('Updated Name');
    });
  });

  describe('deleteDashboard', () => {
    it('should delete a dashboard and select another one', async () => {
      const dashboard2 = { ...mockDashboard, id: 2, name: 'Dashboard 2' };

      // Pre-populate with two dashboards
      const promise1 = service.getDashboards();
      const op1 = controller.expectOne('getDashboards');
      op1.flush({ data: { dashboards: [mockDashboard, dashboard2] } });
      await promise1;

      const promise2 = service.deleteDashboard(2);
      const op2 = controller.expectOne('deleteDashboard');
      op2.flush({ data: { deleteDashboard: true } });

      await promise2;

      expect(service.dashboards().length).toBe(1);
      expect(service.selectedDashboard()).toEqual(mockDashboard);
    });

    it('should set selected dashboard to null when deleting the last one', async () => {
      // Pre-populate with one dashboard
      const promise1 = service.getDashboards();
      const op1 = controller.expectOne('getDashboards');
      op1.flush({ data: { dashboards: [mockDashboard] } });
      await promise1;

      const promise2 = service.deleteDashboard(1);
      const op2 = controller.expectOne('deleteDashboard');
      op2.flush({ data: { deleteDashboard: true } });

      await promise2;

      expect(service.dashboards().length).toBe(0);
      expect(service.selectedDashboard()).toBeNull();
    });
  });

  describe('addWidget', () => {
    it('should add a widget to the dashboard', async () => {
      // Pre-populate dashboards
      const promise1 = service.getDashboards();
      const op1 = controller.expectOne('getDashboards');
      op1.flush({ data: { dashboards: [mockDashboard] } });
      await promise1;

      const newWidget = {
        id: 2,
        widgetType: WidgetType.NetGraph,
        cols: 4,
        rows: 3,
        x: 4,
        y: 0,
      };

      const promise2 = service.addWidget({
        dashboardId: 1,
        type: WidgetType.NetGraph,
        cols: 4,
        rows: 3,
        x: 4,
        y: 0,
      });

      const op2 = controller.expectOne('addWidget');
      op2.flush({ data: { addWidget: newWidget } });

      await promise2;

      expect(service.selectedDashboard()?.widgets.length).toBe(2);
      expect(service.dashboards()[0].widgets.length).toBe(2);
    });
  });

  describe('updateWidget', () => {
    it('should update a widget in the dashboard', async () => {
      // Pre-populate dashboards
      const promise1 = service.getDashboards();
      const op1 = controller.expectOne('getDashboards');
      op1.flush({ data: { dashboards: [mockDashboard] } });
      await promise1;

      const updatedWidget = { ...mockDashboard.widgets[0], x: 5, y: 5 };

      const promise2 = service.updateWidget({
        id: 1,
        x: 5,
        y: 5,
        cols: 4,
        rows: 3,
      });

      const op2 = controller.expectOne('updateWidget');
      op2.flush({ data: { updateWidget: updatedWidget } });

      await promise2;

      expect(service.selectedDashboard()?.widgets[0].x).toBe(5);
      expect(service.selectedDashboard()?.widgets[0].y).toBe(5);
    });
  });

  describe('removeWidget', () => {
    it('should remove a widget from the dashboard', async () => {
      // Pre-populate dashboards
      const promise1 = service.getDashboards();
      const op1 = controller.expectOne('getDashboards');
      op1.flush({ data: { dashboards: [mockDashboard] } });
      await promise1;

      const promise2 = service.removeWidget(1);
      const op2 = controller.expectOne('removeWidget');
      op2.flush({ data: { removeWidget: true } });

      await promise2;

      expect(service.selectedDashboard()?.widgets.length).toBe(0);
      expect(service.dashboards()[0].widgets.length).toBe(0);
    });
  });

  describe('selectDashboard', () => {
    it('should select a dashboard', () => {
      service.selectDashboard(mockDashboard);
      expect(service.selectedDashboard()).toEqual(mockDashboard);
    });
  });

  describe('clearError', () => {
    it('should clear the error state', async () => {
      const promise = service.getDashboards();
      const op = controller.expectOne('getDashboards');
      op.graphqlErrors([{ message: 'Test error' }]);
      await promise;

      expect(service.error()).toBeTruthy();

      service.clearError();

      expect(service.error()).toBeNull();
    });
  });
});
