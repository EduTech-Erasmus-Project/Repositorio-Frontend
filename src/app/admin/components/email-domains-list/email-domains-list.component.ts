import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewRef } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom, forkJoin } from "rxjs";
import { MessageService } from "primeng/api";
import { Table } from "primeng/table";
import Swal from "sweetalert2";
import { getHttpErrorMessage } from "src/app/core/utils/http-error.utils";
import {
  EmailDomainListResponse,
  OptionRegisterResponse,
  TypeUserOptionRegisterResponse,
} from "src/app/core/interfaces/api-contracts";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { SettingsService } from "../../services/settings.service";
import {
  getActivationStatusLabel,
  getActivationStatusSeverity,
} from "../../shared/admin-status.utils";
import {
  DomainRouteType,
  getDomainDescriptionCode,
  getDomainRouteLabel,
  getRegisterOptionLabel,
} from "../../shared/email-domain.utils";

interface DomainRow {
  id: number;
  domain: string;
  is_active: boolean;
  option_id: number | null;
  type_option: string;
}

interface RegisterOptionItem {
  id: number;
  type_option: string;
}

interface TypeUserOptionRelation extends TypeUserOptionRegisterResponse {
  id: number;
  description: string;
  option_register?: OptionRegisterResponse | null;
}

@Component({
  selector: "app-email-domains-list",
  templateUrl: "./email-domains-list.component.html",
  styleUrls: ["./email-domains-list.component.scss"],
  standalone: false,
})
export class EmailDomainsListComponent implements OnInit {
  @ViewChild("dt") table!: Table;

  public domains: DomainRow[] = [];
  public isLoading = false;
  public registerOptions: RegisterOptionItem[] = [];
  public typeUserOptionRelations: TypeUserOptionRelation[] = [];
  public selectedValue: DomainRouteType = "profesor";
  public selectedRegisterOptionLabel = "TODOS";
  public selectedRoleOptionId: number | null = null;
  public hasPendingRelationChange = false;

  private currentRoleOptionId: number | null = null;

  constructor(
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private messageService: MessageService,
    private router: Router,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Dominios",
        routerLink: ["/admin/config/domain"],
      },
    ]);
  }

  public readonly getStatusLabel = getActivationStatusLabel;
  public readonly getStatusSeverity = getActivationStatusSeverity;

  public getSelectedRoleLabel(): string {
    return getDomainRouteLabel(this.selectedValue);
  }

  ngOnInit(): void {
    void this.initializeCatalogs();
  }

  /**
   * Carga las opciones maestras del modulo y sincroniza el listado inicial.
   */
  private async initializeCatalogs(): Promise<void> {
    try {
      const response = await firstValueFrom(
        forkJoin({
          optionRelations: this.settingsService.getTypeUserOptionRegister(),
          registerOptions: this.settingsService.getOptionRegister(),
        })
      );

      this.typeUserOptionRelations = response.optionRelations
        .filter((relation): relation is TypeUserOptionRelation => {
          return typeof relation.id === "number" && typeof relation.description === "string";
        })
        .map((relation) => ({
          ...relation,
          id: relation.id as number,
          description: relation.description as string,
        }));

      this.registerOptions = response.registerOptions
        .filter((option): option is Required<Pick<OptionRegisterResponse, "id">> & OptionRegisterResponse => {
          return typeof option.id === "number";
        })
        .map((option) => ({
          id: option.id as number,
          type_option: getRegisterOptionLabel(option.type_option || ""),
        }));

      this.syncRoleOptionSelection();
      await this.loadData(this.selectedValue);
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: getHttpErrorMessage(error),
      });
    } finally {
      this.refreshView();
    }
  }

  /**
   * Sincroniza la opcion configurada para el rol actualmente seleccionado.
   */
  private syncRoleOptionSelection(): void {
    const roleDescription = getDomainDescriptionCode(this.selectedValue);
    const relation = this.typeUserOptionRelations.find((item) => item.description === roleDescription);
    const optionRegister = relation?.option_register;
    const optionId = typeof optionRegister?.id === "number" ? optionRegister.id : null;

    this.selectedRoleOptionId = optionId;
    this.currentRoleOptionId = optionId;
    this.hasPendingRelationChange = false;
  }

  /**
   * Carga los dominios del rol seleccionado usando la regla de registro activa.
   */
  public async loadData(role: DomainRouteType): Promise<void> {
    this.selectedValue = role;
    this.isLoading = true;
    this.syncRoleOptionSelection();

    try {
      const selectedRegisterOption = this.registerOptions.find(
        (option) => option.type_option === this.selectedRegisterOptionLabel
      );

      if (!selectedRegisterOption) {
        this.domains = [];
        return;
      }

      const response = await this.fetchDomainsByRole(role, selectedRegisterOption.id);
      this.domains = (response.data || []).map((domain) => ({
        id: domain.id ?? 0,
        domain: domain.domain || "",
        is_active: Boolean(domain.is_active),
        option_id:
          typeof domain.option_register_email === "object"
            ? domain.option_register_email?.id ?? null
            : typeof domain.option_register_email === "number"
              ? domain.option_register_email
              : null,
        type_option: getRegisterOptionLabel(
          typeof domain.option_register_email === "object"
            ? domain.option_register_email?.type_option || ""
            : ""
        ),
      }));
    } catch (error: unknown) {
      this.domains = [];
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: getHttpErrorMessage(error),
      });
    } finally {
      this.isLoading = false;
      this.refreshView();
    }
  }

  /**
   * Elimina un dominio del rol actual y recarga el listado filtrado.
   */
  public async onDelete(id: number): Promise<void> {
    const result = await Swal.fire({
      title: "Estas seguro de eliminar?",
      text: "Se eliminara el registro y todos sus registros que dependan de este!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar!",
      cancelButtonText: "No, Cancelar!",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.showLoading();
      await firstValueFrom(this.settingsService.deleteDomain(id));
      await this.loadData(this.selectedValue);
      this.messageService.add({
        severity: "success",
        summary: "Eliminado",
        detail: "Dominio eliminado correctamente",
      });
      Swal.hideLoading();
    } catch (error: unknown) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: getHttpErrorMessage(error),
      });
    }
  }

  /**
   * Navega a la pantalla de creacion conservando el rol activo.
   */
  sendParamsCreateEmailDomain(): void {
    this.router.navigate(["/admin/config/domain/new"], { queryParams: { type: this.selectedValue } });
  }

  /**
   * Navega a la pantalla de edicion del dominio actual conservando el rol activo.
   */
  sendParamsEditEmailDomain(id: number): void {
    this.router.navigate([`/admin/config/domain/${id}`], { queryParams: { type: this.selectedValue } });
  }

  /**
   * Guarda la relacion entre rol y opcion de registro seleccionada.
   */
  public async updateRelationTypeUserOption(): Promise<void> {
    const relation = this.typeUserOptionRelations.find(
      (item) => item.description === getDomainDescriptionCode(this.selectedValue)
    );

    if (!relation || this.selectedRoleOptionId == null) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No existe una configuracion valida para actualizar",
      });
      return;
    }

    try {
      await firstValueFrom(
        this.settingsService.updateTypeUserOptionRegister(
          {
            ...relation,
            option_register: this.selectedRoleOptionId,
          },
          relation.id
        )
      );

      this.currentRoleOptionId = this.selectedRoleOptionId;
      this.hasPendingRelationChange = false;
      this.messageService.add({
        severity: "success",
        summary: "Modificado",
        detail: "Tipo de registro modificado correctamente",
      });

      await this.initializeCatalogs();
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: getHttpErrorMessage(error),
      });
      this.refreshView();
    }
  }

  /**
   * Detecta si la opcion elegida difiere de la configuracion persistida.
   */
  public changeNameOption(): void {
    this.hasPendingRelationChange = this.selectedRoleOptionId !== this.currentRoleOptionId;
    this.refreshView();
  }

  private fetchDomainsByRole(
    role: DomainRouteType,
    optionId: number
  ): Promise<EmailDomainListResponse> {
    if (role === "experto") {
      return firstValueFrom(this.settingsService.getDomainExpert(optionId));
    }

    if (role === "estudiante") {
      return firstValueFrom(this.settingsService.getDomainStudent(optionId));
    }

    return firstValueFrom(this.settingsService.getDomainsTeacher(optionId));
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
