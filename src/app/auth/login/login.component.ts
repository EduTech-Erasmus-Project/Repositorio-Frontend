import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { firstValueFrom, Subscription } from "rxjs";
import { LanguageService } from "../../services/language.service";
import { MessageService } from "primeng/api";
import { LoginService } from "../../services/login.service";
import { StorageService } from "../../services/storage.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { UserService } from "src/app/services/user.service";
import { focusFirstInvalidControl } from "src/app/core/utils/accessibility-focus";
import { ApiMessageResponse, AuthTokenResponse } from "src/app/core/interfaces/api-contracts";

/**
 * Contrato tipado del formulario de autenticacion principal.
 */
interface LoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}

/**
 * Configuracion base del toast de error reutilizado por el flujo de login.
 */
interface ToastMessageConfig {
  severity: "error";
  summary: string;
  detail: string;
}

/**
 * Gestiona el inicio de sesion publico del repositorio.
 *
 * Responsabilidades:
 * - validar credenciales y enviar el login al backend
 * - conservar el correo cuando el usuario activa "recordarme"
 * - reemitir el flujo de activacion cuando la cuenta sigue inactiva
 * - publicar el breadcrumb de la pantalla
 */
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  standalone: false,
})
export class LoginComponent implements OnInit, OnDestroy {
  public checked = false;
  public translate!: TranslateService;
  public msjError: ToastMessageConfig = {
    severity: "error",
    summary: "Error",
    detail: "",
  };
  public show = false;
  public isNotaccountaActive = false;
  public isSubmitting = false;
  public isResendingActivation = false;
  public loginErrorMessage = "";

  private readonly emailPattern =
    "^([a-zA-Z0-9_'-'.]+)@([a-zA-Z0-9_'-'.]+).([a-zA-Z]{2,5})$";
  private readonly subscribes: Subscription[] = [];
  private msjModal = "";

  public loginForm: FormGroup<LoginFormControls> =
    new FormGroup<LoginFormControls>({
      email: new FormControl(this.storageService.getLocalItem("userEmail") || "", {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(this.emailPattern),
        ],
      }),
      password: new FormControl("", {
        nonNullable: true,
        validators: [Validators.required],
      }),
      rememberMe: new FormControl(
        !!this.storageService.getLocalItem("userEmail"),
        {
          nonNullable: true,
        }
      ),
    });

  constructor(
    private _router: Router,
    private languageService: LanguageService,
    private messageService: MessageService,
    private loginService: LoginService,
    private storageService: StorageService,
    private breadcrumbService: BreadcrumbService,
    private _userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.addBreadcrumb();
    this.translate = this.languageService.translate;
    this.loadTranslateText();

    const langChangeSub = this.translate.onLangChange.subscribe(
      (translate: LangChangeEvent) => {
        this.msjModal = translate.translations?.login?.modalMsj || this.msjModal;
        this.msjError = {
          severity: "error",
          summary: translate.translations?.message?.titleError || "Error",
          detail: translate.translations?.login?.errorMesage || this.msjError.detail,
        };
        this.cdr.detectChanges();
      }
    );

    this.subscribes.push(langChangeSub);
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  /**
   * Publica el breadcrumb traducido del flujo de autenticacion.
   */
  private async addBreadcrumb() {
    const loginLabel = await firstValueFrom(
      this.languageService.translate.get("menu.login")
    );

    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: loginLabel, routerLink: ["/login"] },
    ]);
  }

  get errorEmailRequired(): boolean {
    return !!(
      this.loginForm.controls.email.errors?.required &&
      this.loginForm.controls.email.touched
    );
  }

  get errorEmailFormat(): boolean {
    return !!(
      this.loginForm.controls.email.errors?.pattern &&
      this.loginForm.controls.email.touched
    );
  }

  get errorPasswordRequired(): boolean {
    return !!(
      this.loginForm.controls.password.errors?.required &&
      this.loginForm.controls.password.touched
    );
  }

  /**
   * Ejecuta la autenticacion principal y sincroniza los efectos secundarios
   * de sesion, menu y persistencia de correo.
   */
  async onLogin() {
    this.loadTranslateText();
    this.messageService.clear();
    this.loginErrorMessage = "";
    this.isNotaccountaActive = false;

    if (this.loginForm.invalid) {
      this.markTouchForm();
      this.focusInvalidControl();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();
    Swal.fire({
      allowOutsideClick: false,
      icon: "info",
      text: this.msjModal,
    });
    Swal.showLoading(null);

    const formData = {
      email: this.loginForm.controls.email.value,
      password: this.loginForm.controls.password.value,
    };

    try {
      await firstValueFrom(this.loginService.initializeCsrfSession());

      const res = await firstValueFrom(this.loginService.signIn(formData)) as AuthTokenResponse & ApiMessageResponse;

      if (res?.detail) {
        this.showMessageError();
        return;
      }

      await this.loginService.validateUser();

      if (
        this.loginService.user?.roles.includes("teacher") ||
        this.loginService.user?.roles.includes("expert")
      ) {
        this.loginService.setCharacterMenuState(true);
      }

      this.saveEmail();
    } catch (error: unknown) {
      const httpError = error as HttpErrorResponse & {
        error?: {
          detail?: string;
        };
      };
      if (httpError?.error?.detail === "Account inactive user") {
        this.isNotaccountaActive = true;
      }

      this.showMessageError();
      this.cdr.detectChanges();
    } finally {
      this.isSubmitting = false;
      Swal.close();
      this.cdr.detectChanges();
    }
  }

  markTouchForm() {
    Object.values(this.loginForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  togglePasswordVisibility() {
    this.show = !this.show;
  }

  loadTranslateText() {
    const currentLang = this.translate?.currentLang || "es";
    const translations =
      this.translate?.translations?.[currentLang] ||
      this.translate?.translations?.es ||
      {};

    this.msjModal = translations?.login?.modalMsj || "Por favor espere...";
    this.msjError = {
      severity: "error",
      summary: translations?.message?.titleError || "Error",
      detail:
        translations?.login?.errorMesage ||
        "El correo o la contraseña que ingresó no coinciden con ningun registro",
    };
  }

  showMessageError() {
    this.loginErrorMessage = this.msjError.detail;
    this.messageService.add(this.msjError);
  }

  onSaveEmail(event: { checked?: boolean }) {
    if (event.checked) {
      this.saveEmail();
      return;
    }

    this.storageService.removeLocalItem("userEmail");
  }

  saveEmail() {
    if (!this.loginForm.controls.rememberMe.value) {
      this.storageService.removeLocalItem("userEmail");
      return;
    }

    if (this.loginForm.controls.email.value) {
      this.storageService.saveLocalItem(
        "userEmail",
        this.loginForm.controls.email.value
      );
      return;
    }

    this.markTouchForm();
    this.loginForm.controls.rememberMe.setValue(false);
  }

  /**
   * Reenvia el correo de activacion cuando el backend rechaza el login por cuenta inactiva.
   */
  public async resendActivationEmail() {
    if (this.loginForm.controls.email.invalid) {
      this.loginForm.controls.email.markAsTouched();
      return;
    }

    this.isResendingActivation = true;
    this.cdr.detectChanges();

    try {
      const email = this.loginForm.controls.email.value;
      const responseEmail = await firstValueFrom(
        this._userService.set_email_verify_new_token(email)
      ) as ApiMessageResponse;

      if (responseEmail?.status === 200) {
        const currentLang = this.translate?.currentLang || "es";
        const translations =
          this.translate?.translations?.[currentLang] ||
          this.translate?.translations?.es ||
          {};

        this.messageService.add({
          severity: "success",
          summary:
            translations?.login?.isNotActiveAccountMessageSummary || "Exitoso",
          detail:
            translations?.login?.isNotActiveAccountMessage ||
            "Correo enviado exitosamente",
        });
        this.isNotaccountaActive = false;
        this.cdr.detectChanges();
        return;
      }

      this.isNotaccountaActive = false;
      await this._router.navigate(["/"]);
    } catch {
      this.isNotaccountaActive = false;
      await this._router.navigate(["/"]);
    } finally {
      this.isResendingActivation = false;
      this.cdr.detectChanges();
    }
  }

  private focusInvalidControl() {
    setTimeout(() => {
      focusFirstInvalidControl(document.getElementById("loginForm"));
    }, 0);
  }
}
