import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectPendingListComponent } from './learning-object-pending-list.component';

describe('LearningObjectPendingListComponent', () => {
  let component: LearningObjectPendingListComponent;
  let fixture: ComponentFixture<LearningObjectPendingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LearningObjectPendingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectPendingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
