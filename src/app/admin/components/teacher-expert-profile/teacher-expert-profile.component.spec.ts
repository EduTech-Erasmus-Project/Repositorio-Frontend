import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherExpertProfileComponent } from './teacher-expert-profile.component';

describe('TeacherExpertProfileComponent', () => {
  let component: TeacherExpertProfileComponent;
  let fixture: ComponentFixture<TeacherExpertProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherExpertProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherExpertProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
