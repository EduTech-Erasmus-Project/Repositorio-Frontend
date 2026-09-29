import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MessageService, ToastMessageOptions } from "primeng/api";
import { firstValueFrom } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import Swal from "sweetalert2";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  PASSWORD_STRENGTH_PATTERN,
  controlHasError,
  controlInvalid,
  passwordMatchValidator,
} from "../../shared/settings-form.utils";
import { translateInstant } from "src/app/core/utils/i18n.utils";

/**
 * Modela el formulario minimo para cambiar la contrasena desde `settings/security`.
 */
interface SecurityFormControls {
  passwordOld: FormControl<string | null>;
  passwordNew: FormControl<string | null>;
  passwordAgain: FormControl<string | null>;
}

interface PasswordChangePayload {
  password: string | null;
  password2: string | null;
  old_password: string | null;
}

interface PasswordChangeErrorResponse {
  details?: {
    password?: string[];
    old_password?: {
      old_password?: string;
    };
  };
}

@Component({
    selector: "app-security",
    templateUrl: "./security.component.html",
    styleUrls: ["./security.component.scss"],
    standalone: false
})
/**
 * Encapsula el cambio de contrasena del usuario autenticado.
 *
 * El componente mantiene solo estado de UI local:
 * - expansion del formulario
 * - visibilidad de cada campo password
 * - mensajes de mismatch o password repetida
 */
export class SecurityComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public show: boolean = false;
  public show2: boolean = false;
  public show3: boolean = false;
  public show4: boolean = false;
  public flagConfirm: boolean = false;
  public passError: boolean = false;
  public angForm: FormGroup<SecurityFormControls>;
  public passwords: {
    password: string | null;
    password2: string | null;
    old_password: string | null;
  } | null = null;
  public passsword_invalid: boolean = false;
  public newPassword: string | null = null;
  public oldPassword: string | null = null;
  public againPassword: string | null = null;

  public msgs1: ToastMessageOptions[];

  constructor(
    private fb: FormBuilder,
    public loginService: LoginService,
    private messageService: MessageService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService
  ) {
    this.createForm();
    this.configureBreadcrumb();
  }

  ngOnInit(): void {
    this.bindPasswordValidation();
  }

  /**
   * Publica el breadcrumb de seguridad con labels traducidos.
   */
  private async configureBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await firstValueFrom(this.languageService.translate.get("menu.settings"))},
      { label: await firstValueFrom(this.languageService.translate.get("menu.sideMenu.security")), routerLink: ["/settings/security"] },
    ]);
  }

  /**
   * Crea el formulario y delega el cruce de contrasenas al validador de grupo.
   */
  createForm() {
    this.angForm = this.fb.group(
      {
        passwordOld: this.fb.control(this.oldPassword, {
          validators: [Validators.required],
        }),
        passwordNew: this.fb.control(this.newPassword, {
          validators: [
            Validators.required,
            Validators.pattern(PASSWORD_STRENGTH_PATTERN),
          ],
        }),
        passwordAgain: this.fb.control(
          { value: this.againPassword, disabled: true },
          { validators: [Validators.required] }
        ),
      },
      {
        validators: [passwordMatchValidator("passwordNew", "passwordAgain")],
      }
    );
  }

  /**
   * Mantiene el formulario reactivo y los mensajes derivados sincronizados en vivo.
   */
  private bindPasswordValidation() {
    this.passwordNew?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.enabled_Password();
        this.validatorPassword();
        this.passError = false;
      });

    this.passwordAgain?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.validatorPassword();
      });

    this.passwordOld?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.passError = false;
      });
  }

  /**
   * Procesa el cambio de contrasena y cierra sesion cuando el backend confirma
   * que la actualizacion fue exitosa.
   */
  async sendPasswordRest() {
    if (this.validatorPassword()) {
      this.showError(translateInstant(this.languageService.translate, "security.passwordsDoNotMatch", "Las contraseñas no coinciden"));
      return;
    }

    if (this.angForm.valid) {
      this.passwords = this.buildPasswordPayload();
      this.oldPassword = this.passwords.old_password;
      this.newPassword = this.passwords.password;
      this.againPassword = this.passwords.password2;

      try {
        const res = await firstValueFrom(
          this.loginService.changePassword(
            this.passwords as unknown as FormData,
            this.loginService.user.id
          )
        );

        if (res.status == "Ok") {
          this.showSuccess(translateInstant(this.languageService.translate, "security.passwordUpdated", "Contraseña actualizada"));
          Swal.fire({
            allowOutsideClick: false,
            icon: "info",
            text: translateInstant(this.languageService.translate, "security.updatingPassword", "Actualizando su contraseña..."),
          });
          Swal.showLoading(null);
          this.loginService.signOutPass();
          Swal.close();
          this.resetForm();
        }
      } catch (error: unknown) {
        this.handlePasswordChangeError(error);
      }
    } else {
      this.markTouchForm();
    }
  }

  /**
   * Convierte el formulario a la estructura exacta que consume el endpoint.
   */
  private buildPasswordPayload(): PasswordChangePayload {
    const value = this.angForm.getRawValue();
    return {
      password: value.passwordNew,
      password2: value.passwordAgain,
      old_password: value.passwordOld,
    };
  }

  /**
   * Interpreta los mensajes legacy del backend para mostrarlos con copy del frontend.
   */
  private handlePasswordChangeError(error: unknown) {
    const httpError = error as HttpErrorResponse & {
      error?: PasswordChangeErrorResponse;
    };
    const passwordErrors = httpError?.error?.details?.password;
    const oldPasswordError =
      httpError?.error?.details?.old_password?.old_password;

    if (passwordErrors?.[0] == "New password cannot be the same as above.") {
      this.passsword_invalid = true;
      this.showError(translateInstant(this.languageService.translate, "security.samePasswordError", "La contraseña no puede ser la misma que la anterior"));
      this.passwordNew?.markAllAsTouched();
      this.passwordAgain?.markAllAsTouched();
      return;
    }

    if (passwordErrors?.[0] == "Password fields didn't match.") {
      this.showError(translateInstant(this.languageService.translate, "security.newPasswordMismatch", "La contraseña nueva no coincide"));
      this.passError = true;
      return;
    }

    if (oldPasswordError == "Old password is not correct") {
      this.showError(translateInstant(this.languageService.translate, "security.currentPasswordIncorrect", "La contraseña actual es incorrecta"));
      this.passError = true;
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
   * Devuelve `true` cuando existe mismatch entre nueva contrasena y confirmacion.
   */
  validatorPassword() {
    const passwordNew = this.passwordNew?.value;
    const passwordAgain = this.passwordAgain?.value;
    const mismatch = !!passwordAgain && passwordNew !== passwordAgain;

    this.flagConfirm = !mismatch;
    if (!mismatch) {
      this.passsword_invalid = false;
    }

    return mismatch;
  }

  /**
   * Restablece el formulario y deja la vista en su estado plegado inicial.
   */
  resetForm() {
    this.angForm.reset();
    this.angForm.controls["passwordAgain"].disable();
    this.show2 = false;
    this.show3 = false;
    this.show4 = false;
    this.show = false;
    this.flagConfirm = false;
    this.passError = false;
    this.passsword_invalid = false;
  }

  public togglePasswordForm() {
    this.show = !this.show;
  }

  public toggleCurrentPasswordVisibility() {
    this.show2 = !this.show2;
  }

  public toggleNewPasswordVisibility() {
    this.show3 = !this.show3;
  }

  public togglePasswordConfirmationVisibility() {
    this.show4 = !this.show4;
  }

  markTouchForm() {
    Object.values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  get passwordOld() {
    return this.angForm.get("passwordOld");
  }

  get passwordNew() {
    return this.angForm.get("passwordNew");
  }

  get passwordAgain() {
    return this.angForm.get("passwordAgain");
  }

  public enabled_Password() {
    const passwordValue = this.passwordNew?.value;

    if (this.passwordAgain?.disabled && passwordValue) {
      this.angForm.controls["passwordAgain"].enable();
      return;
    }

    if (!passwordValue) {
      this.angForm.controls["passwordAgain"].disable();
      this.angForm.controls["passwordAgain"].reset();
      this.flagConfirm = false;
    }
  }

  public isControlInvalid(controlName: keyof SecurityFormControls): boolean {
    return controlInvalid(this.angForm.controls[controlName]);
  }

  public controlHasError(controlName: keyof SecurityFormControls, errorCode: string): boolean {
    return controlHasError(this.angForm.controls[controlName], errorCode);
  }

  public getPasswordOldDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.controlHasError("passwordOld", "required")) {
      ids.push("passwordOld_required");
    }

    if (this.passError) {
      ids.push("passwordOld_backend");
    }

    return ids.length ? ids.join(" ") : null;
  }

  public getPasswordNewDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.controlHasError("passwordNew", "required")) {
      ids.push("passwordNew_required");
    }

    if (this.controlHasError("passwordNew", "pattern")) {
      ids.push("passwordNew_pattern");
    }

    if (this.passsword_invalid) {
      ids.push("passwordNew_same");
    }

    return ids.length ? ids.join(" ") : null;
  }

  public getPasswordAgainDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.controlHasError("passwordAgain", "required")) {
      ids.push("passwordAgain_required");
    }

    if (!this.flagConfirm && this.passwordAgain?.dirty) {
      ids.push("passwordAgain_mismatch");
    }

    if (this.passsword_invalid) {
      ids.push("passwordAgain_same");
    }

    return ids.length ? ids.join(" ") : null;
  }

}
