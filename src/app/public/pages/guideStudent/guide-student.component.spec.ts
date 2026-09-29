import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of, Subject } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { GuideStudentComponent } from "./guide-student.component";

@Pipe({
  name: "translate",
  standalone: false,
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("GuideStudentComponent", () => {
  let component: GuideStudentComponent;
  let fixture: ComponentFixture<GuideStudentComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let breadcrumbSpy: jasmine.SpyObj<BreadcrumbService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"], {
      events: new Subject<unknown>().asObservable(),
    });
    routerSpy.navigate.and.resolveTo(true);
    breadcrumbSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    await TestBed.configureTestingModule({
      declarations: [GuideStudentComponent, TranslatePipeMock],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              firstChild: {
                url: [{ path: "qualifications" }],
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

    fixture = TestBed.createComponent(GuideStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("debe cargar los pasos de la guia estudiantil", () => {
    expect(component.items.map((item) => item.routerLink)).toEqual([
      "qualifications",
      "qualification-by-me",
      "seen-by-me",
    ]);
    expect(component.currentStepLabel).toBe("guideStudent.steps.qualifications");
  });

  it("debe navegar al paso solicitado del stepper", () => {
    component.goToStep(2);

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/guideStudent/seen-by-me"]);
  });

  it("debe publicar el breadcrumb del paso activo", () => {
    expect(breadcrumbSpy.setItems).toHaveBeenCalledWith([
      { label: "menu.studentGuide", routerLink: ["/guideStudent/qualifications"] },
      {
        label: "guideStudent.steps.qualifications",
        routerLink: ["/guideStudent/qualifications"],
      },
    ]);
  });
});
