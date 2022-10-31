import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideExpertComponent } from './guide-expert.component';

describe('GuideExpertComponent', () => {
  let component: GuideExpertComponent;
  let fixture: ComponentFixture<GuideExpertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuideExpertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuideExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
