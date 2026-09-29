import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Subject } from "rxjs";
import { BreadcrumbPublicComponent } from "./breadcrumb-public.component";

describe("BreadcrumbPublicComponent", () => {
  let fixture: ComponentFixture<BreadcrumbPublicComponent>;
  let component: BreadcrumbPublicComponent;
  let routerEvents$: Subject<any>;
  let activatedRouteMock: any;

  beforeEach(async () => {
    routerEvents$ = new Subject<any>();
    activatedRouteMock = {
      root: {
        children: [
          {
            snapshot: {
              url: [{ path: "about-us" }],
              data: { breadcrumb: "Nosotros" },
            },
            children: [
              {
                snapshot: {
                  url: [{ path: "team" }],
                  data: { breadcrumb: "Equipo" },
                },
                children: [],
              },
            ],
          },
        ],
      },
    };

    await TestBed.configureTestingModule({
      declarations: [BreadcrumbPublicComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            events: routerEvents$.asObservable(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(BreadcrumbPublicComponent, {
        set: { template: "" },
      })
      .compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(BreadcrumbPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe construir breadcrumbs desde la ruta activa al iniciar", () => {
    createComponent();

    expect(component.menuItems).toEqual([
      { label: "Nosotros", url: "#/about-us" },
      { label: "Equipo", url: "#/about-us/team" },
    ]);
  });

  it("debe recalcular breadcrumbs cuando termina una navegacion", () => {
    createComponent();

    activatedRouteMock.root.children = [
      {
        snapshot: {
          url: [{ path: "contact" }],
          data: { breadcrumb: "Contacto" },
        },
        children: [],
      },
    ];

    routerEvents$.next(new NavigationEnd(1, "/contact", "/contact"));

    expect(component.menuItems).toEqual([
      { label: "Contacto", url: "#/contact" },
    ]);
  });
});
