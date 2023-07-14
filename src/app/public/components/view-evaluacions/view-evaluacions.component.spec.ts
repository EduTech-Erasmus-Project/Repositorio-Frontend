import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEvaluacionsComponent } from './view-evaluacions.component';

describe('ViewEvaluacionsComponent', () => {
  let component: ViewEvaluacionsComponent;
  let fixture: ComponentFixture<ViewEvaluacionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewEvaluacionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEvaluacionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
