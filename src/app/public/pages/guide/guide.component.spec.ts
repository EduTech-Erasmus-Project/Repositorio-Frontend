import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { of, Subject } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { GuideComponent } from "./guide.component";

@Pipe({
  name: "translate",
  standalone: false,
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("GuideComponent", () => {
  let component: GuideComponent;
  let fixture: ComponentFixture<GuideComponent>;
  let routerEvents$: Subject<unknown>;
  let routerSpy: jasmine.SpyObj<Router>;
  let breadcrumbSpy: jasmine.SpyObj<BreadcrumbService>;
  let activatedRouteStub: {
    snapshot: {
      firstChild: { url: Array<{ path: string }> };
    };
  };

  beforeEach(async () => {
    routerEvents$ = new Subject<unknown>();
    routerSpy = jasmine.createSpyObj("Router", ["navigate"], {
      events: routerEvents$.asObservable(),
    });
    routerSpy.navigate.and.resolveTo(true);
    breadcrumbSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);
    activatedRouteStub = {
      snapshot: {
        firstChild: {
          url: [{ path: "search-public" }],
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [GuideComponent, TranslatePipeMock],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
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

    fixture = TestBed.createComponent(GuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("debe construir los pasos y sincronizar el breadcrumb con la ruta hija activa", () => {
    expect(component.items.map((item) => item.routerLink)).toEqual([
      "eXeLearning",
      "introduction",
      "search-public",
      "registration-profile",
    ]);
    expect(component.activeIndex).toBe(2);
    expect(breadcrumbSpy.setItems).toHaveBeenCalledWith([
      { label: "menu.userGuide", routerLink: ["/guide"] },
      { label: "buttons.searchOa", routerLink: ["/guide/search-public"] },
    ]);
  });

  it("debe recalcular el paso activo cuando cambia la navegacion hija", async () => {
    activatedRouteStub.snapshot.firstChild.url = [{ path: "registration-profile" }];

    routerEvents$.next(new NavigationEnd(1, "/guide/search-public", "/guide/registration-profile"));
    await fixture.whenStable();

    expect(component.activeIndex).toBe(3);
    expect(component.currentStepLabel).toBe("buttons.profileRegister");
  });

  it("debe navegar al siguiente paso disponible", () => {
    component.nextPage();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/guide/registration-profile"]);
  });
});
