import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { of } from "rxjs";
import { MessageService } from "primeng/api";
import { AddressService } from "src/app/admin/services/address.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { SearchService } from "src/app/services/search.service";
import { UserService } from "src/app/services/user.service";
import { ProfileComponent } from "./profile.component";

describe("ProfileComponent", () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let component: ProfileComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getCitiesActive",
      "getUniversitiesByCityActive",
      "getCampusByUniversityActive",
    ]);
    searchServiceSpy = jasmine.createSpyObj("SearchService", [
      "getProfession",
      "getLevelEducation",
      "getPreferencesArea",
      "getInterestAreas",
    ]);
    userServiceSpy = jasmine.createSpyObj("UserService", [
      "getUserDetail",
      "updateUser",
      "updateImage",
    ]);
    searchServiceSpy.getProfession.and.returnValue(of([]));
    searchServiceSpy.getLevelEducation.and.returnValue(of({ values: [] } as any));
    searchServiceSpy.getPreferencesArea.and.returnValue(of([]));
    searchServiceSpy.getInterestAreas.and.returnValue(of({ values: [] } as any));
    userServiceSpy.getUserDetail.and.returnValue(of({} as any));
    addressServiceSpy.getCitiesActive.and.returnValue(of([]));
    addressServiceSpy.getUniversitiesByCityActive.and.returnValue(of([]));
    addressServiceSpy.getCampusByUniversityActive.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [ProfileComponent],
      providers: [
        {
          provide: SearchService,
          useValue: searchServiceSpy,
        },
        {
          provide: LoginService,
          useValue: jasmine.createSpyObj(
            "LoginService",
            ["validateRole"],
            { user: { id: 25, roles: ["teacher"] } }
          ),
        },
        {
          provide: UserService,
          useValue: userServiceSpy,
        },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Texto traducido")),
            },
          },
        },
        { provide: AddressService, useValue: addressServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ProfileComponent, {
        set: { template: "" },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  function createStudentUser() {
    return {
      id: 1,
      first_name: "Ana",
      last_name: "Perez",
      email: "ana@test.com",
      student: {
        birthday: "2001-05-20",
        education_levels: [{ id: 2 }],
        knowledge_areas: [{ id: 10 }, { id: 11 }],
        preferences: [{ id: 20 }, { id: 21 }],
        has_disability: true,
        disability_description: "Visual",
      },
      teacher: null,
      collaboratingExpert: null,
    } as any;
  }

  function createTeacherUser() {
    return {
      id: 2,
      first_name: "Carlos",
      last_name: "Lopez",
      email: "carlos@test.com",
      student: null,
      teacher: {
        professions: [{ id: 7, description: "Ingeniero" }],
      },
      collaboratingExpert: null,
      city: { id: 5, name: "Quito" },
      university: { id: 8, name: "UPS" },
      campus: { id: 13, name: "Campus Sur" },
    } as any;
  }

  function createExpertUser() {
    return {
      id: 3,
      first_name: "Laura",
      last_name: "Vera",
      email: "laura@test.com",
      student: null,
      teacher: null,
      collaboratingExpert: {
        expert_level: "Alto",
        web: "https://example.com",
        academic_profile: "Perfil academico",
      },
      city: { id: 9, name: "Cuenca" },
      university: { id: 15, name: "UPS Cuenca" },
      campus: { id: 22, name: "El Vecino" },
    } as any;
  }

  function createTeacherUserWithNumericRelations() {
    return {
      id: 4,
      first_name: "Mario",
      last_name: "Ruiz",
      email: "mario@test.com",
      student: null,
      teacher: {
        professions: [{ id: 9, description: "Licenciado" }],
      },
      collaboratingExpert: null,
      city: 5,
      university: 8,
      campus: 13,
    } as any;
  }

  it("debe crear los controles de estudiante con los valores precargados", () => {
    component.user = createStudentUser();

    component.createForm();

    expect(component.angForm.contains("calendar")).toBeTrue();
    expect(component.angForm.contains("educacionL")).toBeTrue();
    expect(component.angForm.contains("areasInteres")).toBeTrue();
    expect(component.angForm.contains("areasPrefer")).toBeTrue();
    expect(component.angForm.get("calendar")?.value).toBe("2001-05-20");
    expect(component.angForm.get("educacionL")?.value).toBe(2);
    expect(component.angForm.get("areasInteres")?.value).toEqual([10, 11]);
    expect(component.angForm.get("areasPrefer")?.value).toEqual([20, 21]);
    expect(component.angForm.get("check")?.disabled).toBeTrue();
    expect(component.angForm.get("checkTe")?.disabled).toBeTrue();
    expect(component.angForm.get("checkEx")?.disabled).toBeTrue();
  });

  it("debe precargar direccion y profesion para docente", () => {
    component.user = createTeacherUser();

    component.createForm();

    expect(component.angForm.get("profession")?.value).toBe(7);
    expect(component.angForm.get("city")?.value).toBe(5);
    expect(component.angForm.get("university")?.value).toBe(8);
    expect(component.angForm.get("campus")?.value).toBe(13);
  });

  it("debe soportar direccion como ids numericos planos", () => {
    component.user = createTeacherUserWithNumericRelations();

    component.createForm();

    expect(component.angForm.get("profession")?.value).toBe(9);
    expect(component.angForm.get("city")?.value).toBe(5);
    expect(component.angForm.get("university")?.value).toBe(8);
    expect(component.angForm.get("campus")?.value).toBe(13);
  });

  it("debe precargar direccion y datos academicos para experto", () => {
    component.user = createExpertUser();

    component.createForm();

    expect(component.angForm.get("levelExpertF")?.value).toBe("Alto");
    expect(component.angForm.get("url")?.value).toBe("https://example.com");
    expect(component.angForm.get("academic")?.value).toBe("Perfil academico");
    expect(component.angForm.get("city")?.value).toBe(9);
    expect(component.angForm.get("university")?.value).toBe(15);
    expect(component.angForm.get("campus")?.value).toBe(22);
  });

  it("debe exigir descripcion de discapacidad cuando el valor es yes", () => {
    component.user = createStudentUser();
    component.createForm();

    component.angForm.get("disability")?.setValue("yes");
    component.angForm.get("typeDisability")?.setValue(null);
    component.onChangeDisability();

    expect(component.angForm.get("typeDisability")?.hasError("required")).toBeTrue();

    component.angForm.get("disability")?.setValue("no");
    component.onChangeDisability();

    expect(component.angForm.get("typeDisability")?.value).toBe("Ninguna");
    expect(component.angForm.get("typeDisability")?.hasError("required")).toBeFalse();
  });

  it("debe mapear correctamente profession y direccion para docente", () => {
    component.user = createTeacherUser();
    component.createForm();

    component.angForm.patchValue({
      name: "Carlos",
      lastname: "Lopez",
      profession: 7,
      city: 5,
      university: 8,
      campus: 13,
    });

    component.getDataMaped();

    expect(component.user.roles).toEqual(["teacher"]);
    expect(component.user.professions).toEqual([7]);
    expect(component.user.city).toBe(5);
    expect(component.user.university).toBe(8);
    expect(component.user.campus).toBe(13);
  });

  it("debe mapear direccion y datos de experto al guardar", () => {
    component.user = createExpertUser();
    component.createForm();

    component.angForm.patchValue({
      levelExpertF: "Medio",
      url: "https://nuevo.example.com",
      academic: "Nuevo perfil",
      city: 9,
      university: 15,
      campus: 22,
    });

    component.getDataMaped();

    expect(component.user.roles).toEqual(["expert"]);
    expect(component.user.expert_level).toBe("Medio");
    expect(component.user.collaboratingExpert.expert_level).toBe("Medio");
    expect(component.user.web).toBe("https://nuevo.example.com");
    expect(component.user.academic_profile).toBe("Nuevo perfil");
    expect(component.user.city).toBe(9);
    expect(component.user.university).toBe(15);
    expect(component.user.campus).toBe(22);
  });

  it("debe construir el payload de actualizacion para docente", () => {
    component.user = createTeacherUser();
    component.createForm();

    component.angForm.patchValue({
      name: "Carlos",
      lastname: "Lopez",
      email: "carlos@test.com",
      profession: 7,
      city: 5,
      university: 8,
      campus: 13,
    });

    const payload = (component as any).buildUpdatePayload();

    expect(payload.roles).toEqual(["teacher"]);
    expect(payload.professions).toEqual([7]);
    expect(payload.city).toBe(5);
    expect(payload.university).toBe(8);
    expect(payload.campus).toBe(13);
  });

  it("debe construir el payload de actualizacion para experto", () => {
    component.user = createExpertUser();
    component.createForm();

    component.angForm.patchValue({
      name: "Laura",
      lastname: "Vera",
      email: "laura@test.com",
      levelExpertF: "Medio",
      url: "https://nuevo.example.com",
      academic: "Nuevo perfil",
      city: 9,
      university: 15,
      campus: 22,
    });

    const payload = (component as any).buildUpdatePayload();

    expect(payload.roles).toEqual(["expert"]);
    expect(payload.expert_level).toBe("Medio");
    expect(payload.web).toBe("https://nuevo.example.com");
    expect(payload.academic_profile).toBe("Nuevo perfil");
    expect(payload.city).toBe(9);
    expect(payload.university).toBe(15);
    expect(payload.campus).toBe(22);
  });

  it("debe cargar universidades al cambiar de ciudad", async () => {
    component.user = createTeacherUser();
    component.createForm();
    addressServiceSpy.getUniversitiesByCityActive.and.returnValue(
      of([{ id: 30, name: "UPS Nueva" }] as any)
    );

    await component.onChangeCity({ target: { value: 30 } } as any);

    expect(component.angForm.get("city")?.value).toBe(30);
    expect(addressServiceSpy.getUniversitiesByCityActive).toHaveBeenCalledWith(30);
    expect(component.universities).toEqual([{ id: 30, name: "UPS Nueva" }] as any);
  });

  it("debe cargar campus al cambiar de universidad", async () => {
    component.user = createTeacherUser();
    component.createForm();
    addressServiceSpy.getCampusByUniversityActive.and.returnValue(
      of([{ id: 40, name: "Campus Norte" }] as any)
    );

    await component.onChangeUniversity({ target: { value: 40 } } as any);

    expect(component.angForm.get("university")?.value).toBe(40);
    expect(addressServiceSpy.getCampusByUniversityActive).toHaveBeenCalledWith(40);
    expect(component.campusArray).toEqual([{ id: 40, name: "Campus Norte" }] as any);
  });

  it("debe generar la previsualizacion local al seleccionar una nueva imagen", () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const fileReaderMock = {
      onload: null as ((event: { target: { result: string } }) => void) | null,
      readAsDataURL: jasmine.createSpy("readAsDataURL").and.callFake(function (this: any, selectedFile: File) {
        this.onload?.({ target: { result: `data:${selectedFile.type};base64,preview` } });
      }),
    };

    spyOn(window as any, "FileReader").and.returnValue(fileReaderMock as any);

    component.onChangePicture({
      target: {
        files: [file],
      },
    } as any);

    expect(component.fileImage).toBe(file);
    expect(component.urlImageLocal).toBe("data:image/png;base64,preview");
  });
});
