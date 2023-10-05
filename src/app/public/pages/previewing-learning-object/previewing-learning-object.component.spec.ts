import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewingLearningObjectComponent } from './previewing-learning-object.component';

describe('PreviewingLearningObjectComponent', () => {
  let component: PreviewingLearningObjectComponent;
  let fixture: ComponentFixture<PreviewingLearningObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewingLearningObjectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewingLearningObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
