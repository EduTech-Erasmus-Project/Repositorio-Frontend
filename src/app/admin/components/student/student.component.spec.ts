import { NO_ERRORS_SCHEMA } from "@angular/core";
import { fakeAsync, ComponentFixture, TestBed, tick } from "@angular/core/testing";
import { of } from "rxjs";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { StudentComponent } from "./student.component";

describe("StudentComponent", () => {
  let component: StudentComponent;
  let fixture: ComponentFixture<StudentComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj<AdministratorService>("AdministratorService", [
      "getStudentList",
    ]);
    breadcrumbServiceSpy = jasmine.createSpyObj<BreadcrumbService>("BreadcrumbService", ["setItems"]);

    administratorServiceSpy.getStudentList.and.returnValue(
      of({
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            first_name: "Maria",
            last_name: "Lopez",
            email: "maria@test.com",
            image_url: "avatar.png",
            student: {
              disability_description: "Ninguna",
              preferences: [{ description: "Visual" }],
            },
          },
          {
            id: 2,
            first_name: "Juan",
            last_name: "Perez",
            email: "juan@test.com",
            student: {
              disability_description: "",
              preferences: [],
            },
          },
        ],
      })
    );

    await TestBed.configureTestingModule({
      declarations: [StudentComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        { provide: AdminComponent, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(StudentComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(StudentComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar estudiantes al iniciar", () => {
    fixture.detectChanges();

    expect(breadcrumbServiceSpy.setItems).toHaveBeenCalled();
    expect(administratorServiceSpy.getStudentList).toHaveBeenCalledWith(1, "");
    expect(component.hasLoaded).toBeTrue();
    expect(component.isLoading).toBeFalse();
    expect(component.listStudent.length).toBe(2);
    expect(component.totalRecords).toBe(2);
  });

  it("debe disparar nueva busqueda al escribir en el filtro", fakeAsync(() => {
    fixture.detectChanges();
    administratorServiceSpy.getStudentList.calls.reset();

    component.onSearchInput(" maria ");
    tick(300);

    expect(administratorServiceSpy.getStudentList).toHaveBeenCalledWith(1, "maria");
    expect(component.searchTerm).toBe("maria");
  }));

  it("debe exponer avatar y preferencias normalizadas", () => {
    const student = {
      image_url: "",
      image: "fallback.png",
      student: {
        preferences: [{ description: "Audio" }, { description: "Texto" }],
      },
    };

    expect(component.getAvatar(student as never)).toBe("fallback.png");
    expect(component.getPreferenceLabels(student as never)).toEqual(["Audio", "Texto"]);
  });
});
