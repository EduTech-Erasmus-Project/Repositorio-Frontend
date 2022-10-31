import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeenByMeComponent } from './seen-by-me.component';

describe('SeenByMeComponent', () => {
  let component: SeenByMeComponent;
  let fixture: ComponentFixture<SeenByMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeenByMeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeenByMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
