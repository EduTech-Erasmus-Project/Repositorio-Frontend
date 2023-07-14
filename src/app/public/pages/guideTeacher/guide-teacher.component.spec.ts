import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideTeacherComponent } from './guide-teacher.component';

describe('GuideTeacherComponent', () => {
  let component: GuideTeacherComponent;
  let fixture: ComponentFixture<GuideTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuideTeacherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuideTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
