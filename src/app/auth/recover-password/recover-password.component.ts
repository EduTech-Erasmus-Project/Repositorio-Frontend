
import { HttpClient } from '@angular/common/http';
import { error } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LanguageService } from 'src/app/services/language.service';
import { LoginService } from 'src/app/services/login.service';
import { environment } from 'src/environments/environment.prod';


//const baseUrl = environment.baseUrl;

@Component({
  selector: "app-recover-password",
  templateUrl: "./recover-password.component.html",
  styleUrls: ["./recover-password.component.scss"],
})
export class RecoverPasswordComponent implements OnInit {
  //variables para activar los checkbox
  public dark: boolean = false;
  //Para validacion de campos
  public angForm: FormGroup;
  public email: any;
  public patternV: string =
    "^([a-zA-Z0-9_' - '.]+)@([a-zA-Z0-9_' - '.]+).([a-zA-Z]{2,5})$";
  public emailCheck: boolean = false;
  public is_student: boolean = false;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private loginService: LoginService,
    private messageService: MessageService,
    private router: Router,
    private languageService: LanguageService
  ) {
    this.createForm();
  }

  ngOnInit(): void { }

  createForm() {
    this.angForm = this.fb.group({
      email: [
        this.email,
        [Validators.required, Validators.pattern(this.patternV)],
      ],
    });
  }

  async sentEmail() {
    this.email = this.angForm.get("email").value;
    if (this.angForm.valid) {
      this.loginService.resetPass(this.email).subscribe(
        async (res: any) => {
          if (res.message == "We have send you a link to reset your password") {
            let message_des = await this.languageService.translate.get('register.recoverSentEmail').toPromise();
            this.showSuccess(message_des);
            this.emailCheck = false;
            this.angForm.reset();
            this.router.navigateByUrl("/emailMessage");
          } else if (res.status == 201) {
            this.is_student = true;
            let message_des = await this.languageService.translate.get('login.recoverPasswordM').toPromise();
            this.showSuccess(message_des);
            this.angForm.reset();
            this.emailCheck = false;
          }
        }, async error => {
          let message_des = await this.languageService.translate.get('login.recoverErrorMail').toPromise();
          this.showError(message_des);
          this.emailCheck = true;
        }
      );
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

  showInfo(message) {
    this.messageService.add({
      severity: "info",
      summary: "Info",
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

  markTouchForm() {
    (<any>Object).values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  get email1() {
    return this.angForm.get("email");
  }
}
