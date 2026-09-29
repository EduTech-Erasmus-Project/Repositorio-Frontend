import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { TeacherExpertProfileComponent } from "./teacher-expert-profile.component";

describe("TeacherExpertProfileComponent", () => {
  let component: TeacherExpertProfileComponent;
  let fixture: ComponentFixture<TeacherExpertProfileComponent>;
  let administratorServiceSpy: jasmine.SpyObj<AdministratorService>;

  beforeEach(async () => {
    administratorServiceSpy = jasmine.createSpyObj("AdministratorService", [
      "getTeacherAndExpertToAproveProfile",
      "getTeacherAndExpertprovedProfile",
    ]);

    administratorServiceSpy.getTeacherAndExpertToAproveProfile.and.returnValue(
      of({
        id: 1,
        first_name: "Ana",
        last_name: "Mora",
        email: "ana@test.com",
        rol_solicitados: ["teacher", "expert"],
        teacher: {
          professions: [{ description: "Ingeniera" }],
        },
        collaboratingExpert: {
          academic_profile: "Perfil academico",
          web: "orcid.org/0000-0001",
        },
      } as any)
    );
    administratorServiceSpy.getTeacherAndExpertprovedProfile.and.returnValue(
      of({
        id: 2,
        first_name: "Luis",
        last_name: "Perez",
        email: "luis@test.com",
        roles: ["expert"],
        collaboratingExpert: {
          academic_profile: "Perfil aprobado",
        },
      } as any)
    );

    await TestBed.configureTestingModule({
      declarations: [TeacherExpertProfileComponent],
      providers: [
        { provide: AdministratorService, useValue: administratorServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { id: 1, status: "pending" },
              routeConfig: { path: "teacher/request/pending/teacher-expert-profile/:id/:status" },
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TeacherExpertProfileComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(TeacherExpertProfileComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar el perfil pendiente y resolver roles solicitados", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(administratorServiceSpy.getTeacherAndExpertToAproveProfile).toHaveBeenCalledWith(1);
    expect(component.rolesList).toEqual(["teacher", "expert"]);
    expect(component.rolText).toContain("Roles solicitados");
    expect(component.getUserFullName()).toBe("Ana Mora");
    expect(component.getExternalUrl("orcid.org/0000-0001")).toBe(
      "https://orcid.org/0000-0001"
    );
  });

  it("debe resolver roles aprobados usando fallback cuando el endpoint no trae rol_aprovados", async () => {
    (
      TestBed.inject(ActivatedRoute) as any
    ).snapshot.params = { id: 2, status: "approved" };
    (component as any).id = 2;
    (component as any).status = "approved";

    await component.loadProfile();

    expect(administratorServiceSpy.getTeacherAndExpertprovedProfile).toHaveBeenCalledWith(2);
    expect(component.rolesList).toEqual(["expert"]);
    expect(component.rolText).toContain("Rol aprobado");
  });
});
