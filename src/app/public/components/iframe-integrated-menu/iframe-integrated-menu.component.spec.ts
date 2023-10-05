import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeIntegratedMenuComponent } from './iframe-integrated-menu.component';

describe('IframeIntegratedMenuComponent', () => {
  let component: IframeIntegratedMenuComponent;
  let fixture: ComponentFixture<IframeIntegratedMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IframeIntegratedMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IframeIntegratedMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
