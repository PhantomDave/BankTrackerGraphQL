import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard-component.component';
import { WidgetType } from '../../../../generated/graphql';
import { SnackbarService } from '../../../services/snackbar-service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let snackbarService: jasmine.SpyObj<SnackbarService>;

  beforeEach(async () => {
    const snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: SnackbarService, useValue: snackbarServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    snackbarService = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onWidgetSelected', () => {
    it('should create and add a NetGraph widget to the dashboard', () => {
      const initialWidgetCount = component.widgets().length;

      component.onWidgetSelected(WidgetType.NET_GRAPH);

      expect(component.widgets().length).toBe(initialWidgetCount + 1);
      const addedWidget = component.widgets()[initialWidgetCount];
      expect(addedWidget.type).toBe(WidgetType.NET_GRAPH);
    });

    it('should create and add a CurrentBalance widget to the dashboard', () => {
      const initialWidgetCount = component.widgets().length;

      component.onWidgetSelected(WidgetType.CURRENT_BALANCE);

      expect(component.widgets().length).toBe(initialWidgetCount + 1);
      const addedWidget = component.widgets()[initialWidgetCount];
      expect(addedWidget.type).toBe(WidgetType.CURRENT_BALANCE);
    });

    it('should show success snackbar when widget is added successfully', () => {
      component.onWidgetSelected(WidgetType.NET_GRAPH);

      expect(snackbarService.success).toHaveBeenCalledWith('Added Net Graph widget to dashboard.');
    });

    it('should show success snackbar with correct widget name for CurrentBalance', () => {
      component.onWidgetSelected(WidgetType.CURRENT_BALANCE);

      expect(snackbarService.success).toHaveBeenCalledWith('Added Remaining Budget widget to dashboard.');
    });

    it('should show error snackbar if widget creation fails', () => {
      spyOn(console, 'error'); // Suppress console output in tests
      const invalidWidgetType = 'INVALID_TYPE' as WidgetType;

      component.onWidgetSelected(invalidWidgetType);

      expect(snackbarService.error).toHaveBeenCalledWith('Failed to add widget to dashboard.');
    });

    it('should not add widget to list if creation fails', () => {
      spyOn(console, 'error'); // Suppress console output in tests
      const invalidWidgetType = 'INVALID_TYPE' as WidgetType;
      const initialWidgetCount = component.widgets().length;

      component.onWidgetSelected(invalidWidgetType);

      expect(component.widgets().length).toBe(initialWidgetCount);
    });

    it('should preserve existing widgets when adding new one', () => {
      component.onWidgetSelected(WidgetType.NET_GRAPH);
      const firstWidget = component.widgets()[0];

      component.onWidgetSelected(WidgetType.CURRENT_BALANCE);

      expect(component.widgets().length).toBe(2);
      expect(component.widgets()[0]).toBe(firstWidget);
      expect(component.widgets()[1].type).toBe(WidgetType.CURRENT_BALANCE);
    });

    it('should add multiple widgets of the same type', () => {
      component.onWidgetSelected(WidgetType.NET_GRAPH);
      component.onWidgetSelected(WidgetType.NET_GRAPH);

      expect(component.widgets().length).toBe(2);
      expect(component.widgets()[0].type).toBe(WidgetType.NET_GRAPH);
      expect(component.widgets()[1].type).toBe(WidgetType.NET_GRAPH);
    });
  });

  describe('widget configuration', () => {
    it('should create NetGraph widget with default configuration', () => {
      component.onWidgetSelected(WidgetType.NET_GRAPH);

      const widget = component.widgets()[0];
      expect(widget.config).toBeDefined();

      const config = widget.getTypedConfig();
      expect(config).toBeDefined();
      expect(config?.title).toBe('Net Graph');
      expect(config?.from).toBeDefined();
      expect(config?.to).toBeDefined();
    });

    it('should create CurrentBalance widget with default configuration', () => {
      component.onWidgetSelected(WidgetType.CURRENT_BALANCE);

      const widget = component.widgets()[0];
      expect(widget.config).toBeDefined();

      const config = widget.getTypedConfig();
      expect(config).toBeDefined();
      expect(config?.title).toBe('Current Balance');
    });
  });

  describe('edit mode', () => {
    it('should start with edit mode disabled', () => {
      expect(component.isEditMode()).toBe(false);
    });
  });
});
