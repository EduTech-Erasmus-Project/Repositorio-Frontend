import { HttpErrorResponse } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of, Subject, throwError } from "rxjs";

import { LearningObjectService } from "src/app/services/learning-object.service";
import { PreviewingLearningObjectComponent } from "./previewing-learning-object.component";

describe("PreviewingLearningObjectComponent", () => {
  let component: PreviewingLearningObjectComponent;
  let fixture: ComponentFixture<PreviewingLearningObjectComponent>;
  let params$: Subject<Record<string, string>>;
  let objectServiceSpy: jasmine.SpyObj<LearningObjectService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    params$ = new Subject<Record<string, string>>();
    objectServiceSpy = jasmine.createSpyObj("LearningObjectService", ["getObjectDetail"]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    objectServiceSpy.getObjectDetail.and.returnValue(
      of({
        id: 8,
        slug: "oa-preview",
        general_title: "OA preview",
      } as any)
    );

    await TestBed.configureTestingModule({
      imports: [PreviewingLearningObjectComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: params$.asObservable() } },
        { provide: LearningObjectService, useValue: objectServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewingLearningObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("carga el OA a previsualizar desde el slug activo", async () => {
    params$.next({ slug: "oa-preview" });
    await fixture.whenStable();

    expect(objectServiceSpy.getObjectDetail).toHaveBeenCalledWith("oa-preview");
    expect(component.object?.id).toBe(8);
    expect(component.spinnerFlag).toBeTrue();
  });

  it("redirige al inicio cuando la ruta no trae slug", async () => {
    params$.next({} as any);
    await fixture.whenStable();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/"]);
  });

  it("redirige a notfound cuando el detalle responde 404", async () => {
    objectServiceSpy.getObjectDetail.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404 }))
    );

    params$.next({ slug: "missing" });
    await fixture.whenStable();

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/notfound"]);
  });
});
