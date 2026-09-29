import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { firstValueFrom } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { focusFirstInvalidControl } from "src/app/core/utils/accessibility-focus";
import { translateInstant } from "src/app/core/utils/i18n.utils";
import { ApiMessageResponse } from "src/app/core/interfaces/api-contracts";

/**
 * Contrato tipado del formulario de recuperacion de contrasena.
 */
interface RecoverPasswordFormControls {
  email: FormControl<string>;
}

/**
 * Gestiona el primer paso del flujo de recuperacion de contrasena.
 *
 * Responsabilidades:
 * - validar el correo ingresado por el usuario
 * - solicitar al backend el enlace de recuperacion
 * - derivar el flujo especial de estudiantes cuando el backend asi lo indica
 * - publicar el breadcrumb de la pantalla
 */
@Component({
  selector: "app-recover-password",
  templateUrl: "./recover-password.component.html",
  styleUrls: ["./recover-password.component.scss"],
  standalone: false,
})
export class RecoverPasswordComponent implements OnInit {
  public emailCheck = false;
  public is_student = false;
  public isSubmitting = false;

  private readonly patternV =
    "^([a-zA-Z0-9_' - '.]+)@([a-zA-Z0-9_' - '.]+).([a-zA-Z]{2,5})$";

  public angForm: FormGroup<RecoverPasswordFormControls> = this.fb.group({
    email: this.fb.nonNullable.control("", [
      Validators.required,
      Validators.pattern(this.patternV),
    ]),
  });

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private messageService: MessageService,
    private router: Router,
    private languageService: LanguageService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.addBreadcrumb();
  }

  /**
   * Publica el breadcrumb traducido del flujo de recuperacion.
   */
  private async addBreadcrumb() {
    const breadcrumbLabel = await firstValueFrom(
      this.languageService.translate.get("menu.resetPassword")
    );

    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: breadcrumbLabel, routerLink: ["/restart-password"] },
    ]);
  }

  /**
   * Solicita el envio del enlace de recuperacion o el flujo alterno de estudiantes.
   */
  async sentEmail() {
    this.emailCheck = false;

    if (this.angForm.invalid) {
      this.markTouchForm();
      this.focusInvalidControl();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    try {
      const email = this.angForm.controls.email.value;
      const res = await firstValueFrom(this.loginService.resetPass(email)) as ApiMessageResponse;

      if (res?.message === "We have send you a link to reset your password") {
        const message = await firstValueFrom(
          this.languageService.translate.get("login.recoverSentEmail")
        );
        this.showSuccess(message);
        this.angForm.reset({ email: "" });
        this.cdr.detectChanges();
        await this.router.navigateByUrl("/emailMessage");
        return;
      }

      if (res?.status === 201) {
        this.is_student = true;
        const message = await firstValueFrom(
          this.languageService.translate.get("login.recoverPasswordM")
        );
        this.showSuccess(message);
        this.angForm.reset({ email: "" });
        this.cdr.detectChanges();
      }
    } catch {
      const message = await firstValueFrom(
        this.languageService.translate.get("login.recoverErrorMail")
      );
      this.showError(message);
      this.emailCheck = true;
      this.cdr.detectChanges();
    } finally {
      this.isSubmitting = false;
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

  markTouchForm() {
    Object.values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  get email1() {
    return this.angForm.controls.email;
  }

  get hasEmailError(): boolean {
    return !!(
      this.email1.invalid &&
      (this.email1.dirty || this.email1.touched)
    );
  }

  private focusInvalidControl() {
    setTimeout(() => {
      focusFirstInvalidControl(document.getElementById("loginForm"));
    }, 0);
  }
}
