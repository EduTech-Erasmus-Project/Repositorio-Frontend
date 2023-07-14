import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuestionsStudentComponent } from './view-questions-student.component';

describe('ViewQuestionsStudentComponent', () => {
  let component: ViewQuestionsStudentComponent;
  let fixture: ComponentFixture<ViewQuestionsStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewQuestionsStudentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewQuestionsStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
