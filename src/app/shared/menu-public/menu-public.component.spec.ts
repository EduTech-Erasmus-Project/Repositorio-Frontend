import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { Subject, of } from "rxjs";
import { LanguageService } from "../../services/language.service";
import { LoginService } from "../../services/login.service";
import { PublicComponent } from "../../public/public.component";
import { MenuPublicComponent } from "./menu-public.component";

describe("MenuPublicComponent", () => {
  let fixture: ComponentFixture<MenuPublicComponent>;
  let component: MenuPublicComponent;
  let routerSpy: jasmine.SpyObj<Router>;
  let loginServiceSpy: any;
  let characterLogin$: Subject<boolean>;
  let characterMenu$: Subject<boolean>;
  let routerEvents$: Subject<any>;

  beforeEach(async () => {
    characterLogin$ = new Subject<boolean>();
    characterMenu$ = new Subject<boolean>();
    routerEvents$ = new Subject<any>();
    routerSpy = jasmine.createSpyObj("Router", ["navigate", "navigateByUrl"]);
    (routerSpy as any).events = routerEvents$.asObservable();

    loginServiceSpy = {
      user: null,
      characterLogin$: characterLogin$.asObservable(),
      characterMenu$: characterMenu$.asObservable(),
      bootstrapSession: jasmine
        .createSpy("bootstrapSession")
        .and.returnValue(Promise.resolve(false)),
      validateRole: jasmine.createSpy("validateRole").and.callFake(
        (role: string) => {
          return !!loginServiceSpy.user?.roles?.includes(role);
        }
      ),
      signOut: jasmine.createSpy("signOut"),
    };

    await TestBed.configureTestingModule({
      declarations: [MenuPublicComponent],
      providers: [
        {
          provide: PublicComponent,
          useValue: {
            megaMenuMobileClick: false,
            activeTopbarItem: null,
          },
        },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: (key: string) => of(key),
            },
          },
        },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(MenuPublicComponent, {
        set: { template: "" },
      })
      .compileComponents();
  });

  async function createComponent() {
    fixture = TestBed.createComponent(MenuPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    await component.loadMenu();
    fixture.detectChanges();
  }

  it("debe redirigir a admin si el usuario es administrador", async () => {
    loginServiceSpy.user = { administrator: { id: 1 }, roles: [] };

    await createComponent();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/admin");
  });

  it("debe redirigir a admin cuando la rehidratacion recupera un administrador", async () => {
    loginServiceSpy.bootstrapSession.and.callFake(async () => {
      loginServiceSpy.user = { administrator: { id: 1 }, roles: [] };
      return true;
    });

    await createComponent();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/admin");
  });

  it("debe cargar el menu base y asignar el rol abreviado del usuario actual", async () => {
    loginServiceSpy.user = {
      administrator: null,
      roles: ["teacher"],
    };

    await createComponent();

    expect(component.role_name).toBe("Prof.");
    expect(component.tieredItems.map((item: any) => item.routerLink)).toEqual([
      "/",
      "about-us",
      "contact",
      "search",
      "guide/eXeLearning",
      "/settings/my-objects",
      "/settings/new-object",
    ]);
  });

  it("debe actualizar el rol visible cuando characterLogin emite", async () => {
    loginServiceSpy.user = {
      administrator: null,
      roles: ["student"],
    };

    await createComponent();

    characterLogin$.next(true);

    expect(component.role_name).toBe("Est.");

    characterLogin$.next(false);
    expect(component.role_name).toBe("");
  });

  it("debe cargar opciones visibles para estudiante en el menu superior", async () => {
    loginServiceSpy.user = {
      administrator: null,
      roles: ["student"],
    };

    await createComponent();

    expect(component.tieredItems.map((item: any) => item.label)).toEqual([
      "menu.home",
      "menu.aboutUs",
      "menu.contact",
      "menu.search",
      "menu.userGuide",
      "menu.recommended",
      "menu.sideMenu.ratedMe",
    ]);
    expect(component.tieredItems[5].routerLink).toBe("/recommended");
    expect(component.tieredItems[6].routerLink).toBe(
      "/settings/objects-qualified"
    );
  });

  it("no debe duplicar opciones de docente cuando characterMenu emite true varias veces", async () => {
    loginServiceSpy.user = {
      administrator: null,
      roles: ["teacher"],
    };

    await createComponent();

    characterMenu$.next(true);
    await fixture.whenStable();
    characterMenu$.next(true);
    await fixture.whenStable();

    expect(component.tieredItems.map((item: any) => item.routerLink)).toEqual([
      "/",
      "about-us",
      "contact",
      "search",
      "guide/eXeLearning",
      "/settings/my-objects",
      "/settings/new-object",
    ]);
  });

  it("debe navegar con query params para experto", async () => {
    await createComponent();

    component.navigateExpert("search");

    expect(routerSpy.navigate).toHaveBeenCalledWith(["search"], {
      queryParams: {
        is_evaluated: "False",
      },
    });
  });

  it("debe cargar opciones visibles para experto en el menu superior", async () => {
    loginServiceSpy.user = {
      administrator: null,
      roles: ["expert"],
    };

    await createComponent();

    expect(component.tieredItems.map((item: any) => item.label)).toEqual([
      "menu.home",
      "menu.aboutUs",
      "menu.contact",
      "menu.search",
      "menu.userGuide",
      "menu.sideMenu.qualificateOa",
      "menu.sideMenu.OAQualificate",
    ]);
    expect(component.tieredItems[5].routerLink).toBe("search");
    expect(component.tieredItems[5].queryParams).toEqual({
      is_evaluated: "False",
    });
    expect(component.tieredItems[6].routerLink).toBe(
      "/settings/objects-qualified"
    );
  });

  it("debe volver al menu base cuando characterLogin emite false", async () => {
    loginServiceSpy.user = {
      administrator: null,
      roles: ["expert"],
    };

    await createComponent();

    loginServiceSpy.user = null;
    characterLogin$.next(false);
    await fixture.whenStable();

    expect(component.role_name).toBe("");
    expect(component.tieredItems.map((item: any) => item.routerLink)).toEqual([
      "/",
      "about-us",
      "contact",
      "search",
      "guide/eXeLearning",
    ]);
  });

  it("debe delegar el cierre de sesion al servicio", async () => {
    await createComponent();

    component.logOut();

    expect(loginServiceSpy.signOut).toHaveBeenCalled();
  });
});
