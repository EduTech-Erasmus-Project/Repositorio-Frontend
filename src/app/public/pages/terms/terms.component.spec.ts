import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { TermsComponent } from "./terms.component";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

describe("TermsComponent", () => {
  let component: TermsComponent;
  let fixture: ComponentFixture<TermsComponent>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;

  const languageServiceStub = {
    translate: {
      get: jasmine.createSpy("get").and.returnValue(of("Terms and conditions")),
    },
  };

  beforeEach(async () => {
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    await TestBed.configureTestingModule({
      declarations: [TermsComponent],
      providers: [
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        { provide: LanguageService, useValue: languageServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(TermsComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(TermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("crea el componente y registra el breadcrumb de terminos", () => {
    expect(component).toBeTruthy();
    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalledWith([
      { label: "ROA" },
      { label: "Terms and conditions", routerLink: ["/terms-and-conditions"] },
    ]);
  });
});
