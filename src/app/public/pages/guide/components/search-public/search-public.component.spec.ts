import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPublicComponent } from './search-public.component';

describe('SearchPublicComponent', () => {
  let component: SearchPublicComponent;
  let fixture: ComponentFixture<SearchPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchPublicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
