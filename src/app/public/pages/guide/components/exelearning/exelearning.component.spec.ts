import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExelearningComponent } from './exelearning.component';

describe('ExelearningComponent', () => {
  let component: ExelearningComponent;
  let fixture: ComponentFixture<ExelearningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExelearningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExelearningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
