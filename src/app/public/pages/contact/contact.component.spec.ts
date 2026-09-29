import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of, throwError } from "rxjs";
import { MessageService } from "primeng/api";
import { ContactComponent } from "./contact.component";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { UserService } from "src/app/services/user.service";

describe("ContactComponent", () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const languageServiceStub = {
    translate: {
      get: jasmine.createSpy("get").and.callFake((key: string) => of(key)),
      instant: jasmine.createSpy("instant").and.callFake((key: string) => {
        const dictionary: Record<string, string> = {
          "message.titleError": "Error",
          "message.titleSuccess": "Success",
          "contact.formInvalid": "Invalid form",
          "contact.sendSuccess": "Data sent successfully",
          "contact.sendError": "There was an error while trying to send the email",
        };

        return dictionary[key] || key;
      }),
    },
  };

  beforeEach(async () => {
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);
    userServiceSpy = jasmine.createSpyObj("UserService", ["sendContactEmail"]);
    userServiceSpy.sendContactEmail.and.returnValue(of({ code: 200 }));

    await TestBed.configureTestingModule({
      declarations: [ContactComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: LanguageService, useValue: languageServiceStub },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ContactComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("carga el listado de desarrolladores en ngOnInit", () => {
    component.ngOnInit();

    expect(component.developers.length).toBe(7);
    expect(component.developers[0].name).toContain("Paola");
  });

  it("marca el formulario y muestra error cuando el submit es invalido", async () => {
    await component.validateUser();

    expect(component.name?.touched).toBeTrue();
    expect(component.email?.touched).toBeTrue();
    expect(component.message?.touched).toBeTrue();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: "error",
        detail: "Invalid form",
      })
    );
  });

  it("envia el formulario, muestra exito y reinicia el form cuando el servicio responde 200", async () => {
    component.angForm.setValue({
      name: "Ana",
      email: "ana@example.com",
      message: "Hola",
    });

    await component.validateUser();

    expect(userServiceSpy.sendContactEmail).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@example.com",
      message: "Hola",
    });
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: "success",
        detail: "Data sent successfully",
      })
    );
    expect(component.angForm.getRawValue()).toEqual({
      name: null,
      email: null,
      message: null,
    });
  });

  it("muestra error cuando falla el envio del correo", async () => {
    userServiceSpy.sendContactEmail.and.returnValue(
      throwError(() => new Error("fallo de red"))
    );
    component.angForm.setValue({
      name: "Ana",
      email: "ana@example.com",
      message: "Hola",
    });

    await component.validateUser();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: "error",
        detail: "There was an error while trying to send the email",
      })
    );
  });
});
