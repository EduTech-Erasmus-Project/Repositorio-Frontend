import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { firstValueFrom } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { SearchService } from "src/app/services/search.service";
import { focusFirstInvalidControl } from "src/app/core/utils/accessibility-focus";
import { translateInstant } from "src/app/core/utils/i18n.utils";
import Swal from "sweetalert2";
import { ApiMessageResponse } from "src/app/core/interfaces/api-contracts";

interface PasswordResetFormControls {
  passwordNew: FormControl<string>;
  passwordAgain: FormControl<string>;
}

interface PasswordResetCredentials {
  uidb64: string;
  token: string;
}

/**
 * Resuelve el segundo paso del reset de contrasena basado en token.
 *
 * Responsabilidades:
 * - validar el token del enlace recibido por correo
 * - permitir el ingreso de la nueva contrasena
 * - enviar el cambio final al backend y redirigir a confirmacion
 * - exponer feedback claro para enlace invalido o expirado
 */
@Component({
  selector: "app-password-resed",
  templateUrl: "./password-resed.component.html",
  styleUrls: ["./password-resed.component.scss"],
  standalone: false,
})
export class PasswordResedComponent implements OnInit {
  public flagConfirm = false;
  public show2 = false;
  public show3 = false;
  public verifyToken: { success?: boolean } | null = null;
  public tokenVerify = false;
  public isSubmitting = false;

  public Credencial!: PasswordResetCredentials;

  public angForm: FormGroup<PasswordResetFormControls> = this.fb.group({
    passwordNew: this.fb.nonNullable.control("", [
      Validators.required,
      Validators.pattern("(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}"),
    ]),
    passwordAgain: this.fb.nonNullable.control("", [Validators.required]),
  });

  constructor(
    private fb: FormBuilder,
    private rutaActiva: ActivatedRoute,
    private searchService: SearchService,
    private messageService: MessageService,
    private loginService: LoginService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.addBreadcrumb();
    this.Credencial = {
      uidb64: this.rutaActiva.snapshot.params.uidb64,
      token: this.rutaActiva.snapshot.params.token,
    };
    void this.loadData();
  }

  /**
   * Publica el breadcrumb del flujo de cambio de contrasena por token.
   */
  private async addBreadcrumb() {
    const breadcrumbLabel = await firstValueFrom(
      this.languageService.translate.get("menu.resetPassword")
    );

    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: breadcrumbLabel, routerLink: ["/"] },
    ]);
  }

  /**
   * Verifica con el backend si el token recibido en la URL sigue siendo valido.
   */
  async loadData() {
    try {
      const res = await firstValueFrom(
        this.searchService.getTokenRestPassword(
          this.Credencial.uidb64,
          this.Credencial.token
        )
      ) as ApiMessageResponse & { success?: boolean };

      if (res?.success === true) {
        this.verifyToken = res;
        this.tokenVerify = true;
      }
    } catch (err: unknown) {
      const error = err as HttpErrorResponse & {
        error?: {
          error?: string;
        };
      };
      if (error?.error?.error === "Token is no valid, please request a new one") {
        this.showError(
          translateInstant(this.languageService.translate,
            "login.resetInvalidLink",
            "Enlace de verificacion incorrecto"
          )
        );
      }
      this.tokenVerify = false;
    } finally {
      this.cdr.detectChanges();
    }
  }

  showError(message: string) {
    this.messageService.add({
      severity: "error",
      summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
      detail: message,
    });
  }

  showSuccess(message: string) {
    this.messageService.add({
      severity: "success",
      summary: translateInstant(this.languageService.translate, "message.titleSuccess", "Success"),
      detail: message,
    });
  }

  /**
   * Punto de entrada del submit del formulario.
   */
  sentEmail() {
    void this.submitReset();
  }

  private async submitReset() {
    if (this.angForm.invalid) {
      this.markTouchForm();
      this.validatorPassword();
      this.focusInvalidControl();
      return;
    }

    this.validatorPassword();
    if (!this.flagConfirm) {
      this.showError(
        translateInstant(this.languageService.translate, "login.resetMismatch", "Las contrasenas no coinciden")
      );
      return;
    }

    if (!this.tokenVerify) {
      this.flagConfirm = false;
      this.showError(
        translateInstant(this.languageService.translate,
          "login.resetTokenInvalid",
          "El token no es valido, solicite uno nuevo"
        )
      );
      this.angForm.reset();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();
    Swal.fire({
      allowOutsideClick: false,
      icon: "info",
      text: translateInstant(this.languageService.translate, "login.resetUpdating", "Actualizando la contrasena"),
    });
    Swal.showLoading(null);

    try {
      const resetPayload = new FormData();
      resetPayload.append("password", this.angForm.controls.passwordNew.value);
      resetPayload.append("token", this.Credencial.token);
      resetPayload.append("uidb64", this.Credencial.uidb64);

      await firstValueFrom(this.loginService.resetPassToken(resetPayload));

      this.showSuccess(
        translateInstant(this.languageService.translate, "login.PassConfirmMsj", "Contrasena cambiada con exito")
      );
      this.angForm.reset();
      this.flagConfirm = false;
      this.cdr.detectChanges();
      await this.router.navigateByUrl("/reset/confirm");
    } catch {
      this.showError(
        translateInstant(this.languageService.translate, "login.resetChangeError", "No se pudo cambiar la contrasena")
      );
      this.cdr.detectChanges();
    } finally {
      this.isSubmitting = false;
      Swal.close();
      this.cdr.detectChanges();
    }
  }

  validatorPassword() {
    this.flagConfirm =
      this.angForm.controls.passwordNew.value ===
      this.angForm.controls.passwordAgain.value;
  }

  toggleNewPasswordVisibility() {
    this.show2 = !this.show2;
  }

  toggleConfirmPasswordVisibility() {
    this.show3 = !this.show3;
  }

  markTouchForm() {
    Object.values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  get passwordNew() {
    return this.angForm.controls.passwordNew;
  }

  get passwordAgain() {
    return this.angForm.controls.passwordAgain;
  }

  get hasPasswordNewError(): boolean {
    return !!(
      this.passwordNew.invalid &&
      (this.passwordNew.dirty || this.passwordNew.touched)
    );
  }

  get hasPasswordAgainError(): boolean {
    return !!(
      this.passwordAgain.invalid &&
      (this.passwordAgain.dirty || this.passwordAgain.touched)
    );
  }

  get showPasswordMismatch(): boolean {
    return !!(
      this.passwordAgain.value &&
      (this.passwordAgain.dirty || this.passwordAgain.touched) &&
      !this.flagConfirm &&
      !this.passwordAgain.errors?.required
    );
  }

  private focusInvalidControl() {
    setTimeout(() => {
      focusFirstInvalidControl(document.getElementById("loginForm"));
    }, 0);
  }

}

