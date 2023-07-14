import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministratorUserListComponent } from './administrator-user-list.component';

describe('AdministratorUserListComponent', () => {
  let component: AdministratorUserListComponent;
  let fixture: ComponentFixture<AdministratorUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministratorUserListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministratorUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
