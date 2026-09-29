import { CommonModule } from "@angular/common";
import { Component, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { SearchService } from "src/app/services/search.service";
import { PasswordResedComponent } from "./password-resed.component";

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

describe("PasswordResedComponent", () => {
  let component: PasswordResedComponent;
  let fixture: ComponentFixture<PasswordResedComponent>;
  let searchServiceSpy: jasmine.SpyObj<SearchService>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let router: Router;

  beforeEach(async () => {
    searchServiceSpy = jasmine.createSpyObj("SearchService", ["getTokenRestPassword"]);
    loginServiceSpy = jasmine.createSpyObj("LoginService", ["resetPassToken"]);

    searchServiceSpy.getTokenRestPassword.and.returnValue(of({ success: true }));

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
        PasswordResedComponent,
        TranslatePipeMock,
        PToastStubComponent,
      ],
      providers: [
        { provide: SearchService, useValue: searchServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: MessageService, useValue: jasmine.createSpyObj("MessageService", ["add"]) },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        {
          provide: LanguageService,
          useValue: {
            translate: {
              get: jasmine.createSpy("get").and.callFake((key: string) => of(key)),
              instant: (key: string) => key,
            },
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                uidb64: "uid-test",
                token: "token-test",
              },
            },
          },
        },
      ],
    }).compileComponents();

    spyOn(Swal, "fire");
    spyOn(Swal, "showLoading");
    spyOn(Swal, "close");

    router = TestBed.inject(Router);
    spyOn(router, "navigateByUrl").and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(PasswordResedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("valida el token al iniciar la pantalla", () => {
    expect(searchServiceSpy.getTokenRestPassword).toHaveBeenCalledWith("uid-test", "token-test");
    expect(component.tokenVerify).toBeTrue();
  });

  it("marca los controles cuando se intenta enviar invalido", () => {
    component.sentEmail();

    expect(component.passwordNew.touched).toBeTrue();
    expect(component.passwordAgain.touched).toBeTrue();
    expect(loginServiceSpy.resetPassToken).not.toHaveBeenCalled();
  });

  it("envia el cambio y redirige a confirmacion cuando el formulario es valido", async () => {
    loginServiceSpy.resetPassToken.and.returnValue(of({ ok: true }));

    component.angForm.patchValue({
      passwordNew: "Secreto123",
      passwordAgain: "Secreto123",
    });
    component.validatorPassword();

    component.sentEmail();
    await fixture.whenStable();

    const payload = loginServiceSpy.resetPassToken.calls.mostRecent().args[0] as FormData;

    expect(payload.get("password")).toBe("Secreto123");
    expect(payload.get("token")).toBe("token-test");
    expect(payload.get("uidb64")).toBe("uid-test");
    expect(router.navigateByUrl).toHaveBeenCalledWith("/reset/confirm");
    expect(Swal.close).toHaveBeenCalled();
  });
});
