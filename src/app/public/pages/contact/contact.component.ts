import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MessageService } from "primeng/api";
import { firstValueFrom } from "rxjs";
import { DEVELOPERS_DATA } from "../../data/developers.data";
import { DeveloperProfile } from "../../data/developer-profile";
import { ApiMessageResponse } from "src/app/core/interfaces/api-contracts";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { UserService } from "src/app/services/user.service";

/**
 * Gestiona el formulario publico de contacto y expone los canales directos del proyecto.
 *
 * Responsabilidades:
 * - Validar y enviar el mensaje de contacto al backend.
 * - Mostrar estados de exito y error mediante toast.
 * - Reutilizar el catalogo publico del equipo tecnico.
 * - Publicar el breadcrumb de la ruta.
 *
 * Notas:
 * - `detectChanges()` se conserva porque el submit ocurre despues de `await` y
 *   necesitamos reflejar el estado de carga de inmediato en Angular 21.
 */
@Component({
  selector: "app-contact",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"],
  standalone: false,
})
export class ContactComponent implements OnInit {
  public angForm: UntypedFormGroup;
  public developers: DeveloperProfile[] = [];
  public isSubmitting = false;
  public contactStatusMessage = "";
  public readonly directContactEmail = "catedraunescoinclusion@ups.edu.ec";

  constructor(
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private languageService: LanguageService,
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.developers = DEVELOPERS_DATA;
    void this.addBreadcrumb();
  }

  /**
   * Publica el breadcrumb traducido de la pagina de contacto.
   */
  private async addBreadcrumb(): Promise<void> {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      {
        label: await firstValueFrom(this.languageService.translate.get("menu.contact")),
        routerLink: ["/contact"],
      },
    ]);
  }

  createForm(): void {
    this.angForm = this.fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      message: [null, Validators.required],
    });
  }

  /**
   * Ejecuta el envio del formulario y sincroniza los estados visuales del submit.
   */
  async validateUser(): Promise<void> {
    this.contactStatusMessage = "";

    if (this.angForm.valid) {
      const dataEmail = this.angForm.getRawValue();
      this.isSubmitting = true;
      this.cdr.detectChanges();

      try {
        const sendEmail: ApiMessageResponse = await firstValueFrom(
          this.userService.sendContactEmail(dataEmail)
        );

        if (sendEmail.code === 200) {
          this.showSuccess();
          this.angForm.reset();
        } else {
          this.showError();
        }
      } catch {
        this.showError();
      } finally {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    } else {
      this.markTouchForm();
      this.messageService.add({
        severity: "error",
        summary: this.languageService.translate.instant("message.titleError"),
        detail: this.languageService.translate.instant("contact.formInvalid"),
      });
    }
  }

  private showSuccess(): void {
    const message = this.languageService.translate.instant("contact.sendSuccess");
    this.contactStatusMessage = message;
    this.messageService.add({
      severity: "success",
      summary: this.languageService.translate.instant("message.titleSuccess"),
      detail: message,
    });
  }

  private showError(): void {
    const message = this.languageService.translate.instant("contact.sendError");
    this.contactStatusMessage = message;
    this.messageService.add({
      severity: "error",
      summary: this.languageService.translate.instant("message.titleError"),
      detail: message,
    });
  }

  /**
   * Marca todos los controles para forzar la visualizacion de errores.
   */
  markTouchForm(): void {
    this.angForm.markAllAsTouched();
  }

  getNameDescribedBy(): string | null {
    return this.name?.invalid && (this.name.dirty || this.name.touched)
      ? "contact-name-error"
      : null;
  }

  getEmailDescribedBy(): string | null {
    const ids: string[] = [];

    if (this.email?.invalid && (this.email.dirty || this.email.touched)) {
      if (this.email.errors?.["required"]) {
        ids.push("contact-email-required");
      }
      if (this.email.errors?.["email"]) {
        ids.push("contact-email-format");
      }
    }

    return ids.length ? ids.join(" ") : null;
  }

  getMessageDescribedBy(): string | null {
    return this.message?.invalid && (this.message.dirty || this.message.touched)
      ? "contact-message-error"
      : null;
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
