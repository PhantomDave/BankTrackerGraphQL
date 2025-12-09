import { TestBed } from '@angular/core/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [DashboardService],
    });
    service = TestBed.inject(DashboardService);
  });

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
