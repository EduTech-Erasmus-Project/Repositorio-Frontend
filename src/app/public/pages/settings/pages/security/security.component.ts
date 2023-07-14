import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { Message, MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-security",
  templateUrl: "./security.component.html",
  styleUrls: ["./security.component.scss"],
})
export class SecurityComponent implements OnInit {
  public show: boolean = false;
  public show2: boolean = false;
  public flagConfirm: boolean = false;
  public passError: boolean = false;
  public angForm: UntypedFormGroup;
  public subscribes: Subscription[] = [];
  public passwords: any;
  public passsword_invalid : boolean = false;
  public newPassword: string;
  public oldPassword: string;
  public againPassword: string;

  public msgs1: Message[];
  constructor(
    private fb: UntypedFormBuilder,
    public loginService: LoginService,
    private messageService: MessageService,
    private breadcrumbService:BreadcrumbService,
    private languageService: LanguageService
  ) {
    this.createForm();
    this.add_breadcrumb();
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    //console.log("Este es el Id:", this.loginService.user.id);
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await this.languageService.translate.get('menu.settings').toPromise()},
      { label: await this.languageService.translate.get('menu.sideMenu.security').toPromise(), routerLink: ["/settings/security"] },
    ]);
  }

  createForm() {
    this.angForm = this.fb.group({
      passwordOld: [this.oldPassword, [Validators.required]],
      passwordNew: [
        {value: this.newPassword, disabled: false},
        [
          Validators.required,
          Validators.pattern(
            "(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}"
          ),
        ],
      ],
      passwordAgain: [{value:this.againPassword, disabled: true}, [Validators.required]],
    });
  }

  async sendPasswordRest() {
    if (this.angForm.valid) {
      if(this.validatorPassword()){
        this.showError('La contraseñas no coinciden');
        return;
      }
      this.oldPassword = this.angForm.get("passwordOld").value;
      this.newPassword = this.angForm.get("passwordNew").value;
      this.againPassword = this.angForm.get("passwordAgain").value;
      this.passwords = {
        password: this.newPassword,
        password2: this.againPassword,
        old_password: this.oldPassword,
      };

      //console.log('Aki las contraseñas',this.loginService.user);

      let sendResetPass = await this.loginService
        .changePassword(this.passwords, this.loginService.user.id)
        .subscribe(
          (res) => {
          
              if(res.status == "Ok") {
                this.showSuccess("Contraseña actualizada");
                //console.log("res",res);
                Swal.fire({
                  allowOutsideClick: false,
                  icon: "info",
                  text: "Actualizando su contraseña...",
                });
                Swal.showLoading(null);
                this.loginService.signOutPass();
                Swal.close();
            }
           
          },
          (error) => {
            if(error.error.details.password[0] == "New password cannot be the same as above."){
              this.passsword_invalid = true;
              this.showError('La nueva contraseña no puede ser la misma que la anterior.');
              this.angForm.controls.passwordNew.markAllAsTouched();
              this.angForm.controls.passwordAgain.markAllAsTouched();
            }

            if (
              error.error.details.old_password.old_password ==
              "Old password is not correct"
            ) {
              this.showError("La contraseña anterior es incorrecta");
              this.passError = true;
            }
            if (
              error.error.details.password[0] == "Password fields didn't match."
            ) {
              this.showError("La contraseña nueva no coincide");
              this.passError = true;
            }
            if (
              error?.error?.details?.old_password.old_password ==
              "Old password is not correct"
            ) {
              this.showError("La contraseña actual es incorrecta");
              this.passError = true;
            }
          }
        );
      this.subscribes.push(sendResetPass);
    } else {
      this.markTouchForm();
    }
  }

  showError(message) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: message,
    });
  }
  showSuccess(message) {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: message,
    });
  }

  validatorPassword() {
    if (
      this.angForm.get("passwordNew").value ===
      this.angForm.get("passwordAgain").value
    ) {
      // console.log('Si son iguales')
      this.flagConfirm = true;
      this.passsword_invalid = false;
      return false;
    }else{
      this.flagConfirm = false;
      return true;
    }
  }
  resetForm() {
    this.angForm.reset();
    this.show = false;
  }

  markTouchForm() {
    (<any>Object).values(this.angForm.controls).forEach((control) => {
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
  
  public enabled_Password(){
    if(this.angForm.get("passwordAgain").status === 'DISABLED' && this.angForm.get('passwordNew').value != null && this.angForm.get('passwordNew').value !=''){
      this.angForm.controls['passwordAgain'].enable();
    }else{
      if(this.angForm.get('passwordNew').value === null || this.angForm.get('passwordNew').value === undefined || this.angForm.get('passwordNew').value ===''){
        this.angForm.controls['passwordAgain'].disable();
      }
    }
  }
}
