import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { MessageService } from "primeng/api";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LoginService } from "src/app/services/login.service";
import {
  ApiMessageResponse,
  AdministratorProfileSummary,
  ManagedUserSummary,
} from "src/app/core/interfaces/api-contracts";
import { ChangePasswordForm, User } from "../../models/evaluation.models";

@Component({
  selector: "app-admin-profile",
  templateUrl: "./admin-profile.component.html",
  styleUrls: ["./admin-profile.component.css"],
  providers: [MessageService],
  standalone: false,
})
/**
 * Perfil del administrador autenticado.
 * Permite consultar los datos base del usuario y ejecutar cambios de datos
 * personales o contrasena desde dialogs locales.
 */
export class AdminProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly passwordPattern = "(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}";

  public showOldPassword = false;
  public showPassword = false;
  public showPassword2 = false;
  public formSubmit = false;
  public passwordUpdateForm = this.fb.group(
    {
      password: [null, [Validators.required, Validators.pattern(this.passwordPattern)]],
      password2: [null, Validators.required],
      old_password: [null, Validators.required],
    },
    {
      validators: this.passwordsVerified("password", "password2"),
    }
  );

  public user: ManagedUserSummary = {};
  public userData: User = new User();
  public administrator: AdministratorProfileSummary = {};
  public isEmpty = false;
  public changeDataDialog = false;
  public changePasswordDialog = false;
  public submitted = false;
  public activeUpdate = false;
  public isReady = false;
  public isSavingData = false;
  public isSavingPassword = false;
  public message: string | null = null;

  constructor(
    public loginService: LoginService,
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    private messageService: MessageService,
    private fb: UntypedFormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([{ label: "Mi perfil" }]);
  }

  ngOnInit(): void {
    this.loadUserProfile(this.loginService.user.id);
    this.activeUpdate = this.loginService.user.roles.includes("superuser");
  }

  public getUserInitials(): string {
    const first = (this.user?.first_name || "").trim().charAt(0);
    const last = (this.user?.last_name || "").trim().charAt(0);
    return `${first}${last}`.trim() || "AD";
  }

  /**
   * Recupera el perfil administrativo actual para poblar la vista y el dialogo
   * de actualizacion de datos.
   */
  loadUserProfile(id: number): void {
    this.isReady = false;

    this.administratorService.getAdministratorUser(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.administrator = user?.administrator || {};
          this.isEmpty = user?.administrator != null;
          this.isReady = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.user = {};
          this.administrator = {};
          this.isEmpty = false;
          this.isReady = true;
          this.cdr.detectChanges();
        },
      });
  }

  openChangePassword(): void {
    this.submitted = false;
    this.message = null;
    this.passwordUpdateForm.reset();
    this.formSubmit = false;
    this.showOldPassword = false;
    this.showPassword = false;
    this.showPassword2 = false;
    this.isSavingPassword = false;
    this.changePasswordDialog = true;
  }

  openChangeData(user: User): void {
    this.userData = {
      ...user,
      administrator: {
        ...(user?.administrator || {
          phone: "",
          country: "",
          city: "",
        }),
      },
    };
    this.submitted = false;
    this.isSavingData = false;
    this.changeDataDialog = true;
  }

  hideDialogUpdateData(): void {
    if (this.isSavingData) {
      return;
    }

    this.changeDataDialog = false;
    this.submitted = false;
  }

  /**
   * Normaliza el formulario del dialogo y persiste los cambios basicos del
   * administrador.
   */
  saveData(): void {
    this.submitted = true;
    this.normalizeProfilePhoneInput();
    if (!this.isProfileDataValid() || this.isSavingData) {
      return;
    }

    const payload = {
      ...this.userData,
      first_name: this.trimValue(this.userData.first_name),
      last_name: this.trimValue(this.userData.last_name),
      administrator: {
        ...this.userData.administrator,
        phone: this.trimValue(this.userData.administrator?.phone),
        country: this.trimValue(this.userData.administrator?.country),
        city: this.trimValue(this.userData.administrator?.city),
      },
    };

    this.isSavingData = true;

    this.administratorService.updateAdministratorDataUser(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSavingData = false;
        })
      )
      .subscribe({
        next: (result: ManagedUserSummary) => {
          if (result?.["message"] === "success") {
            this.user = {
              ...this.user,
              first_name: payload.first_name,
              last_name: payload.last_name,
            };
            this.administrator = {
              ...this.administrator,
              ...payload.administrator,
            };
            this.changeDataDialog = false;
            this.submitted = false;

            // Refresca el perfil despues del cierre para evitar que el dialogo se quede
            // visible mientras llega la segunda peticion.
            setTimeout(() => {
              this.loadUserProfile(this.user.id || this.loginService.user.id);
            }, 0);

            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Actualizado con exito",
            });
            return;
          }

          this.messageService.add({
            severity: "info",
            summary: "Confirmed",
            detail: "Ha ocurrido un error, por favor intentelo de nuevo mas tarde.",
          });
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo actualizar la informacion. Intentalo de nuevo.",
          });
        },
      });
  }

  /**
   * Valida y envia el cambio de contrasena del administrador autenticado.
   */
  updatePassword(): void {
    this.formSubmit = true;
    if (this.passwordUpdateForm.invalid || this.isSavingPassword) {
      return;
    }

    try {
      this.isSavingPassword = true;
      this.administratorService
        .changePassword(
          this.user.id || this.loginService.user.id,
          this.passwordUpdateForm.getRawValue() as ChangePasswordForm
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => {
            this.isSavingPassword = false;
          })
        )
        .subscribe((data: ApiMessageResponse & { details?: { old_password?: { old_password?: string } } }) => {
          if (data.status === "Ok") {
            this.messageService.add({
              severity: "info",
              summary: "Confirmed",
              detail: "Contrasena modificada correctamente.",
            });
            this.resetValue();
            setTimeout(() => {
              this.logOut();
            }, 700);
          } else if (
            data.details.old_password.old_password === "Old password is not correct"
          ) {
            this.message = "La contrasena anterior es incorrecta.";
          }
        });
    } catch (error) {
      this.isSavingPassword = false;
      return;
    }
  }

  campoNoValido(campo: string): boolean {
    return !!(this.passwordUpdateForm.get(campo)?.invalid && this.formSubmit);
  }

  passwordPatternInvalid(): boolean {
    return !!(this.passwordUpdateForm.get("password")?.hasError("pattern") && this.formSubmit);
  }

  passwordRequiredInvalid(): boolean {
    return !!(this.passwordUpdateForm.get("password")?.hasError("required") && this.formSubmit);
  }

  passwordMismatchInvalid(): boolean {
    const password2Control = this.passwordUpdateForm.get("password2");
    return !!(password2Control?.hasError("noEsIgual") &&
      (password2Control.dirty || password2Control.touched || this.formSubmit));
  }

  password2RequiredInvalid(): boolean {
    return !!(this.passwordUpdateForm.get("password2")?.hasError("required") && this.formSubmit);
  }

  shouldShowPasswordRules(): boolean {
    const password = this.passwordValue();
    return !!password && !this.passwordRulesComplete();
  }

  passwordHasValidLength(): boolean {
    const password = this.passwordValue();
    return password.length >= 8 && password.length <= 30;
  }

  passwordHasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordValue());
  }

  passwordHasLowercase(): boolean {
    return /[a-z]/.test(this.passwordValue());
  }

  passwordHasNumber(): boolean {
    return /\d/.test(this.passwordValue());
  }

  passwordRulesComplete(): boolean {
    return this.passwordHasValidLength() &&
      this.passwordHasUppercase() &&
      this.passwordHasLowercase() &&
      this.passwordHasNumber();
  }

  profileFieldInvalid(field: "first_name" | "last_name" | "country" | "city"): boolean {
    if (!this.submitted) {
      return false;
    }

    const value = field === "first_name" || field === "last_name"
      ? this.userData?.[field]
      : this.userData?.administrator?.[field];

    return this.trimValue(value).length === 0;
  }

  profilePhoneRequiredInvalid(): boolean {
    return this.submitted && this.trimValue(this.userData?.administrator?.phone).length === 0;
  }

  profilePhoneFormatInvalid(): boolean {
    const phone = this.trimValue(this.userData?.administrator?.phone);
    return this.submitted && phone.length > 0 && !/^\d{10}$/.test(phone);
  }

  normalizeProfilePhoneInput(): void {
    if (!this.userData?.administrator) {
      return;
    }

    const value = this.userData.administrator.phone || "";
    this.userData.administrator.phone = String(value).replace(/\D/g, "").slice(0, 10);
  }

  passwordsVerified(pass1Name: string, pass2Nmae: string) {
    return (formGroup: UntypedFormGroup) => {
      const pass1Control = formGroup.get(pass1Name);
      const pass2Control = formGroup.get(pass2Nmae);
      if (!pass1Control || !pass2Control) {
        return;
      }

      const pass2Errors = pass2Control.errors || {};

      if (pass1Control.value === pass2Control.value) {
        delete pass2Errors.noEsIgual;
        pass2Control.setErrors(Object.keys(pass2Errors).length ? pass2Errors : null);
      } else {
        pass2Control.setErrors({ ...pass2Errors, noEsIgual: true });
      }
    };
  }

  logOut(): void {
    this.loginService.signOut();
  }

  resetValue(): void {
    this.changePasswordDialog = false;
    this.submitted = false;
    this.passwordUpdateForm.reset();
    this.formSubmit = false;
    this.message = null;
    this.showOldPassword = false;
    this.showPassword = false;
    this.showPassword2 = false;
    this.isSavingPassword = false;
  }

  private passwordValue(): string {
    return this.passwordUpdateForm.get("password")?.value || "";
  }

  private isProfileDataValid(): boolean {
    return !this.profileFieldInvalid("first_name") &&
      !this.profileFieldInvalid("last_name") &&
      !this.profileFieldInvalid("country") &&
      !this.profileFieldInvalid("city") &&
      !this.profilePhoneRequiredInvalid() &&
      !this.profilePhoneFormatInvalid();
  }

  private trimValue(value: string | null | undefined): string {
    return String(value || "").trim();
  }
}
