import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationOaComponent } from './qualification-oa.component';

describe('QualificationOaComponent', () => {
  let component: QualificationOaComponent;
  let fixture: ComponentFixture<QualificationOaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualificationOaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QualificationOaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
