import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationsExpertComponent } from './evaluations-expert.component';

describe('EvaluationsExpertComponent', () => {
  let component: EvaluationsExpertComponent;
  let fixture: ComponentFixture<EvaluationsExpertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationsExpertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationsExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
