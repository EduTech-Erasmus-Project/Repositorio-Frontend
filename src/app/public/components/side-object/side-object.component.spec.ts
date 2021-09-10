import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideObjectComponent } from './side-object.component';

describe('SideObjectComponent', () => {
  let component: SideObjectComponent;
  let fixture: ComponentFixture<SideObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideObjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
