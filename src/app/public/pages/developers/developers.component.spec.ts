import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { DevelopersComponent } from "./developers.component";

describe("DevelopersComponent", () => {
  let component: DevelopersComponent;
  let fixture: ComponentFixture<DevelopersComponent>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;

  beforeEach(async () => {
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    await TestBed.configureTestingModule({
      declarations: [DevelopersComponent],
      providers: [
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Developers")),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(DevelopersComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(DevelopersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("crea el componente, carga el breadcrumb y expone el catalogo de desarrolladores", () => {
    expect(component).toBeTruthy();
    expect(component.developers.length).toBe(7);
    expect(component.developers[0].name).toContain("Paola");
    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalledWith([
      { label: "ROA" },
      { label: "Developers", routerLink: ["/developers"] },
    ]);
  });
});
