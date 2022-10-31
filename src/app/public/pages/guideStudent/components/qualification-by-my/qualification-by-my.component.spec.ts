import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationByMyComponent } from './qualification-by-my.component';

describe('QualificationByMyComponent', () => {
  let component: QualificationByMyComponent;
  let fixture: ComponentFixture<QualificationByMyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualificationByMyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QualificationByMyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
