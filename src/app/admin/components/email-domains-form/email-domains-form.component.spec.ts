import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { SettingsService } from "../../services/settings.service";
import { EmailDomainsFormComponent } from "./email-domains-form.component";

describe("EmailDomainsFormComponent", () => {
  let fixture: ComponentFixture<EmailDomainsFormComponent>;
  let component: EmailDomainsFormComponent;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snapshotParams: any;
  let snapshotQueryParams: any;

  beforeEach(async () => {
    snapshotParams = { id: "new" };
    snapshotQueryParams = { type: "profesor" };

    settingsServiceSpy = jasmine.createSpyObj("SettingsService", [
      "getDomain",
      "getOptionRegister",
      "createDomain",
      "updateDomain",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    settingsServiceSpy.getOptionRegister.and.returnValue(
      of([
        { id: 1, type_option: "ALL" },
        { id: 2, type_option: "ONLY" },
      ])
    );
    settingsServiceSpy.createDomain.and.returnValue(of({ id: 90 }));
    settingsServiceSpy.updateDomain.and.returnValue(of({ id: 90 }));
    settingsServiceSpy.getDomain.and.returnValue(
      of({
        domain: "@ups.edu.ec",
        is_active: true,
        option_register_email: { id: 1 },
      })
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EmailDomainsFormComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get params() {
                return snapshotParams;
              },
              get queryParams() {
                return snapshotQueryParams;
              },
            },
          },
        },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        {
          provide: AdminComponent,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EmailDomainsFormComponent, {
        set: { template: "" },
      })
      .compileComponents();

    spyOn(Swal, "fire");
  });

  function createComponent() {
    fixture = TestBed.createComponent(EmailDomainsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe crear el formulario con el tipo derivado del query param", async () => {
    createComponent();
    await fixture.whenStable();

    expect(component.form.getRawValue().type).toBe("TEACHER");
    expect(component.optionsRegister).toEqual([
      { id: 1, type_option: "TODOS" },
      { id: 2, type_option: "SOLO" },
    ] as any);
  });

  it("debe precargar los datos en modo edicion", async () => {
    snapshotParams = { id: "25" };

    createComponent();
    await fixture.whenStable();

    expect(settingsServiceSpy.getDomain).toHaveBeenCalledWith(25, "TEACHER");
    expect(component.form.getRawValue()).toEqual(
      jasmine.objectContaining({
        domain: "@ups.edu.ec",
        type: "TEACHER",
        is_active: true,
        option_register_email: 1,
      })
    );
  });

  it("debe volver al listado cuando falla la carga de edicion", async () => {
    snapshotParams = { id: "25" };
    settingsServiceSpy.getDomain.and.returnValue(
      of(null as any)
    );

    createComponent();
    await fixture.whenStable();

    expect(component.form.getRawValue().domain).toBeNull();
  });

  it("debe crear el dominio cuando el formulario es valido y no existe id", async () => {
    createComponent();
    await fixture.whenStable();
    component.form.patchValue({
      domain: "@nuevo.edu.ec",
      is_active: true,
      option_register_email: 2,
    });

    await component.onSave();

    expect(settingsServiceSpy.createDomain).toHaveBeenCalledWith({
      domain: "@nuevo.edu.ec",
      type: "TEACHER",
      is_active: true,
      option_register_email: 2,
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/domain"]);
  });

  it("debe actualizar el dominio cuando el formulario es valido y existe id", async () => {
    snapshotParams = { id: "25" };

    createComponent();
    await fixture.whenStable();
    component.form.patchValue({
      domain: "@editado.edu.ec",
      is_active: false,
      option_register_email: 1,
    });

    await component.onSave();

    expect(settingsServiceSpy.updateDomain).toHaveBeenCalledWith(
      25,
      {
        domain: "@editado.edu.ec",
        type: "TEACHER",
        is_active: false,
        option_register_email: 1,
      },
      "TEACHER"
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/domain"]);
  });
});
