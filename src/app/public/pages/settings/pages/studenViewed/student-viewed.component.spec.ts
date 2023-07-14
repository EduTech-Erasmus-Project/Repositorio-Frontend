import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentViewedComponent } from './student-viewed.component';

describe('StudentViewedComponent', () => {
  let component: StudentViewedComponent;
  let fixture: ComponentFixture<StudentViewedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentViewedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentViewedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
