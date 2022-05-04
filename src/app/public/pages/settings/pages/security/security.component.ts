import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Message, MessageService } from "primeng/api";
import { Subscription } from "rxjs";
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
  public angForm: FormGroup;
  public subscribes: Subscription[] = [];
  public passwords: any;

  public newPassword: string;
  public oldPassword: string;
  public againPassword: string;

  public msgs1: Message[];
  constructor(
    private fb: FormBuilder,
    public loginService: LoginService,
    private messageService: MessageService
  ) {
    this.createForm();
  }

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    //console.log("Este es el Id:", this.loginService.user.id);
  }

  createForm() {
    this.angForm = this.fb.group({
      passwordOld: [this.oldPassword, [Validators.required]],
      passwordNew: [
        this.newPassword,
        [
          Validators.required,
          Validators.pattern(
            "(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}"
          ),
        ],
      ],
      passwordAgain: [this.againPassword, [Validators.required]],
    });
  }

  async sendPasswordRest() {
    if (this.angForm.valid) {
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
            if (
              res.error.details.old_password.old_password ==
              "Old password is not correct"
            ) {
              this.showError("La contraseña actual es incorrecta");
              this.passError = true;
            } else {
              this.showSuccess("Contraseña actualizada");
              //console.log("res",res);
              Swal.fire({
                allowOutsideClick: false,
                icon: "info",
                text: "Actualizando su contraseña...",
              });
              Swal.showLoading();
              this.loginService.signOutPass();
              Swal.close();
            }
          },
          (error) => {
            console.log("err", error);
            if (
              error.error.details.old_password.old_password ==
              "Old password is not correct"
            ) {
              this.showError("La contraseña actual es incorrecta");
              this.passError = true;
            }
            if (
              error.error.details.password[0] == "Password fields didn't match."
            ) {
              this.showError("La contraseña nueva no coincide");
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
      this.angForm.get("passwordNew").value ==
      this.angForm.get("passwordAgain").value
    ) {
      // console.log('Si son iguales')
      this.flagConfirm = true;
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
}
