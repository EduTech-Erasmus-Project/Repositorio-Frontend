import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewRef,
} from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { firstValueFrom } from "rxjs";
import Swal from "sweetalert2";
import { getHttpErrorMessage } from "src/app/core/utils/http-error.utils";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { UserCreated } from "src/app/core/interfaces/UserCreated";
import { shouldDisplayLearningObjectMenu } from "src/app/core/utils/learning-object-preview";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { buildManagedAdminProfilePath } from "../../shared/admin-managed-user.utils";
import {
  DELETE_MESSAGE_TEMPLATE,
  FINDINGS_MESSAGE_TEMPLATE,
} from "../../shared/learning-object-message-templates";

/**
 * Muestra el detalle administrativo de un OA pendiente o aprobado y concentra
 * las acciones de aprobacion, borrado y lectura extendida de metadatos.
 */
@Component({
  selector: "app-learning-object-detail",
  templateUrl: "./learning-object-detail.component.html",
  styles: [
    `
      @media screen and (max-width: 960px) {
        :host
          ::ng-deep
          .p-datatable.p-datatable-customers.rowexpand-table
          .p-datatable-tbody
          > tr
          > td:nth-child(6) {
          display: flex;
        }
      }
    `,
  ],
  styleUrls: ["./learning-object-detail.component.scss"],
  providers: [MessageService, ConfirmationService],
  standalone: false,
})
export class LearningObjectDetailComponent implements OnInit {
  @ViewChild("dt") table!: Table;

  public slug = "";
  public type = "";
  public learningobjectdetail: ObjectLearning | null = null;
  public autor: UserCreated | null = null;
  public index_url = "";
  public statusUpdate = false;

  /**
   * Perfil del autor en el administrador, el mismo que abre "Perfil" en
   * Docentes. `autor.id` es el id del usuario (antes se usaba como id de
   * docente en "OA cargados" y mostraba los OA de otra persona).
   */
  public get authorProfilePath(): string | null {
    return this.autor?.id ? buildManagedAdminProfilePath("teacher", this.autor.id, "approved") : null;
  }
  public readMore = true;
  public readonly findingsTemplate = FINDINGS_MESSAGE_TEMPLATE;
  public readonly deleteTemplate = DELETE_MESSAGE_TEMPLATE;
  public notifyDialogVisible = false;
  public deleteDialogVisible = false;
  public buttonMenuBoolean = false;
  public youNeedMenu = false;
  public spinner = false;

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly administratorService: AdministratorService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly learningobjectService: LearningObjectService,
    public readonly appMain: AdminComponent,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.slug = this.route.snapshot.params["slug"];
    this.type = this.route.snapshot.params["type"];
    this.breadcrumbService.setItems([
      {
        label: this.getSourceListLabel(),
        routerLink: [this.getSourceListRoute()],
        queryParams: this.getReturnQueryParams(),
      },
      { label: "Detalle" },
    ]);
  }

  ngOnInit(): void {
    void this.loadLearningObject();
  }

  public onClick(): void {
    this.readMore = !this.readMore;
  }

  /**
   * Confirma y aprueba el OA desde la vista de detalle.
   */
  public confirm2(event: Event): void {
    if (!this.learningobjectdetail?.id) {
      return;
    }

    this.confirmationService.confirm({
      key: "confirm2",
      target: event.target as EventTarget,
      message: "¿Está seguro que desea aprobar?",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await firstValueFrom(
            this.administratorService.updatePublicandPrivateLearningObject(
              this.learningobjectdetail!.id!,
              1
            )
          );
          this.messageService.add({
            severity: "info",
            summary: "Confirmed",
            detail: "Aprobado con éxito",
          });
          this.statusUpdate = true;
          this.refreshView();
        } catch {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo aprobar el objeto de aprendizaje.",
          });
        }
      },
    });
  }

  /**
   * Recupera el detalle del OA y el estado visual del visor integrado.
   */
  public async loadLearningObject(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.administratorService.getLearningObject(this.slug)
      );

      this.learningobjectdetail = response;
      this.autor = response.user_created || null;
      this.index_url = response.learning_object_file?.url ?? "";
      this.statusUpdate = Boolean(response.public);
      this.syncPreviewState();
      this.spinner = true;
    } catch {
      this.navigateToSourceList();
    } finally {
      this.refreshView();
    }
  }

  /** Abre el dialogo para eliminar el OA con el motivo para el docente. */
  public onDelete(): void {
    if (!this.learningobjectdetail?.id) {
      return;
    }
    this.deleteDialogVisible = true;
  }

  /** Elimina el OA; el backend envia el mensaje como motivo al docente. */
  public readonly deleteLearningObject = async (message: string): Promise<void> => {
    await firstValueFrom(
      this.learningobjectService.deleteObjestTeacherAdmin(this.learningobjectdetail!.id!, {
        message,
      })
    );
  };

  public onDeleted(): void {
    this.navigateToSourceList();
    Swal.fire({
      icon: "success",
      title: "Se ha eliminado el objeto de aprendizaje.",
      showConfirmButton: true,
    });
  }

  /** Abre el dialogo de hallazgos para el docente creador del OA. */
  public onNotificate(): void {
    if (!this.learningobjectdetail?.id) {
      return;
    }
    this.notifyDialogVisible = true;
  }

  public readonly sendNotification = async (message: string): Promise<void> => {
    await firstValueFrom(
      this.learningobjectService.notificationObjectTeacherAdmin(this.learningobjectdetail!.id!, {
        message,
      })
    );
  };

  public readonly formatNotificationError = (error: unknown): string =>
    this.getNotificationErrorMessage(error);

  public async onNotified(): Promise<void> {
    await Swal.fire({
      icon: "success",
      title: "Notificacion enviada",
      text: "El mensaje fue enviado correctamente al autor del objeto de aprendizaje.",
      confirmButtonText: "Aceptar",
      width: "min(32rem, calc(100vw - 2rem))",
      customClass: {
        popup: "admin-swal-popup",
        actions: "admin-swal-actions",
      },
    });
  }

  private getNotificationErrorMessage(error: unknown): string {
    const status = (error as { status?: number })?.status;
    const backendMessage = this.extractBackendErrorMessage(error);

    if (backendMessage) {
      return backendMessage;
    }

    if (status === 401) {
      return "Su sesion expiro o no es valida. Inicie sesion nuevamente.";
    }

    if (status === 403) {
      return "No tiene permisos para notificar este objeto de aprendizaje.";
    }

    if (status === 404) {
      return "El objeto de aprendizaje no existe o ya no esta disponible.";
    }

    return getHttpErrorMessage(error);
  }

  private extractBackendErrorMessage(error: unknown): string | null {
    const errorBody = (error as { error?: unknown })?.error;

    if (!errorBody || typeof errorBody !== "object") {
      return null;
    }

    const message = (errorBody as { message?: unknown }).message;

    if (Array.isArray(message) && message.length > 0) {
      return String(message[0]);
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    return null;
  }

  private syncPreviewState(): void {
    this.youNeedMenu = shouldDisplayLearningObjectMenu(this.learningobjectdetail);
  }

  private getSourceListLabel(): string {
    return this.type === "pending"
      ? "Objetos de aprendizaje por aprobar"
      : "Objetos de aprendizaje aprobados";
  }

  private getSourceListRoute(): string {
    return this.type === "pending"
      ? "/admin/learning-object/pending"
      : "/admin/learning-object/approved";
  }

  private getReturnQueryParams(): Params {
    return this.route.snapshot.queryParams || {};
  }

  private navigateToSourceList(): void {
    this.router.navigate([this.getSourceListRoute()], {
      queryParams: this.getReturnQueryParams(),
    });
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
