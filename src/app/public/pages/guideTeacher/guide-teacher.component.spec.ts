import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { of, Subject } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { GuideTeacherComponent } from "./guide-teacher.component";

@Pipe({
  name: "translate",
  standalone: false,
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("GuideTeacherComponent", () => {
  let component: GuideTeacherComponent;
  let fixture: ComponentFixture<GuideTeacherComponent>;
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
          url: [{ path: "uploadfile-adapted" }],
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [GuideTeacherComponent, TranslatePipeMock],
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

    fixture = TestBed.createComponent(GuideTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("debe construir los pasos docentes y publicar su breadcrumb", () => {
    expect(component.items.map((item) => item.routerLink)).toEqual([
      "uploadfile",
      "uploadfile-adapted",
      "my-objects",
    ]);
    expect(component.activeIndex).toBe(1);
    expect(breadcrumbSpy.setItems).toHaveBeenCalledWith([
      { label: "menu.teacherGuide", routerLink: ["/guideTeacher/uploadfile"] },
      {
        label: "buttons.uploadOaOer",
        routerLink: ["/guideTeacher/uploadfile-adapted"],
      },
    ]);
  });

  it("debe recalcular el estado cuando cambia la ruta hija", async () => {
    activatedRouteStub.snapshot.firstChild.url = [{ path: "my-objects" }];

    routerEvents$.next(new NavigationEnd(1, "/guideTeacher/uploadfile-adapted", "/guideTeacher/my-objects"));
    await fixture.whenStable();

    expect(component.activeIndex).toBe(2);
    expect(component.currentStepLabel).toBe("buttons.viewMyOa");
  });

  it("debe reiniciar la guia hacia la seleccion de perfiles", () => {
    component.resetPage();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/guide/registration-profile"]);
  });
});
