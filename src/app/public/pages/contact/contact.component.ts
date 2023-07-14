import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { MessageService, PrimeIcons } from "primeng/api";
import { Subscription } from "rxjs";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-contact",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"],
})
export class ContactComponent implements OnInit, OnDestroy {
  public angForm: UntypedFormGroup;
  events1: any[];
  private subscription: Subscription[] = [];
  constructor(
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private languageService: LanguageService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService
  ) {
    this.createForm();
    this.add_breadcrumb();
  }

  ngOnDestroy(): void {
    this.subscription.forEach((element) => {
      element.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.events1 = [
      {
        user1: {
          status: "Ing. Ángel Pérez",
          date: "Docente",
          icon: PrimeIcons.ANGLE_LEFT,
          color: "#3B5B68",
          email: "aperezm@ups.edu.ec",
          email1: "",
        },
        user2: {
          status: "Ing. Paola Ingavelez",
          date: "Docente",
          icon: PrimeIcons.ANGLE_RIGHT,
          color: "#3B5B68",
          email: "pcingavelez@ups.edu.ec",
          email1: "",
        },
      },
      {
        user1: {
          status: "Ing. Edwin Marquez",
          date: "Desarrollo Frontend y Backend",
          icon: PrimeIcons.ANGLE_RIGHT,
          color: "#3B5B68",
          email: "emarquezl@est.ups.edu.ec",
          email1: "edwi1999@hotmail.com",
        },
        user2: {
          status: "Ing. Claudio Maldonado",
          date: "Desarrollo Frontend",
          icon: PrimeIcons.ANGLE_LEFT,
          color: "#3B5B68",
          email: "cmaldonadom3@est.ups.edu.ec",
          email1: "claudio.mldo@outlook.com",
        },
      },
      {
        user1: {
          status: "Ing. Bryam Chimbo",
          date: "Desarrollo Backend y Frontend",
          icon: PrimeIcons.ANGLE_LEFT,
          color: "#3B5B68",
          email: "bchimboa1@est.ups.edu.ec",
          email1: "bry4mchimbo@gmail.com",
        },
        user2: {
          status: "Ing. Ángel Paqui",
          date: "Desarrollo Backend",
          icon: PrimeIcons.ANGLE_RIGHT,
          color: "#3B5B68",
          email: "apaquig@est.ups.edu.ec",
          email1: "angelpaqui36@gmail.com",
        },
      },
    ];
  }

  private async add_breadcrumb() {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      {
        label: await this.languageService.translate
          .get("menu.contact")
          .toPromise(),
        routerLink: ["/contact"],
      },
    ]);
  }

  createForm() {
    this.angForm = this.fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      message: [null, Validators.required],
    });
  }

  async validateUser() {
    if (this.angForm.valid) {
      let dataEmail = this.angForm.getRawValue();
      try{
        let sendEmail: any = await this.userService.sendContactEmail(dataEmail).toPromise();
      if (sendEmail.code == 200) {
        this.showSuccess();
        this.angForm.reset();
      } else {
        this.showError();
      }
      }catch (e){ 
        this.showError();
      }
    } else {
      this.markTouchForm();
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Formulario Invalido",
      });
    }
  }

  private showSuccess() {
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: "Datos enviados correctamente",
    });
  }

  private showError() {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: "Hubo un error al tratar de enviar el correo electronico",
    });
  }

  markTouchForm() {
    (<any>Object).values(this.angForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
  get name() {
    return this.angForm.get("name");
  }
  get email() {
    return this.angForm.get("email");
  }
  get message() {
    return this.angForm.get("message");
  }
}
