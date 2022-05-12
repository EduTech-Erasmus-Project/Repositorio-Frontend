import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyQualifiedOaComponent } from './my-qualified-oa.component';

describe('MyQualifiedOaComponent', () => {
  let component: MyQualifiedOaComponent;
  let fixture: ComponentFixture<MyQualifiedOaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyQualifiedOaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyQualifiedOaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
