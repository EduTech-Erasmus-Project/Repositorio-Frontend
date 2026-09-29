import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import Swal from "sweetalert2";
import {
  EmailServerConfigPayload,
  EmailServerConfigResponse,
} from "src/app/core/interfaces/api-contracts";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { SettingsService } from "../../services/settings.service";
import {
  controlInvalid,
  getRequestErrorMessage,
  hasTextValue,
  normalizeTrimmedText,
} from "../../shared/admin-form.utils";

interface EmailServerFormControls {
  host: FormControl<string | null>;
  username: FormControl<string | null>;
  password: FormControl<string | null>;
  emailtest: FormControl<string | null>;
  port: FormControl<number | string | null>;
  tls: FormControl<boolean>;
  email_from: FormControl<string | null>;
}

@Component({
  selector: "app-email-server-form",
  templateUrl: "./email-server-form.component.html",
  styleUrls: ["./email-server-form.component.scss"],
  standalone: false,
})
export class EmailServerFormComponent implements OnInit {
  public saving = false;
  public testing = false;
  public form!: FormGroup<EmailServerFormControls>;
  public showPassword = false;

  constructor(
    private _fb: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Editar",
        routerLink: ["/admin/config/server"],
      },
    ]);
  }

  ngOnInit(): void {
    this.form = this._fb.group<EmailServerFormControls>({
      host: this._fb.control<string | null>(null, Validators.required),
      username: this._fb.control<string | null>(null, Validators.required),
      password: this._fb.control<string | null>(null),
      emailtest: this._fb.control<string | null>(null, Validators.email),
      port: this._fb.control<number | string | null>(null, Validators.required),
      tls: this._fb.nonNullable.control(true, Validators.required),
      email_from: this._fb.control<string | null>(null, [
        Validators.required,
        Validators.email,
      ]),
    });

    void this.loadData();
  }

  /**
   * Hidrata la configuracion SMTP actual o la estructura base del backend.
   */
  public async loadData() {
    try {
      const resp = await firstValueFrom(this.settingsService.getOrCreateServer());
      this.patchServerForm(resp);
      this.refreshView();
    } catch (error: unknown) {
      this.showError(error, "No se pudo cargar el servidor de correo.");
    }
  }

  public fieldInvalid(
    field: keyof EmailServerFormControls,
    errorCode = "required"
  ): boolean {
    return controlInvalid(this.form.get(field), errorCode);
  }

  public hasTestEmailValue(): boolean {
    return hasTextValue(this.form.controls.emailtest.value);
  }

  /**
   * Persiste la configuracion actual del servidor de correo.
   */
  public async onSave() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    try {
      this.saving = true;
      this.refreshView();
      await firstValueFrom(
        this.settingsService.updateServer(this.buildPayload(false))
      );
      Swal.fire({
        icon: "success",
        title: "Exito!",
        text: "Se ha actualizado el servidor de correo.",
      });
    } catch (error: unknown) {
      this.showError(error, "No se pudo actualizar el servidor de correo.");
    } finally {
      this.saving = false;
      this.refreshView();
    }
  }

  /**
   * Envia un correo de prueba usando la configuracion actualmente cargada.
   */
  public async onTestEmail() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    if (!this.hasTestEmailValue()) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Debe ingresar un correo para enviar un mensaje de prueba.",
      });
      return;
    }

    try {
      this.testing = true;
      this.refreshView();
      Swal.showLoading();
      await firstValueFrom(this.settingsService.testServer(this.buildPayload(true)));
      Swal.hideLoading();
      Swal.fire({
        icon: "success",
        title: "Exito!",
        text: "Se ha enviado un correo de prueba.",
      });
    } catch (error: unknown) {
      Swal.hideLoading();
      this.showError(error, "No se pudo enviar el correo de prueba.");
    } finally {
      this.testing = false;
      this.refreshView();
    }
  }

  private patchServerForm(server: EmailServerConfigResponse) {
    this.form.patchValue({
      host: typeof server.host === "string" ? server.host : null,
      username: typeof server.username === "string" ? server.username : null,
      password: typeof server.password === "string" ? server.password : null,
      emailtest: null,
      port:
        typeof server.port === "string" || typeof server.port === "number"
          ? server.port
          : null,
      tls: Boolean(server.tls),
      email_from:
        typeof server.email === "string"
          ? server.email
          : typeof server.email_from === "string"
            ? server.email_from
            : null,
    });
  }

  private buildPayload(includeTestEmail: boolean): EmailServerConfigPayload {
    return {
      host: normalizeTrimmedText(this.form.controls.host.value),
      username: normalizeTrimmedText(this.form.controls.username.value),
      password: normalizeTrimmedText(this.form.controls.password.value) || null,
      port: this.form.controls.port.value,
      tls: this.form.controls.tls.value,
      email_from: normalizeTrimmedText(this.form.controls.email_from.value),
      ...(includeTestEmail
        ? { emailtest: normalizeTrimmedText(this.form.controls.emailtest.value) || null }
        : {}),
    };
  }

  private showError(error: unknown, fallback: string) {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: getRequestErrorMessage(error, fallback),
    });
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
