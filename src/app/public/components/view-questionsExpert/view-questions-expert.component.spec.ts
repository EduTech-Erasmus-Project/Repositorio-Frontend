import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuestionsExpertComponent } from './view-questions-expert.component';

describe('ViewQuestionsExpertComponent', () => {
  let component: ViewQuestionsExpertComponent;
  let fixture: ComponentFixture<ViewQuestionsExpertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewQuestionsExpertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewQuestionsExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
