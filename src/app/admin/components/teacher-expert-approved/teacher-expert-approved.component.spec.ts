import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherExpertApprovedComponent } from './teacher-expert-approved.component';

describe('TeacherExpertApprovedComponent', () => {
  let component: TeacherExpertApprovedComponent;
  let fixture: ComponentFixture<TeacherExpertApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherExpertApprovedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherExpertApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
