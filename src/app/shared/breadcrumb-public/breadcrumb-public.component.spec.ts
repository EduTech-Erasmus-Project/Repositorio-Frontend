import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbPublicComponent } from './breadcrumb-public.component';

describe('BreadcrumbPublicComponent', () => {
  let component: BreadcrumbPublicComponent;
  let fixture: ComponentFixture<BreadcrumbPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BreadcrumbPublicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
