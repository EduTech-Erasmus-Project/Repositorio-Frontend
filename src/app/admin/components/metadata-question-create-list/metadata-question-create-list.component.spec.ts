import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataQuestionCreateListComponent } from './metadata-question-create-list.component';

describe('MetadataQuestionCreateListComponent', () => {
  let component: MetadataQuestionCreateListComponent;
  let fixture: ComponentFixture<MetadataQuestionCreateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataQuestionCreateListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataQuestionCreateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
