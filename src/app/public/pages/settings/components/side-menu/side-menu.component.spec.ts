import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "../../../../../services/login.service";
import { SideMenuComponent } from "./side-menu.component";

describe("SideMenuComponent", () => {
  let fixture: ComponentFixture<SideMenuComponent>;
  let component: SideMenuComponent;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;

  const translations: Record<string, string> = {
    "menu.sideMenu.exit": "Salir",
    "menu.sideMenu.security": "Seguridad",
    "menu.sideMenu.myAccount": "Mi cuenta",
    "recommended.viewed": "Vistos",
    "menu.sideMenu.ratedMe": "Calificados",
    "menu.sideMenu.myObjectsA": "Mis objetos",
    "menu.sideMenu.uploadOA": "Subir OA",
    "menu.sideMenu.OAQualificate": "Calificar OA",
  };

  function createComponent(roles: string[]) {
    loginServiceSpy = jasmine.createSpyObj("LoginService", [
      "validateRole",
      "signOut",
    ]);
    loginServiceSpy.validateRole.and.callFake((role: string) =>
      roles.includes(role)
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [SideMenuComponent],
      providers: [
        { provide: LoginService, useValue: loginServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              instant: (key: string) => translations[key] || key,
              get: (key: string) => of(translations[key] || key),
              onLangChange: of({}),
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(SideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    return fixture.whenStable();
  }

  it("debe construir el menu base para un usuario sin roles especiales", async () => {
    await createComponent([]);

    expect(component.items.map((item) => item.label)).toEqual([
      "Mi cuenta",
      "Seguridad",
      undefined,
      "Salir",
    ]);
    expect(component.items[0].routerLink).toBe("profile");
    expect(component.items[1].routerLink).toBe("security");
  });

  it("debe agregar las opciones de estudiante en el orden esperado", async () => {
    await createComponent(["student"]);

    expect(component.items.map((item) => item.label)).toEqual([
      "Mi cuenta",
      "Seguridad",
      "Calificados",
      "Vistos",
      undefined,
      "Salir",
    ]);
    expect(component.items[2].routerLink).toBe("objects-qualified");
    expect(component.items[3].routerLink).toBe("my-views");
  });

  it("debe agregar las opciones de docente en el orden esperado", async () => {
    await createComponent(["teacher"]);

    expect(component.items.map((item) => item.label)).toEqual([
      "Mi cuenta",
      "Seguridad",
      "Mis objetos",
      "Subir OA",
      undefined,
      "Salir",
    ]);
    expect(component.items[2].routerLink).toBe("my-objects");
    expect(component.items[3].routerLink).toBe("new-object");
  });

  it("debe agregar la opcion de experto en el orden esperado", async () => {
    await createComponent(["expert"]);

    expect(component.items.map((item) => item.label)).toEqual([
      "Mi cuenta",
      "Seguridad",
      "Calificar OA",
      undefined,
      "Salir",
    ]);
    expect(component.items[2].routerLink).toBe("objects-qualified");
  });

  it("debe cerrar sesion cuando se ejecuta la opcion de salir", async () => {
    await createComponent([]);

    const exitItem = component.items[3];
    exitItem.command?.({} as any);

    expect(loginServiceSpy.signOut).toHaveBeenCalled();
  });
});
