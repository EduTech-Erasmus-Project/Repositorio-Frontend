import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { AboutusComponent } from "./aboutus.component";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";

describe("AboutusComponent", () => {
  let component: AboutusComponent;
  let fixture: ComponentFixture<AboutusComponent>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;

  const languageServiceStub = {
    translate: {
      get: jasmine.createSpy("get").and.returnValue(of("Nosotros")),
    },
  };

  beforeEach(async () => {
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    await TestBed.configureTestingModule({
      declarations: [AboutusComponent],
      providers: [
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        { provide: LanguageService, useValue: languageServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(AboutusComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(AboutusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("crea el componente y registra el breadcrumb de nosotros", () => {
    expect(component).toBeTruthy();
    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalledWith([
      { label: "ROA" },
      { label: "Nosotros", routerLink: ["/about-us"] },
    ]);
  });
});
