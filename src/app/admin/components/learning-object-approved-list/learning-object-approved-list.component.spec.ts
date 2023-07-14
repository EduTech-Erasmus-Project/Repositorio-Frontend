import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectApprovedListComponent } from './learning-object-approved-list.component';

describe('LearningObjectApprovedListComponent', () => {
  let component: LearningObjectApprovedListComponent;
  let fixture: ComponentFixture<LearningObjectApprovedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LearningObjectApprovedListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectApprovedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
