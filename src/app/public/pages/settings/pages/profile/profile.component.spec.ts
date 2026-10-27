import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { of, throwError } from "rxjs";
import { MessageService } from "primeng/api";
import Swal from "sweetalert2";
import { UserLocation } from "src/app/core/interfaces/user-location";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { SearchService } from "src/app/services/search.service";
import { UserService } from "src/app/services/user.service";
import { ProfileComponent } from "./profile.component";

const EC_LOCATION: UserLocation = {
  country_code: "EC",
  country_name: "Ecuador",
  province_code: "P",
  province_name: "Pichincha",
  city_name: "Quito",
  university_name: "UPS",
};

const MX_LOCATION: UserLocation = {
  country_code: "MX",
  country_name: "México",
  province_code: "JAL",
  province_name: "Jalisco",
  city_name: "Guadalajara",
  university_name: "Universidad de Guadalajara",
};

describe("ProfileComponent", () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let component: ProfileComponent;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);
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
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Texto traducido")),
              instant: (key: string) => ({ "location.city": "Ciudad" })[key] ?? key,
            },
          },
        },
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
      ...EC_LOCATION,
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
      ...MX_LOCATION,
    } as any;
  }

  function createTeacherUserWithoutLocation() {
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
      country_code: "",
      country_name: "",
      province_code: "",
      province_name: "",
      city_name: "",
      university_name: "",
    } as any;
  }

  it("debe detectar cambios sin guardar y descartarlos", async () => {
    component.user = createTeacherUser();
    await component.discardChanges();

    expect(component.hasUnsavedChanges).toBeFalse();
    expect(component.confirmLeave()).toBeTrue();

    component.angForm.get("name")?.setValue("Carla");
    expect(component.hasUnsavedChanges).toBeTrue();

    // Volver al valor original tambien cuenta como sin cambios.
    component.angForm.get("name")?.setValue("Carlos");
    expect(component.hasUnsavedChanges).toBeFalse();

    // El usuario cambia la ubicacion (el componente marca el control como modificado).
    const location = component.angForm.get("location");
    location?.markAsDirty();
    location?.setValue(MX_LOCATION);
    expect(component.hasUnsavedChanges).toBeTrue();

    await component.discardChanges();
    expect(component.hasUnsavedChanges).toBeFalse();
    expect(component.angForm.get("location")?.value).toEqual(EC_LOCATION);
  });

  it("no debe marcar cambios cuando la precarga completa la ubicacion de un usuario migrado", async () => {
    component.user = { ...createTeacherUser(), province_code: "", province_name: "PICHINCHA" };
    await component.discardChanges();

    // Lo que hace `app-user-location-fields` al terminar de precargar: completa
    // el codigo y el nombre de la provincia sin marcar el control.
    component.angForm.get("location")?.setValue(EC_LOCATION, { emitModelToViewChange: false });

    expect(component.angForm.get("location")?.pristine).toBeTrue();
    expect(component.hasUnsavedChanges).toBeFalse();
    expect(component.confirmLeave()).toBeTrue();
  });

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

  it("debe precargar la ubicacion y la profesion del docente", () => {
    component.user = createTeacherUser();

    component.createForm();

    expect(component.angForm.get("profession")?.value).toBe(7);
    expect(component.angForm.get("location")?.value).toEqual(EC_LOCATION);
    expect(component.angForm.contains("city")).toBeFalse();
    expect(component.angForm.contains("campus")).toBeFalse();
  });

  it("debe pedir la ubicacion si el usuario no tiene una guardada", () => {
    component.user = createTeacherUserWithoutLocation();

    component.createForm();

    expect(component.angForm.get("location")?.value).toBeNull();
    expect(component.angForm.get("location")?.hasError("required")).toBeTrue();
  });

  it("no debe pedir ubicacion al estudiante", () => {
    component.user = createStudentUser();

    component.createForm();

    expect(component.angForm.contains("location")).toBeFalse();
  });

  it("debe precargar la ubicacion y los datos academicos del experto", () => {
    component.user = createExpertUser();

    component.createForm();

    expect(component.angForm.get("levelExpertF")?.value).toBe("Alto");
    expect(component.angForm.get("url")?.value).toBe("https://example.com");
    expect(component.angForm.get("academic")?.value).toBe("Perfil academico");
    expect(component.angForm.get("location")?.value).toEqual(MX_LOCATION);
  });

  it("debe aceptar un enlace como perfil academico", () => {
    component.user = createExpertUser();
    component.createForm();

    component.angForm.get("academic")?.setValue("https://orcid.org/0000-0002-1825-0097");

    expect(component.angForm.get("academic")?.valid).toBeTrue();
  });

  it("debe aceptar nombres con tildes y de otros idiomas hasta 50 caracteres", () => {
    component.user = createTeacherUser();
    component.createForm();

    for (const value of ["Lucía", "Peña Gómez", "Zoë", "O'Connor", "Müller-Chen"]) {
      component.angForm.get("lastname")?.setValue(value);
      expect(component.angForm.get("lastname")?.valid).withContext(value).toBeTrue();
    }
    component.angForm.get("name")?.setValue("A".repeat(51));
    expect(component.angForm.get("name")?.hasError("maxlength")).toBeTrue();
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

  it("debe mapear profesion y ubicacion del docente", () => {
    component.user = createTeacherUser();
    component.createForm();

    component.angForm.patchValue({
      name: "Carlos",
      lastname: "Lopez",
      profession: 7,
      location: MX_LOCATION,
    });

    component.getDataMaped();

    expect(component.user.roles).toEqual(["teacher"]);
    expect(component.user.professions).toEqual([7]);
    expect(component.user).toEqual(jasmine.objectContaining(MX_LOCATION));
  });

  it("debe mapear ubicacion y datos de experto al guardar", () => {
    component.user = createExpertUser();
    component.createForm();

    component.angForm.patchValue({
      levelExpertF: "Medio",
      url: "https://nuevo.example.com",
      academic: "Nuevo perfil",
      location: EC_LOCATION,
    });

    component.getDataMaped();

    expect(component.user.roles).toEqual(["expert"]);
    expect(component.user.expert_level).toBe("Medio");
    expect(component.user.collaboratingExpert.expert_level).toBe("Medio");
    expect(component.user.web).toBe("https://nuevo.example.com");
    expect(component.user.academic_profile).toBe("Nuevo perfil");
    expect(component.user).toEqual(jasmine.objectContaining(EC_LOCATION));
  });

  it("debe enviar los seis campos de ubicacion del docente", () => {
    component.user = createTeacherUser();
    component.createForm();

    component.angForm.patchValue({
      name: "Carlos",
      lastname: "Lopez",
      email: "carlos@test.com",
      profession: 7,
    });

    const payload = (component as any).buildUpdatePayload();

    expect(payload.roles).toEqual(["teacher"]);
    expect(payload.professions).toEqual([7]);
    expect(payload).toEqual(jasmine.objectContaining(EC_LOCATION));
    expect(payload.city).toBeUndefined();
    expect(payload.university).toBeUndefined();
    expect(payload.campus).toBeUndefined();
  });

  it("debe enviar provincia y ciudad vacias al cambiar a un pais sin provincias", () => {
    component.user = createTeacherUser();
    component.createForm();

    component.angForm.patchValue({
      location: {
        country_code: "MO",
        country_name: "Macau S.A.R.",
        province_code: "",
        province_name: "",
        city_name: "Macao",
        university_name: "University of Macau",
      },
    });

    const payload = (component as any).buildUpdatePayload();

    expect(payload.country_code).toBe("MO");
    expect(payload.province_code).toBe("");
    expect(payload.province_name).toBe("");
    expect(payload.city_name).toBe("Macao");
  });

  it("debe enviar la ubicacion y los datos del experto", () => {
    component.user = createExpertUser();
    component.createForm();

    component.angForm.patchValue({
      name: "Laura",
      lastname: "Vera",
      email: "laura@test.com",
      levelExpertF: "Medio",
      url: "https://nuevo.example.com",
      academic: "Nuevo perfil",
    });

    const payload = (component as any).buildUpdatePayload();

    expect(payload.roles).toEqual(["expert"]);
    expect(payload.expert_level).toBe("Medio");
    expect(payload.web).toBe("https://nuevo.example.com");
    expect(payload.academic_profile).toBe("Nuevo perfil");
    expect(payload).toEqual(jasmine.objectContaining(MX_LOCATION));
  });

  it("no debe enviar ubicacion en el perfil del estudiante", () => {
    component.user = createStudentUser();
    component.createForm();

    const payload = (component as any).buildUpdatePayload();

    expect(payload.country_code).toBeUndefined();
    expect(payload.city_name).toBeUndefined();
  });

  it("debe tomar lo recien guardado como base para descartar cambios", async () => {
    component.user = createTeacherUser();
    await component.discardChanges();
    // El PUT solo responde un mensaje; el perfil vuelve a pedir el usuario.
    userServiceSpy.updateUser.and.returnValue(of({ message: "success update" } as any));
    userServiceSpy.getUserDetail.and.returnValue(of({ ...createTeacherUser(), ...MX_LOCATION } as any));
    spyOn(Swal, "fire");
    spyOn(Swal, "showLoading");
    spyOn(Swal, "close");

    const location = component.angForm.get("location");
    location?.markAsDirty();
    location?.setValue(MX_LOCATION);
    component.angForm.patchValue({ profession: 7 });
    await component.validateUser();

    expect(userServiceSpy.getUserDetail).toHaveBeenCalled();
    expect(component.hasUnsavedChanges).toBeFalse();
    await component.discardChanges();
    expect(component.angForm.get("location")?.value).toEqual(MX_LOCATION);
  });

  it("debe mostrar los errores de ubicacion que devuelve el backend", async () => {
    component.user = createTeacherUser();
    component.createForm();
    component.angForm.patchValue({ profession: 7 });
    userServiceSpy.updateUser.and.returnValue(
      throwError(() => ({ status: 400, error: { city_name: ["Este campo es obligatorio."] } }))
    );

    await component.validateUser();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: "error", detail: "Ciudad: Este campo es obligatorio." })
    );
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
