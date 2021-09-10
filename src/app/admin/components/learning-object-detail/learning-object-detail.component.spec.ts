import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectDetailComponent } from './learning-object-detail.component';

describe('LearningObjectDetailComponent', () => {
  let component: LearningObjectDetailComponent;
  let fixture: ComponentFixture<LearningObjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LearningObjectDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
