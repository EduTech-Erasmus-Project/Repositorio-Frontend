import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentQuestionCreateListComponent } from './student-question-create-list.component';

describe('StudentQuestionCreateListComponent', () => {
  let component: StudentQuestionCreateListComponent;
  let fixture: ComponentFixture<StudentQuestionCreateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentQuestionCreateListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentQuestionCreateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
