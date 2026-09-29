import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { SettingsService } from "../../services/settings.service";
import { EmailDomainsListComponent } from "./email-domains-list.component";

describe("EmailDomainsListComponent", () => {
  let fixture: ComponentFixture<EmailDomainsListComponent>;
  let component: EmailDomainsListComponent;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const optionRegisterResponse = [
    { id: 1, type_option: "ALL" },
    { id: 2, type_option: "ONLY" },
    { id: 3, type_option: "EXCEPT" },
  ];

  const typeUserOptionResponse = [
    { id: 10, description: "TEACHER", option_register: { id: 1 } },
    { id: 11, description: "EXPERT", option_register: { id: 2 } },
    { id: 12, description: "STUDENT", option_register: { id: 3 } },
  ];

  beforeEach(async () => {
    settingsServiceSpy = jasmine.createSpyObj("SettingsService", [
      "getTypeUserOptionRegister",
      "getOptionRegister",
      "getDomainsTeacher",
      "getDomainExpert",
      "getDomainStudent",
      "updateTypeUserOptionRegister",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    settingsServiceSpy.getTypeUserOptionRegister.and.returnValue(
      of(typeUserOptionResponse)
    );
    settingsServiceSpy.getOptionRegister.and.returnValue(of(optionRegisterResponse));
    settingsServiceSpy.getDomainsTeacher.and.returnValue(
      of({
        data: [
          {
            id: 7,
            domain: "@ups.edu.ec",
            is_active: true,
            option_register_email: { id: 1, type_option: "ALL" },
          },
        ],
      })
    );
    settingsServiceSpy.getDomainStudent.and.returnValue(
      of({
        data: [
          {
            id: 8,
            domain: "@est.ups.edu.ec",
            is_active: true,
            option_register_email: { id: 3, type_option: "EXCEPT" },
          },
        ],
      })
    );
    settingsServiceSpy.getDomainExpert.and.returnValue(
      of({
        data: [
          {
            id: 9,
            domain: "@expert.ups.edu.ec",
            is_active: false,
            option_register_email: { id: 2, type_option: "ONLY" },
          },
        ],
      })
    );
    settingsServiceSpy.updateTypeUserOptionRegister.and.returnValue(
      of({ id: 10, description: "TEACHER", option_register: { id: 2 } })
    );

    await TestBed.configureTestingModule({
      declarations: [EmailDomainsListComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
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
      .overrideComponent(EmailDomainsListComponent, {
        set: { template: "" },
      })
      .compileComponents();

    spyOn(Swal, "fire");

    fixture = TestBed.createComponent(EmailDomainsListComponent);
    component = fixture.componentInstance;
  });

  async function initializeComponent() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it("debe cargar dominios de profesor al iniciar", async () => {
    await initializeComponent();

    expect(settingsServiceSpy.getTypeUserOptionRegister).toHaveBeenCalled();
    expect(settingsServiceSpy.getOptionRegister).toHaveBeenCalled();
    expect(settingsServiceSpy.getDomainsTeacher).toHaveBeenCalledWith(1);
    expect(component.domains).toEqual([
      {
        id: 7,
        domain: "@ups.edu.ec",
        is_active: true,
        option_id: 1,
        type_option: "TODOS",
      },
    ] as any);
    expect(component.selectedRoleOptionId).toBe(1);
  });

  it("debe cargar dominios de estudiante cuando se solicita ese rol", async () => {
    component.registerOptions = [
      { id: 1, type_option: "TODOS" },
      { id: 2, type_option: "SOLO" },
      { id: 3, type_option: "EXCEPTO" },
    ];
    component.selectedRegisterOptionLabel = "EXCEPTO";
    component.selectedValue = "estudiante";
    component.typeUserOptionRelations = typeUserOptionResponse as any;

    await component.loadData("estudiante");

    expect(settingsServiceSpy.getDomainStudent).toHaveBeenCalledWith(3);
    expect(component.domains[0].type_option).toBe("EXCEPTO");
  });

  it("no debe romper si falta la configuracion del rol seleccionado", async () => {
    component.selectedValue = "estudiante";
    component.typeUserOptionRelations = [
      { id: 10, description: "TEACHER", option_register: { id: 1 } },
    ] as any;
    component.selectedRoleOptionId = null;

    await component.updateRelationTypeUserOption();

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Error",
      detail: "No existe una configuracion valida para actualizar",
    });
    expect(settingsServiceSpy.updateTypeUserOptionRegister).not.toHaveBeenCalled();
  });

  it("debe actualizar la relacion del tipo de usuario y mostrar mensaje de exito", async () => {
    component.selectedValue = "profesor";
    component.typeUserOptionRelations = typeUserOptionResponse.map((option) => ({
      ...option,
    }));
    component.selectedRoleOptionId = 2;
    component.registerOptions = [
      { id: 1, type_option: "TODOS" },
      { id: 2, type_option: "SOLO" },
      { id: 3, type_option: "EXCEPTO" },
    ];

    await component.updateRelationTypeUserOption();

    expect(settingsServiceSpy.updateTypeUserOptionRegister).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 10,
        description: "TEACHER",
        option_register: 2,
      }),
      10
    );
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "success",
      summary: "Modificado",
      detail: "Tipo de registro modificado correctamente",
    });
    expect(component.hasPendingRelationChange).toBeFalse();
  });

  it("debe navegar para crear y editar dominios", () => {
    component.selectedValue = "experto";

    component.sendParamsCreateEmailDomain();
    component.sendParamsEditEmailDomain(22);

    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ["/admin/config/domain/new"],
      { queryParams: { type: "experto" } }
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ["/admin/config/domain/22"],
      { queryParams: { type: "experto" } }
    );
  });
});
