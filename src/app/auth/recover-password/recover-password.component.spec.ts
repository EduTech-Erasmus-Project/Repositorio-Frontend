import { CommonModule } from "@angular/common";
import { Component, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of, throwError } from "rxjs";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { RecoverPasswordComponent } from "./recover-password.component";

@Pipe({
  name: "translate",
  standalone: false,
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Component({
  selector: "p-toast",
  template: "",
  standalone: false,
})
class PToastStubComponent {}

describe("RecoverPasswordComponent", () => {
  let component: RecoverPasswordComponent;
  let fixture: ComponentFixture<RecoverPasswordComponent>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;
  let router: Router;

  beforeEach(async () => {
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["resetPass"]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);
    breadcrumbServiceSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        InputTextModule,
        ButtonModule,
      ],
      declarations: [
        RecoverPasswordComponent,
        TranslatePipeMock,
        PToastStubComponent,
      ],
      providers: [
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbServiceSpy },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.callFake((key: string) => of(key)),
              instant: (key: string) => key,
            },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, "navigateByUrl").and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(RecoverPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("marca el formulario cuando se intenta enviar invalido", async () => {
    await component.sentEmail();

    expect(component.angForm.controls.email.touched).toBeTrue();
    expect(loginServiceSpy.resetPass).not.toHaveBeenCalled();
  });

  it("redirige a emailMessage cuando el backend retorna el enlace de recuperacion", async () => {
    loginServiceSpy.resetPass.and.returnValue(
      of({ message: "We have send you a link to reset your password" })
    );

    component.angForm.controls.email.setValue("usuario@test.com");

    await component.sentEmail();

    expect(loginServiceSpy.resetPass).toHaveBeenCalledWith("usuario@test.com");
    expect(router.navigateByUrl).toHaveBeenCalledWith("/emailMessage");
  });

  it("activa el estado alterno para estudiante cuando el backend retorna status 201", async () => {
    loginServiceSpy.resetPass.and.returnValue(of({ status: 201 }));

    component.angForm.controls.email.setValue("estudiante@test.com");

    await component.sentEmail();

    expect(component.is_student).toBeTrue();
    expect(messageServiceSpy.add).toHaveBeenCalled();
  });

  it("marca el correo como invalido cuando el backend rechaza la solicitud", async () => {
    loginServiceSpy.resetPass.and.returnValue(throwError(() => new Error("fail")));

    component.angForm.controls.email.setValue("error@test.com");

    await component.sentEmail();

    expect(component.emailCheck).toBeTrue();
    expect(messageServiceSpy.add).toHaveBeenCalled();
  });
});
