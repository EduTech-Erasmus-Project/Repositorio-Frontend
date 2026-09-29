import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ManagedUserSummary } from 'src/app/core/interfaces/api-contracts';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-administrator-user-register',
    templateUrl: './administrator-user-register.component.html',
    styleUrls: ['./administrator-user-register.component.scss'],
    standalone: false
})
/**
 * Formulario de alta de usuarios administradores.
 * Agrupa las validaciones locales minimas antes de enviar el registro al
 * endpoint de gestion administrativa.
 */
export class AdministratorUserRegisterComponent {
  private readonly passwordPattern = "(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}";
  public showPassword = false;
  public showPassword2 = false;
  public formSubmit = false;
  public isSubmitting = false;
  public registerForm = this.fb.group({
    first_name: [null, Validators.required],
    last_name: [null, Validators.required],
    email: [null, [Validators.required, Validators.email]],
    password: [null, [
      Validators.required,
      Validators.pattern(this.passwordPattern),
    ]],
    password2: [null, Validators.required],
    country: [null, Validators.required],
    city: [null, Validators.required],
    phone: [null, [
      Validators.required,
      Validators.pattern("^\\d{10}$"),
    ]],
    // observation: [''],
  }, {
    validators: this.passwordsVerified('password', 'password2')
  });
  constructor(
    private breadcrumbService: BreadcrumbService,
    private fb: UntypedFormBuilder,
    private administratorService: AdministratorService
  ) {
    this.breadcrumbService.setItems([
      { label: 'Registrar administrador' },
    ]);
  }
  /**
   * Crea un nuevo administrador cuando el formulario ya cumple las reglas
   * de negocio locales.
   */
  crearUsuario(): void {
    this.formSubmit = true;
    this.normalizePhoneInput();
    if (this.registerForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.administratorService.registerAdministratorUser(this.registerForm.value)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe((resp: ManagedUserSummary) => {
        Swal.fire({
          icon: 'success',
          title: 'Usuario registrado con correctamente',
          showConfirmButton: false,
          timer: 2500
        })
        this.registerForm.reset();
        this.formSubmit = false;
      }, (err: HttpErrorResponse) => {
        if (err.statusText.toLowerCase() === "Unauthorized".toLocaleLowerCase()) {
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: 'Usuario no autorizado'
          });
          return;
        }

        const message =
          err?.error?.email?.[0] ||
          err?.error?.password?.[0] ||
          err?.error?.detail ||
          err?.error?.message ||
          'No se pudo registrar el usuario';

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: message
        });
      });
  }

  campoNoValido(campo: string): boolean {
    return !!(this.registerForm.get(campo)?.invalid && this.formSubmit);
  }

  passwordsInvalid(): boolean {
    return this.passwordMismatchInvalid();
  }

  passwordPatternInvalid(): boolean {
    return !!(this.registerForm.get('password')?.hasError('pattern') && this.formSubmit);
  }

  passwordRequiredInvalid(): boolean {
    const passwordControl = this.registerForm.get('password');
    return !!(passwordControl?.hasError('required') && this.formSubmit);
  }

  passwordMismatchInvalid(): boolean {
    const password2Control = this.registerForm.get('password2');
    return !!(password2Control?.hasError('noEsIgual') &&
      (password2Control.dirty || password2Control.touched || this.formSubmit));
  }

  password2RequiredInvalid(): boolean {
    return !!(this.registerForm.get('password2')?.hasError('required') && this.formSubmit);
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

  phoneRequiredInvalid(): boolean {
    return !!(this.registerForm.get('phone')?.hasError('required') && this.formSubmit);
  }

  phoneFormatInvalid(): boolean {
    const phoneControl = this.registerForm.get('phone');
    return !!(phoneControl?.hasError('pattern') &&
      (phoneControl.dirty || phoneControl.touched || this.formSubmit));
  }

  normalizePhoneInput(): void {
    const phoneControl = this.registerForm.get('phone');
    if (!phoneControl) {
      return;
    }

    const value = phoneControl.value || '';
    const normalizedValue = String(value).replace(/\D/g, '').slice(0, 10);

    if (value !== normalizedValue) {
      phoneControl.setValue(normalizedValue, { emitEvent: false });
    }
  }

  private passwordValue(): string {
    return this.registerForm.get('password')?.value || '';
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
  resetValue(): void {
    this.registerForm.reset();
    this.formSubmit = false;
    this.showPassword = false;
    this.showPassword2 = false;
    this.isSubmitting = false;
  }
}
