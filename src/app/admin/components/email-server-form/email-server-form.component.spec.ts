import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { SettingsService } from "../../services/settings.service";
import { EmailServerFormComponent } from "./email-server-form.component";

describe("EmailServerFormComponent", () => {
  let fixture: ComponentFixture<EmailServerFormComponent>;
  let component: EmailServerFormComponent;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;

  beforeEach(async () => {
    settingsServiceSpy = jasmine.createSpyObj("SettingsService", [
      "getOrCreateServer",
      "updateServer",
      "testServer",
    ]);

    settingsServiceSpy.getOrCreateServer.and.returnValue(
      of({
        host: "smtp.ups.edu.ec",
        port: 587,
        username: "noreply@ups.edu.ec",
        password: "secret",
        tls: true,
        email_from: "noreply@ups.edu.ec",
      } as any)
    );
    settingsServiceSpy.updateServer.and.returnValue(of({ id: 1 } as any));
    settingsServiceSpy.testServer.and.returnValue(of({ status: "ok" } as any));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EmailServerFormComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        { provide: AdminComponent, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EmailServerFormComponent, { set: { template: "" } })
      .compileComponents();

    spyOn(Swal, "fire").and.resolveTo({} as any);
    spyOn(Swal, "showLoading");
    spyOn(Swal, "hideLoading");

    fixture = TestBed.createComponent(EmailServerFormComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar la configuracion del servidor al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(settingsServiceSpy.getOrCreateServer).toHaveBeenCalled();
    expect(component.form.getRawValue()).toEqual(
      jasmine.objectContaining({
        host: "smtp.ups.edu.ec",
        port: 587,
        username: "noreply@ups.edu.ec",
        tls: true,
      })
    );
  });

  it("debe guardar la configuracion del servidor", async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    component.form.patchValue({
      host: "smtp.mail.com",
      port: 465,
      username: "admin@mail.com",
      password: "abc123",
      tls: false,
      email_from: "admin@mail.com",
    });

    await component.onSave();

    expect(settingsServiceSpy.updateServer).toHaveBeenCalledWith({
      host: "smtp.mail.com",
      port: 465,
      username: "admin@mail.com",
      password: "abc123",
      tls: false,
      email_from: "admin@mail.com",
    });
  });

  it("debe enviar un correo de prueba cuando existe destinatario", async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    component.form.patchValue({
      host: "smtp.mail.com",
      port: 465,
      username: "admin@mail.com",
      password: "abc123",
      tls: true,
      email_from: "admin@mail.com",
      emailtest: "test@mail.com",
    });

    await component.onTestEmail();

    expect(settingsServiceSpy.testServer).toHaveBeenCalledWith({
      emailtest: "test@mail.com",
    });
  });
});
