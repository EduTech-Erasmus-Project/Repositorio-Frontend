import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResedComponent } from './password-resed.component';

describe('PasswordResedComponent', () => {
  let component: PasswordResedComponent;
  let fixture: ComponentFixture<PasswordResedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordResedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordResedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
