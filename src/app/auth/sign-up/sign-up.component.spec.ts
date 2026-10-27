import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { of, BehaviorSubject, throwError } from "rxjs";
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { SearchService } from "src/app/services/search.service";
import { UserService } from "src/app/services/user.service";
import { UserLocation } from "src/app/core/interfaces/user-location";
import { SignUpComponent } from "./sign-up.component";

const EC_LOCATION: UserLocation = {
  country_code: "EC",
  country_name: "Ecuador",
  province_code: "P",
  province_name: "Pichincha",
  city_name: "Quito",
  university_name: "Universidad Politecnica Salesiana",
};

const DE_LOCATION: UserLocation = {
  country_code: "DE",
  country_name: "Alemania",
  province_code: "BY",
  province_name: "Bavaria",
  city_name: "Kleinstadt",
  university_name: "Technische Universitat Munchen",
};

@Pipe({
    name: "translate",
    standalone: false
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe("SignUpComponent", () => {
  let fixture: ComponentFixture<SignUpComponent>;
  let component: SignUpComponent;
  let routeParams$: BehaviorSubject<any>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  const instantTranslations: Record<string, string> = {
    "message.titleError": "Error",
    "register.submitting": "Registrando...",
    "location.city": "Ciudad",
  };

  beforeEach(async () => {
    routeParams$ = new BehaviorSubject<any>({ register: "student" });

    userServiceSpy = jasmine.createSpyObj("UserService", ["registerUser"]);
    searchServiceSpy = jasmine.createSpyObj("SearchService", [
      "getProfession",
      "getLevelEducation",
      "getPreferencesArea",
      "getInterestAreas",
      "getTypeUserProfile",
      "getEmailExtension",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);
    searchServiceSpy.getProfession.and.returnValue(of([]));
    searchServiceSpy.getLevelEducation.and.returnValue(of({ values: [] }));
    searchServiceSpy.getPreferencesArea.and.returnValue(of([]));
    searchServiceSpy.getInterestAreas.and.returnValue(of({ values: [] }));
    searchServiceSpy.getTypeUserProfile.and.returnValue(of([]));
    searchServiceSpy.getEmailExtension.and.returnValue(
      of({ code: 200, data: [] })
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [SignUpComponent, TranslatePipeMock],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: SearchService, useValue: searchServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: routeParams$.asObservable() },
        },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.returnValue(of("Texto traducido")),
              instant: jasmine
                .createSpy("instant")
                .and.callFake((key: string) => instantTranslations[key] || ""),
            },
          },
        },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SignUpComponent, {
        set: { template: "" },
      })
      .compileComponents();

    spyOn(Swal, "fire");
    spyOn(Swal, "showLoading");
    spyOn(Swal, "close");
  });

  function createComponent(registerType: string) {
    routeParams$.next({ register: registerType });
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return component;
  }

  function createComponentWithoutRegisterParam() {
    routeParams$.next({});
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return component;
  }

  it("debe redirigir a /register cuando el parametro de tipo es invalido", () => {
    createComponent("otro");

    expect(routerSpy.navigate).toHaveBeenCalledWith(["/register"]);
  });

  it("debe permitir crear el formulario base cuando la ruta /register no trae tipo", async () => {
    createComponentWithoutRegisterParam();
    await component.loadInitialCatalogsAndCreateForm();

    expect(component.angForm).toBeTruthy();
    expect(component.angForm.contains("name")).toBeTrue();
    expect(component.angForm.contains("email")).toBeTrue();
    expect(component.angForm.get("check")?.disabled).toBeFalse();
    expect(component.angForm.get("checkTe")?.disabled).toBeFalse();
    expect(component.angForm.get("checkEx")?.disabled).toBeFalse();
  });

  it("no debe enviar el registro si la seleccion de rol es inconsistente", async () => {
    createComponentWithoutRegisterParam();
    component.createForm();
    userServiceSpy.registerUser.and.returnValue(of({ id: 88 }));

    component.angForm.patchValue({
      name: "Ana",
      lastname: "Perez",
      email: "ana@test.com",
      password: "Password1",
      terms: true,
      check: true,
      checkTe: true,
    });

    await component.validateUser();

    expect(userServiceSpy.registerUser).not.toHaveBeenCalled();
    expect(component.validateRole).toBeTrue();
  });

  it("debe crear los controles de estudiante y deshabilitar los otros roles", () => {
    createComponent("student");

    component.createForm();

    expect(component.angForm.contains("calendar")).toBeTrue();
    expect(component.angForm.contains("educacionL")).toBeTrue();
    expect(component.angForm.contains("areasInteres")).toBeTrue();
    expect(component.angForm.contains("areasPrefer")).toBeTrue();
    expect(component.angForm.get("checkTe")?.disabled).toBeTrue();
    expect(component.angForm.get("checkEx")?.disabled).toBeTrue();
  });

  it("debe abrir el modal de terminos y aceptar marcando el control", () => {
    createComponent("student");
    component.createForm();
    const trigger = document.createElement("button");

    component.openTermsDialog({ currentTarget: trigger } as unknown as Event);
    expect(component.termsDialogVisible).toBeTrue();

    component.acceptTermsFromDialog();

    expect(component.terms?.value).toBeTrue();
    expect(component.terms?.touched).toBeTrue();
    expect(component.termsDialogVisible).toBeFalse();
  });

  it("debe crear los controles de docente y deshabilitar los otros roles", () => {
    createComponent("teacher");

    component.profesions = [{ id: 1, name: "Ingeniero" }];
    component.createForm();

    expect(component.angForm.contains("profession")).toBeTrue();
    expect(component.angForm.contains("location")).toBeTrue();
    expect(component.angForm.contains("city" as any)).toBeFalse();
    expect(component.angForm.contains("campus" as any)).toBeFalse();
    expect(component.angForm.get("check")?.disabled).toBeTrue();
    expect(component.angForm.get("checkEx")?.disabled).toBeTrue();
  });

  it("debe exigir descripcion de discapacidad solo cuando la respuesta es yes", () => {
    createComponent("student");
    component.createForm();

    component.angForm.get("disability")?.setValue("yes");
    component.onChangeDisability();
    component.angForm.get("typeDisability")?.setValue(null);

    expect(component.angForm.get("typeDisability")?.hasError("required")).toBeTrue();

    component.angForm.get("disability")?.setValue("no");
    component.onChangeDisability();
    component.angForm.get("typeDisability")?.setValue(null);

    expect(component.angForm.get("typeDisability")?.hasError("required")).toBeFalse();
  });

  it("debe mapear correctamente los datos del estudiante", () => {
    createComponent("student");
    component.createForm();

    component.angForm.patchValue({
      name: "Ana",
      lastname: "Perez",
      email: "ana@test.com",
      password: "Password1",
      educacionL: 2,
      areasInteres: [10, 11],
      areasPrefer: [20, 21],
      disability: "yes",
      typeDisability: "Visual",
      calendar: "2001-05-20",
    });

    component.mapFormDataToUserPayload();

    expect(component.user.roles).toEqual(["student"]);
    expect(component.user.first_name).toBe("Ana");
    expect(component.user.last_name).toBe("Perez");
    expect(component.user.email).toBe("ana@test.com");
    expect(component.user.password).toBe("Password1");
    expect(component.user.education_levels).toEqual([2]);
    expect(component.user.knowledge_areas).toEqual([10, 11]);
    expect(component.user.preferences).toEqual([20, 21]);
    expect(component.user.has_disability).toBe("yes");
    expect(component.user.disability_description).toBe("Visual");
    expect(component.user.birthday).toBe("2001-05-20");
  });

  it("debe registrar correctamente un docente cuando el formulario es valido", async () => {
    createComponent("teacher");
    component.profesions = [{ id: 1, name: "Ingeniero" }];
    component.createForm();
    userServiceSpy.registerUser.and.returnValue(of({ id: 99 }));

    component.angForm.patchValue({
      name: "Carlos",
      lastname: "Lopez",
      email: "carlos@ups.edu.ec",
      password: "Password1",
      terms: true,
      profession: 1,
      location: EC_LOCATION,
    });

    await component.validateUser();

    expect(userServiceSpy.registerUser).toHaveBeenCalled();
    expect(userServiceSpy.registerUser.calls.mostRecent().args[0].roles).toEqual(["teacher"]);
    expect(component.user.roles).toEqual(["teacher"]);
    expect(component.user.professions).toEqual([1]);
    expect(userServiceSpy.registerUser.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining(EC_LOCATION)
    );
    for (const field of ["city", "university", "campus"]) {
      expect(field in component.user).withContext(field).toBeFalse();
    }
    expect(component.registered).toBeTrue();
    expect(component.showVerificationEmailMessage).toBeTrue();
    expect(Swal.close).toHaveBeenCalled();
  });

  it("debe registrar correctamente un estudiante cuando el formulario es valido", async () => {
    createComponent("student");
    component.createForm();
    userServiceSpy.registerUser.and.returnValue(of({ id: 55 }));

    component.angForm.patchValue({
      name: "Ana",
      lastname: "Perez",
      email: "ana@test.com",
      password: "Password1",
      terms: true,
      educacionL: 2,
      areasInteres: [10, 11],
      areasPrefer: [20, 21],
      disability: "no",
      typeDisability: null,
      calendar: "2001-05-20",
    });

    await component.validateUser();

    expect(userServiceSpy.registerUser).toHaveBeenCalled();
    expect(userServiceSpy.registerUser.calls.mostRecent().args[0].roles).toEqual(["student"]);
    expect(component.user.roles).toEqual(["student"]);
    expect(component.user.education_levels).toEqual([2]);
    expect(component.user.knowledge_areas).toEqual([10, 11]);
    expect(component.user.preferences).toEqual([20, 21]);
    expect(component.user.has_disability).toBe("no");
    expect(component.user.birthday).toBe("2001-05-20");
    expect(component.registered).toBeTrue();
    expect(component.showVerificationEmailMessage).toBeTrue();
    expect(Swal.close).toHaveBeenCalled();
  });

  it("debe mapear correctamente la afiliacion del experto", () => {
    createComponent("expert");
    component.createForm();

    component.angForm.patchValue({
      name: "Luisa",
      lastname: "Mora",
      email: "luisa@test.com",
      password: "Password1",
      location: DE_LOCATION,
      levelExpertF: "Medio",
      url: "https://orcid.org/0000-0000-0000-0000",
      academic: "Perfil academico",
    });

    component.mapFormDataToUserPayload();

    expect(component.user.roles).toEqual(["expert"]);
    expect(component.user).toEqual(jasmine.objectContaining(DE_LOCATION));
    expect(component.user.expert_level).toBe("Medio");
    expect(component.user.web).toBe("https://orcid.org/0000-0000-0000-0000");
    expect(component.user.academic_profile).toBe("Perfil academico");
  });

  it("debe invalidar el registro de experto si faltan web o perfil academico", async () => {
    createComponent("expert");
    component.createForm();

    component.angForm.patchValue({
      name: "Luisa",
      lastname: "Mora",
      email: "luisa@test.com",
      password: "Password1",
      terms: true,
      location: DE_LOCATION,
      levelExpertF: "Medio",
      url: null,
      academic: null,
    });

    await component.validateUser();

    expect(userServiceSpy.registerUser).not.toHaveBeenCalled();
    expect(component.url?.hasError("required")).toBeTrue();
    expect(component.academic?.hasError("required")).toBeTrue();
  });

  it("debe registrar correctamente un experto con afiliacion completa", async () => {
    createComponent("expert");
    component.createForm();
    userServiceSpy.registerUser.and.returnValue(of({ id: 77 }));

    component.angForm.patchValue({
      name: "Luisa",
      lastname: "Mora",
      email: "luisa@test.com",
      password: "Password1",
      terms: true,
      location: DE_LOCATION,
      levelExpertF: "Medio",
      url: "https://orcid.org/0000-0000-0000-0000",
      academic: "Perfil academico",
    });

    await component.validateUser();

    expect(userServiceSpy.registerUser).toHaveBeenCalled();
    expect(userServiceSpy.registerUser.calls.mostRecent().args[0].roles).toEqual(["expert"]);
    expect(component.user.roles).toEqual(["expert"]);
    expect(component.user).toEqual(jasmine.objectContaining(DE_LOCATION));
    expect(component.user.expert_level).toBe("Medio");
    expect(component.registered).toBeTrue();
    expect(component.showVerificationEmailMessage).toBeTrue();
    expect(Swal.close).toHaveBeenCalled();
  });

  it("no debe enviar el registro de docente sin ubicacion", async () => {
    createComponent("teacher");
    component.createForm();

    component.angForm.patchValue({
      name: "Carlos",
      lastname: "Lopez",
      email: "carlos@ups.edu.ec",
      password: "Password1",
      terms: true,
      profession: 1,
    });

    await component.validateUser();

    expect(userServiceSpy.registerUser).not.toHaveBeenCalled();
    expect(component.location?.hasError("required")).toBeTrue();
  });

  it("debe aceptar nombres con tildes y de otros idiomas", () => {
    createComponent("teacher");
    component.createForm();

    for (const value of ["Lucía", "Hernández Núñez", "Jürgen", "O'Brien", "Jean-Pierre", "François"]) {
      component.angForm.controls.name.setValue(value);
      expect(component.angForm.controls.name.hasError("pattern")).withContext(value).toBeFalse();
    }
    for (const value of ["Carlos1", "Ana_Maria", "Luis!"]) {
      component.angForm.controls.lastname.setValue(value);
      expect(component.angForm.controls.lastname.hasError("pattern")).withContext(value).toBeTrue();
    }
  });

  it("no debe enviar ubicacion en el registro de estudiante", () => {
    createComponent("student");
    component.createForm();

    expect(component.angForm.contains("location")).toBeFalse();
    component.mapFormDataToUserPayload();
    expect(component.user.country_code).toBeUndefined();
    expect(component.user.city_name).toBeUndefined();
  });

  it("debe mostrar los errores de ubicacion que devuelve el backend", async () => {
    createComponent("teacher");
    component.createForm();
    userServiceSpy.registerUser.and.returnValue(
      throwError(() => ({ status: 400, error: { city_name: ["Este campo es obligatorio."] } }))
    );

    component.angForm.patchValue({
      name: "Carlos",
      lastname: "Lopez",
      email: "carlos@ups.edu.ec",
      password: "Password1",
      terms: true,
      profession: 1,
      location: EC_LOCATION,
    });

    await component.validateUser();

    expect(component.registered).toBeFalse();
    expect(component.registerErrorMessage).toBe("Ciudad: Este campo es obligatorio.");
  });

  it("debe mostrar advertencia institucional cuando la regla ONLY no coincide con el dominio", () => {
    createComponent("teacher");
    component.createForm();
    (component as any).emailDomainRuleType = "ONLY";
    (component as any).emailDomains = [{ domain: "ups.edu.ec" }];

    component.angForm.get("email")?.setValue("externo@gmail.com");
    component.validateInstitutionalEmailPolicy();

    expect(component.showInstitutionalEmailWarning).toBeTrue();
  });

  it("debe ocultar advertencia institucional cuando la regla EXCEPT no bloquea el dominio", () => {
    createComponent("expert");
    component.createForm();
    (component as any).emailDomainRuleType = "EXCEPT";
    (component as any).emailDomains = [{ domain: "gmail.com" }];

    component.angForm.get("email")?.setValue("experto@ups.edu.ec");
    component.validateInstitutionalEmailPolicy();

    expect(component.showInstitutionalEmailWarning).toBeFalse();
  });
});
