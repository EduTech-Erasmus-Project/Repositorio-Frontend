import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanerRegisterComponent } from './baner-register.component';

describe('BanerRegisterComponent', () => {
  let component: BanerRegisterComponent;
  let fixture: ComponentFixture<BanerRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BanerRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BanerRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
