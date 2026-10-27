import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
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

  it("no debe armar la ficha publica si el docente nunca guardo su perfil", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.publicProfile).toBeNull();
    expect(component.publicProfileCard).toBeNull();
  });

  it("debe armar la ficha publica con todo lo guardado, tambien lo oculto", async () => {
    administratorServiceSpy.getTeacherAndExpertToAproveProfile.and.returnValue(
      of({
        id: 1,
        first_name: "Ana",
        last_name: "Mora",
        teacher: { professions: [{ description: "Ingeniera" }] },
        public_profile: {
          user_key: "3f2b8c1e-5d4a-4c1b-9a77-2f1e0c9b8a10",
          is_public: false,
          headline: "Docente de Ingenieria Civil",
          faculty: "Ingenieria",
          bio: "",
          research_lines: ["Hidraulica"],
          subjects: [],
          research_group: "GIIT",
          field_visibility: {
            headline: "public",
            faculty: "public",
            bio: "public",
            research_lines: "public",
            subjects: "public",
            research_group: "private",
          },
          highest_degree: "phd",
          links: [{ type: "orcid", url: "https://orcid.org/0000-0002-1825-0097", order: 1, is_visible: false }],
          degrees: [],
        },
      } as any)
    );

    await component.loadProfile();

    expect(component.publicProfile?.is_public).toBeFalse();
    expect(component.publicProfileCard).toEqual(
      jasmine.objectContaining({
        headline: "Docente de Ingenieria Civil",
        research_group: "GIIT",
        highest_degree: "phd",
      })
    );
    expect(component.publicProfileCard?.links?.[0].is_visible).toBeFalse();
    expect(component.publicProfileCard?.professions).toBeUndefined();
  });

  it("debe mostrar los OA que envia el detalle con estado, vistas y descargas", async () => {
    administratorServiceSpy.getTeacherAndExpertprovedProfile.and.returnValue(
      of({
        id: 2,
        teacher: { id: 51, is_active: true, professions: [] },
        public_profile: null,
        learning_objects: [
          { id: 7, slug: "oa-7", general_title: "OA 7", avatar: "https://x/7.png", created: "2026-09-18T10:00:00Z", public: true, views: 14, downloads: 3 },
          { id: 6, slug: "oa-6", general_title: "OA 6", avatar: null, created: "2026-09-14T10:00:00Z", public: false, views: 0, downloads: 0 },
        ],
      } as any)
    );
    (component as any).id = 2;
    (component as any).status = "approved";

    await component.loadProfile();

    expect(component.openPanels).toEqual(["learning-objects"]);
    expect(component.learningObjects.length).toBe(2);
    expect(component.learningObjects[0]).toEqual(
      jasmine.objectContaining({ slug: "oa-7", avatar: "https://x/7.png", views: 14, downloads: 3 })
    );
    expect(component.publicLearningObjectsCount).toBe(1);
    expect(component.getLearningObjectLink(component.learningObjects[0])).toBe(
      "/admin/teacher/request/approved/learning-object/upload/detail/oa-7"
    );
  });

  it("no debe mostrar OA si el detalle no los trae", async () => {
    administratorServiceSpy.getTeacherAndExpertprovedProfile.and.returnValue(
      of({ id: 2, teacher: { id: 51, is_active: true }, public_profile: null } as any)
    );
    (component as any).id = 2;
    (component as any).status = "approved";

    await component.loadProfile();

    expect(component.learningObjects).toEqual([]);
    expect(component.publicLearningObjectsCount).toBe(0);
  });

  it("no debe tener OA si el usuario no es docente", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isApproved).toBeFalse();
    expect(component.learningObjects).toEqual([]);
  });

  it("debe abrir el OA al hacer clic en la fila", () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, "navigateByUrl").and.returnValue(Promise.resolve(true));

    component.openLearningObject({ slug: "oa-7" });
    component.openLearningObject({ general_title: "Sin slug" });

    expect(navigateSpy).toHaveBeenCalledOnceWith(
      "/admin/teacher/request/approved/learning-object/upload/detail/oa-7"
    );
  });

  it("debe abrir los OA de un pendiente sin perfil publico ni rol de experto", async () => {
    administratorServiceSpy.getTeacherAndExpertToAproveProfile.and.returnValue(
      of({
        id: 1,
        teacher: { id: 51, is_active: false },
        public_profile: null,
        learning_objects: [{ id: 1, slug: "oa-1", general_title: "OA 1", public: false, views: 0, downloads: 0 }],
      } as any)
    );

    await component.loadProfile();

    expect(component.openPanels).toEqual(["learning-objects"]);
  });

  it("debe mostrar el panel del perfil publico vacio si el docente no lo configuro", async () => {
    administratorServiceSpy.getTeacherAndExpertprovedProfile.and.returnValue(
      of({ id: 3, teacher: { id: 52, is_active: true }, public_profile: null } as any)
    );
    (component as any).id = 3;
    (component as any).status = "approved";

    await component.loadProfile();

    // Sin OA ni experto, el unico panel es el del perfil (vacio) y se abre.
    expect(component.openPanels).toEqual(["public-profile"]);
    expect(component.teacher).toBeTruthy();
    expect(component.publicProfileCard).toBeNull();
  });

  it("debe mostrar la universidad y la ubicacion del docente", async () => {
    administratorServiceSpy.getTeacherAndExpertToAproveProfile.and.returnValue(
      of({
        id: 1,
        country_code: "EC",
        country_name: "Ecuador",
        province_code: "A",
        province_name: "Azuay",
        city_name: "Cuenca",
        university_name: "UPS",
        teacher: {},
      } as any)
    );

    await component.loadProfile();

    expect(component.institution).toBe("UPS · Cuenca, Azuay, Ecuador");
  });

  it("debe mostrar solo lo que tenga de la ubicacion", async () => {
    administratorServiceSpy.getTeacherAndExpertToAproveProfile.and.returnValue(
      of({ id: 1, country_name: "Macau S.A.R.", city_name: "Macao", province_name: "", university_name: "", teacher: {} } as any)
    );

    await component.loadProfile();

    expect(component.institution).toBe("Macao, Macau S.A.R.");
  });
});
