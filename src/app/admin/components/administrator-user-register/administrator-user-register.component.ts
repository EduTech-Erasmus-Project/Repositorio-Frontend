import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-administrator-user-register',
  templateUrl: './administrator-user-register.component.html'
})
export class AdministratorUserRegisterComponent {
  public formSubmit = false;
  public registerForm = this.fb.group({
    first_name: [null, Validators.required],
    last_name: [null, Validators.required],
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
    password2: [null, Validators.required],
    country: [null, Validators.required],
    city: [null, Validators.required],
    phone: [null, Validators.required],
    // observation: [''],
  }, {
    validators: this.passwordsVerified('password', 'password2')
  });
  constructor(private breadcrumbService: BreadcrumbService, private fb: UntypedFormBuilder,
    private administratorService: AdministratorService) {
    this.breadcrumbService.setItems([
      { label: 'Registrar administrador' },
    ]);
  }
  crearUsuario() {
    this.formSubmit = true;
    if (this.registerForm.invalid) {
      return;
    }
    this.administratorService.registerAdministratorUser(this.registerForm.value)
      .subscribe((resp: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Usuario registrado con correctamente',
          showConfirmButton: false,
          timer: 2500
        })
        this.registerForm.reset();
        this.formSubmit = false;
      }, (err: any) => {
        if (err.statusText.toLowerCase() === "Unauthorized".toLocaleLowerCase()) {
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: 'Usuario no autorizado'
          });
        }
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: err.error.email[0]
        });
      });
  }

  campoNoValido(campo: string): boolean {
    if (this.registerForm.get(campo).invalid && this.formSubmit) {
      return true;
    } else {
      return false;
    }
  }

  passwordsInvalid() {
    const password = this.registerForm.get('password').value;
    const password2 = this.registerForm.get('password2').value;
    if (password !== password2 && this.formSubmit) {
      return true;
    } else {
      return false;
    }

  }
  passwordsVerified(pass1Name: string, pass2Nmae: string) {
    return (formGroup: UntypedFormGroup) => {
      const pass1Control = formGroup.get(pass1Name);
      const pass2Control = formGroup.get(pass2Nmae);
      if (pass1Control.value === pass2Control.value) {
        pass2Control.setErrors(null);
      } else {
        pass2Control.setErrors({ noEsIgual: true });
      }

    }
  }
  resetValue(){
    this.registerForm.reset();
    this.formSubmit = false;
  }
}
