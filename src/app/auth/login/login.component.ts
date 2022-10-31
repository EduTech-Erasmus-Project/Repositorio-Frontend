import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { AuthService } from "../../admin/services/auth.service";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { LanguageService } from "../../services/language.service";
import { MessageService } from "primeng/api";
import { LoginService } from "../../services/login.service";
import { StorageService } from "../../services/storage.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  //dark: boolean=false;
  public checked: boolean;
  public translate: TranslateService;
  public msjError;
  private subscribes: Subscription[] = [];
  private msjModal: string;
  public show: boolean= false;

  //public formSubmit: false;

  public loginForm = this.fb.group({
    email: [
      this.storageService.getCookieItem("userEmail") || null,
      [
        Validators.required,
        Validators.pattern(
          "^([a-zA-Z0-9_'-'.]+)@([a-zA-Z0-9_'-'.]+).([a-zA-Z]{2,5})$"
        ),
      ],
    ],
    password: [null, [Validators.required]],
    rememberMe: [!!this.storageService.getCookieItem("userEmail")],
  });

  // dartActive(dart_active: boolean):boolean{
  //   this.dark = dart_active;
  //   localStorage.setItem('dart_active',dart_active.toString());
  //   return this.dark;
  // }

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private languageService: LanguageService,
    private messageService: MessageService,
    private loginService: LoginService,
    private storageService: StorageService,
    private breadcrumbService: BreadcrumbService
  ) {
    //this.dark = localStorage.getItem('dart_active')==='true'?true:false;
    this.add_breadcrumb();
  }
  ngOnDestroy(): void {

    this.subscribes.forEach((sub) => {
      sub.unsubscribe;
    });
  }

  ngOnInit(): void {
    this.translate = this.languageService.translate;

    this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
      this.msjModal = translate.translations.login.modalMsj;
      this.msjError = {
        severity: "error",
        summary: translate.translations.message.titleError,
        detail: translate.translations.login.errorMesage,
      };
    });
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      {label: "ROA"},
      { label: await this.languageService.translate.get('menu.login').toPromise(), routerLink: ["/login"] },
    ]);
  }

  get errorEmailRequired(): boolean {
    return (
      this.loginForm.get("email").errors?.required &&
      this.loginForm.get("email").touched
    );
  }
  get errorEmailFormat(): boolean {
    return (
      this.loginForm.get("email").errors?.pattern &&
      this.loginForm.get("email").touched
    );
  }
  get errorPasswordRequired(): boolean {
    return (
      this.loginForm.get("password").errors?.required &&
      this.loginForm.get("password").touched
    );
  }

  async onLogin() {
    //optimize on translate implementation
    this.loadTranslateText();

    this.messageService.clear();

    if (this.loginForm.valid) {
      Swal.fire({
        allowOutsideClick: false,
        icon: "info",
        text: this.msjModal,
      });
      Swal.showLoading();

      let formData = {
        email: this.loginForm.get("email").value,
        password: this.loginForm.get("password").value,
      };

      let loginSub = await this.loginService.signIn(formData).subscribe(
        async (res: any) => {
          if (res.detail) {
            this.showMessageError();
            Swal.close();
            return;
          }
          this.storageService.saveCookieItem("data_acc", res.access);
          this.storageService.saveCookieItem("data_ref", res.refresh);
          await this.loginService
            .validateUser(res.access)
            .then(() => {
              if(this.loginService.user?.roles.includes('teacher')){    
                this.loginService.characterMenu.emit(true);
              }
              this.saveEmail();
              Swal.close();
            })
            .catch((err) => {
              let msjErrorServer = {
                severity: "error",
                summary: "Server Error",
                detail: err,
              };
              this.messageService.add(msjErrorServer);

              this.showMessageError();
              Swal.close();
            });
        },
        (error) => {
          this.showMessageError();
          Swal.close();
        }
      );

      this.subscribes.push(loginSub);
    } else {
      this.markTouchForm();
    }
  }

  markTouchForm() {
    (<any>Object).values(this.loginForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  loadTranslateText() {
    let currentLng = this.translate.currentLang;
    if (currentLng === "es") {
      this.msjModal = this.translate.translations.es.login.modalMsj;
      this.msjError = {
        severity: "error",
        summary: this.translate.translations.es.message.titleError,
        detail: this.translate.translations.es.login.errorMesage,
      };
    } else if (currentLng == "en") {
      this.msjModal = this.translate.translations.en.login.modalMsj;
      this.msjError = {
        severity: "error",
        summary: this.translate.translations.en.message.titleError,
        detail: this.translate.translations.en.login.errorMesage,
      };
    }
  }

  showMessageError() {
    this.messageService.add(this.msjError);
  }

  onSaveEmail(event) {
    if (event.checked) {
      this.saveEmail();
    } else {
      this.storageService.removeCookieItem("userEmail");
    }
  }

  saveEmail(){
    if (
      this.loginForm.get("email").value !== null &&
      this.loginForm.get("email").value !== ""
    ) {
      this.storageService.saveCookieItem(
        "userEmail",
        this.loginForm.get("email").value
      );
    } else {
      this.markTouchForm(); //rememberMe
      this.loginForm.controls["rememberMe"].setValue(false);
    }
  }
}
