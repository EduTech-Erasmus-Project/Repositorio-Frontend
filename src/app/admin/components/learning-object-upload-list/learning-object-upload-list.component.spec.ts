import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectUploadListComponent } from './learning-object-upload-list.component';

describe('LearningObjectUploadListComponent', () => {
  let component: LearningObjectUploadListComponent;
  let fixture: ComponentFixture<LearningObjectUploadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LearningObjectUploadListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectUploadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
