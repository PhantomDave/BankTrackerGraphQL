import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WidgetNetGraphComponent } from './widget-net-graph.component';

describe('WidgetNetGraphComponent', () => {
  let component: WidgetNetGraphComponent;
  let fixture: ComponentFixture<WidgetNetGraphComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ WidgetNetGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetNetGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
