import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of, Subject } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { GuideExpertComponent } from "./guide-expert.component";

@Pipe({
  name: "translate",
  standalone: false,
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("GuideExpertComponent", () => {
  let component: GuideExpertComponent;
  let fixture: ComponentFixture<GuideExpertComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let breadcrumbSpy: jasmine.SpyObj<BreadcrumbService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"], {
      events: new Subject<unknown>().asObservable(),
    });
    routerSpy.navigate.and.resolveTo(true);
    breadcrumbSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    await TestBed.configureTestingModule({
      declarations: [GuideExpertComponent, TranslatePipeMock],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              firstChild: {
                url: [{ path: "expert-evaluation" }],
              },
            },
          },
        },
        { provide: BreadcrumbService, useValue: breadcrumbSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: (key: string) => of(key),
              instant: (key: string) => key,
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GuideExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("debe cargar el paso unico de la guia experta", () => {
    expect(component.items).toEqual([
      {
        label: "menu.sideMenu.qualificateOa",
        routerLink: "expert-evaluation",
      },
    ]);
    expect(component.currentStepLabel).toBe("menu.sideMenu.qualificateOa");
  });

  it("debe publicar el breadcrumb de la guia experta", () => {
    expect(breadcrumbSpy.setItems).toHaveBeenCalledWith([
      { label: "menu.expertGuide", routerLink: ["/guideExpert/expert-evaluation"] },
      {
        label: "menu.sideMenu.qualificateOa",
        routerLink: ["/guideExpert/expert-evaluation"],
      },
    ]);
  });

  it("debe reiniciar la guia hacia el selector de perfiles", () => {
    component.resetPage();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/guide/registration-profile"]);
  });
});
