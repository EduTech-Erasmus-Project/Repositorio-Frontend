import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertQuestionCreateListComponent } from './expert-question-create-list.component';

describe('ExpertQuestionCreateListComponent', () => {
  let component: ExpertQuestionCreateListComponent;
  let fixture: ComponentFixture<ExpertQuestionCreateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpertQuestionCreateListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpertQuestionCreateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
