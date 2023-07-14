import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStudentEvaluationsAdminComponent } from './view-student-evaluations-admin.component';

describe('ViewStudentEvaluationsAdminComponent', () => {
  let component: ViewStudentEvaluationsAdminComponent;
  let fixture: ComponentFixture<ViewStudentEvaluationsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewStudentEvaluationsAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewStudentEvaluationsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
