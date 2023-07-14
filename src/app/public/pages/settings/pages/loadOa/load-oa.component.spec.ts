import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadOaComponent } from './load-oa.component';

describe('LoadOaComponent', () => {
  let component: LoadOaComponent;
  let fixture: ComponentFixture<LoadOaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadOaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadOaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
