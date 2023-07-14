import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificateOaComponent } from './qualificate-oa.component';

describe('QualificateOaComponent', () => {
  let component: QualificateOaComponent;
  let fixture: ComponentFixture<QualificateOaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualificateOaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QualificateOaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
