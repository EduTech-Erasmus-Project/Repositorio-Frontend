import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import Swal from "sweetalert2";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import {
  DomainBackendType,
  EmailDomainPayload,
  EmailDomainResponse,
  OptionRegisterResponse,
} from "src/app/core/interfaces/api-contracts";
import { AdminComponent } from "../../admin.component";
import { SettingsService } from "../../services/settings.service";
import {
  controlInvalid,
  getRequestErrorMessage,
  normalizeTrimmedText,
} from "../../shared/admin-form.utils";
import {
  DomainRouteType,
  getDomainBackendType,
  getRegisterOptionLabel,
  isDomainRouteType,
} from "../../shared/email-domain.utils";

interface EmailDomainFormControls {
  domain: FormControl<string | null>;
  type: FormControl<DomainBackendType | null>;
  is_active: FormControl<boolean>;
  option_register_email: FormControl<number | null>;
}

@Component({
  selector: "app-email-domains-form",
  templateUrl: "./email-domains-form.component.html",
  styleUrls: ["./email-domains-form.component.scss"],
  standalone: false,
})
export class EmailDomainsFormComponent implements OnInit {
  public saving = false;
  public form!: FormGroup<EmailDomainFormControls>;
  private _id: number | null = null;

  public types: Array<{ label: string; value: DomainBackendType }> = [
    { label: "ESTUDIANTE", value: "STUDENT" },
    { label: "DOCENTE", value: "TEACHER" },
    { label: "EXPERTO", value: "EXPERT" },
  ];

  public optionsRegister: Array<{ id?: number; type_option?: string }> = [];
  public valueType: DomainBackendType | null = null;
  public valueSelected: DomainRouteType | null = null;

  constructor(
    private _fb: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Agregar",
        routerLink: ["/admin/config/domain/new"],
      },
    ]);

    const idParam = this.route.snapshot.params?.["id"];
    if (idParam === "new") {
      this._id = null;
    } else if (typeof idParam !== "string" || Number.isNaN(Number(idParam))) {
      this.router.navigate(["/admin/config/domain"]);
      return;
    } else {
      this._id = Number(idParam);
    }

    const routeType = this.parseRouteType(this.route.snapshot.queryParams?.["type"]);
    if (!routeType) {
      this.router.navigate(["/admin/config/domain"]);
      return;
    }

    this.valueSelected = routeType;
    this.valueType = getDomainBackendType(routeType);
  }

  public get isEditMode(): boolean {
    return this._id !== null;
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      domain: [null as string | null, Validators.required],
      type: [{ value: this.valueType, disabled: true }, Validators.required],
      is_active: [true, Validators.required],
      option_register_email: [null as number | null, Validators.required],
    });

    this.form.patchValue({ type: this.valueType });
    this.refreshView();

    if (this._id !== null) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/domain/" + this._id],
        },
      ]);
      void this.loadData();
    }

    void this.loadOptionRegister();
  }

  public fieldInvalid(field: keyof EmailDomainFormControls) {
    return controlInvalid(this.form.get(field));
  }

  /**
   * Recupera el dominio actual y traduce sus variantes historicas al formulario.
   */
  public async loadData() {
    try {
      if (!this._id || !this.valueType) {
        return;
      }

      const resp = await firstValueFrom(
        this.settingsService.getDomain(this._id, this.valueType)
      );

      this.form.patchValue({
        domain: resp.domain || null,
        type: this.valueType,
        is_active: Boolean(resp.is_active),
        option_register_email:
          typeof resp.option_register_email === "object"
            ? resp.option_register_email?.id ?? null
            : typeof resp.option_register_email === "number"
              ? resp.option_register_email
              : typeof resp.option_register === "object"
                ? resp.option_register?.id ?? null
                : typeof resp.option_register === "number"
                  ? resp.option_register
                  : null,
      });
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudo cargar el dominio.");
    }
  }

  /**
   * Carga las opciones de registro visibles para la relacion dominio-perfil.
   */
  private async loadOptionRegister() {
    try {
      const optionRegex = await firstValueFrom(
        this.settingsService.getOptionRegister()
      );

      this.optionsRegister = optionRegex.map((res: OptionRegisterResponse) => ({
        id: res.id,
        type_option: getRegisterOptionLabel(res.type_option || ""),
      }));
      this.refreshView();
    } catch (error: unknown) {
      this.showError(error, "No se pudieron cargar las opciones de registro.");
    }
  }

  /**
   * Crea o actualiza un dominio de registro segun el contexto del formulario.
   */
  public async onSave() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    try {
      this.saving = true;
      this.refreshView();
      const data = this.buildPayload();
      if (this._id !== null && this.valueType) {
        await this.update(data);
      } else {
        await this.create(data);
      }

      this.back();
    } catch (error: unknown) {
      this.showError(error, "No se pudo guardar el dominio.");
    } finally {
      this.saving = false;
      this.refreshView();
    }
  }

  private async update(data: EmailDomainPayload) {
    if (!this._id || !this.valueType) {
      return;
    }

    return await firstValueFrom(
      this.settingsService.updateDomain(this._id, data, this.valueType)
    );
  }

  private async create(data: EmailDomainPayload) {
    return await firstValueFrom(this.settingsService.createDomain(data));
  }

  public back() {
    this.router.navigate(["/admin/config/domain"]);
  }

  private parseRouteType(value: unknown): DomainRouteType | null {
    return isDomainRouteType(value) ? value : null;
  }

  private buildPayload(): EmailDomainPayload {
    return {
      domain: normalizeTrimmedText(this.form.controls.domain.value).toLowerCase(),
      type: this.valueType as DomainBackendType,
      is_active: this.form.controls.is_active.value,
      option_register_email: this.form.controls.option_register_email.value,
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
