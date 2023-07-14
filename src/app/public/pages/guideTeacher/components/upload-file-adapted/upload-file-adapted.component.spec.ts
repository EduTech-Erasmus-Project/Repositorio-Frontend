import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFileAdaptedComponent } from './upload-file-adapted.component';

describe('UploadFileAdaptedComponent', () => {
  let component: UploadFileAdaptedComponent;
  let fixture: ComponentFixture<UploadFileAdaptedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadFileAdaptedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFileAdaptedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
