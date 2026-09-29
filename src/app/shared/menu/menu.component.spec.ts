import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NavigationEnd, Router } from "@angular/router";
import { Subject } from "rxjs";
import { AdminComponent } from "src/app/admin/admin.component";
import { LoginService } from "src/app/services/login.service";
import { MenuComponent } from "./menu.component";

describe("MenuComponent", () => {
  let fixture: ComponentFixture<MenuComponent>;
  let component: MenuComponent;
  let routerEvents$: Subject<any>;
  let routerStub: { events: any; url: string };
  let appMainStub: any;
  let loginServiceStub: any;

  beforeEach(async () => {
    routerEvents$ = new Subject<any>();
    routerStub = {
      events: routerEvents$.asObservable(),
      url: "/admin/home",
    };
    appMainStub = {
      menuClick: false,
      sidebarActive: true,
      menuMobileActive: true,
      isMobile: jasmine.createSpy("isMobile").and.returnValue(false),
    };
    loginServiceStub = {
      user: { roles: [] },
    };

    await TestBed.configureTestingModule({
      declarations: [MenuComponent],
      providers: [
        { provide: AdminComponent, useValue: appMainStub },
        { provide: LoginService, useValue: loginServiceStub },
        { provide: Router, useValue: routerStub },
      ],
    })
      .overrideComponent(MenuComponent, {
        set: { template: "" },
      })
      .compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe construir el menu extendido para superuser", () => {
    loginServiceStub.user = { roles: ["superuser"] };

    createComponent();

    const labels = component.model.map((item) => item.label);
    expect(labels).toContain("Usuario administrador");
    expect(labels).toContain("Evaluación");
    expect(labels).toContain("Configuraciones");
    expect(labels).toContain("Reporte");
  });

  it("debe construir el menu limitado para administrador no superuser", () => {
    loginServiceStub.user = { roles: ["administrator"] };

    createComponent();

    const labels = component.model.map((item) => item.label);
    expect(labels).toEqual([
      "Inicio",
      "Objeto de aprendizaje",
      "Docente",
      "Experto",
      "Estudiante",
      "Reporte",
    ]);
  });

  it("debe expandir la seccion de experto cuando la ruta actual coincide", () => {
    loginServiceStub.user = { roles: ["administrator"] };
    routerStub.url = "/admin/expert/request/pending";

    createComponent();

    const expert = component.model.find((item) => item.label === "Experto");
    const teacher = component.model.find((item) => item.label === "Docente");

    expect(expert?.expanded).toBeTrue();
    expect(teacher?.expanded).toBeFalse();
  });

  it("debe resincronizar la expansion cuando cambia la ruta", () => {
    loginServiceStub.user = { roles: ["administrator"] };

    createComponent();
    routerStub.url = "/admin/teacher/request/approved";
    routerEvents$.next(
      new NavigationEnd(1, "/admin/teacher/request/approved", "/admin/teacher/request/approved")
    );

    const teacher = component.model.find((item) => item.label === "Docente");
    const expert = component.model.find((item) => item.label === "Experto");

    expect(teacher?.expanded).toBeTrue();
    expect(expert?.expanded).toBeFalse();
  });

  it("debe cerrar el sidebar mobile al ejecutar una navegacion del menu", () => {
    loginServiceStub.user = { roles: ["administrator"] };
    appMainStub.isMobile.and.returnValue(true);

    createComponent();

    const expertGroup = component.model.find((item) => item.label === "Experto");
    const firstExpertItem = (expertGroup?.items as any[])[0];

    firstExpertItem.command?.();

    expect(appMainStub.sidebarActive).toBeFalse();
    expect(appMainStub.menuMobileActive).toBeFalse();
  });

  it("debe marcar menuClick cuando se pulsa la region del menu", () => {
    createComponent();

    component.onMenuClick();

    expect(appMainStub.menuClick).toBeTrue();
  });
});
