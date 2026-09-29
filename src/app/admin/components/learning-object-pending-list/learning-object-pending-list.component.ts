import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewRef,
} from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Table } from "primeng/table";
import { firstValueFrom } from "rxjs";
import * as moment from "moment";
import Swal from "sweetalert2";
import { getHttpErrorMessage } from "src/app/core/utils/http-error.utils";
import { normalizeMultilineMessage } from "src/app/core/utils/multiline-message.utils";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { normalizeCollectionResponse } from "src/app/core/utils/backend-response.utils";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { LearningObjects } from "../../models/evaluation.models";

/**
 * Administra el listado de objetos pendientes de aprobacion, incluyendo
 * filtros remotos, aprobacion, eliminacion y acceso al detalle del OA.
 */
@Component({
  selector: "app-learning-object-pending-list",
  templateUrl: "./learning-object-pending-list.component.html",
  styleUrls: ["./learning-object-pending-list.component.scss"],
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
  providers: [MessageService, ConfirmationService],
  standalone: false,
})
export class LearningObjectPendingListComponent implements OnInit {
  @ViewChild("dt") table!: Table;

  public learningobjectList: ObjectLearning[] = [];
  public learningobjectsSelected: LearningObjects[] = [];
  public isLoading = true;
  public hasLoaded = false;
  public totalRecords = 0;
  public pageSize = 10;
  public first = 0;
  public form: FormGroup;

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly administratorService: AdministratorService,
    public readonly appMain: AdminComponent,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly learningobjectService: LearningObjectService,
    private readonly fb: FormBuilder,
    private readonly activeRoute: ActivatedRoute,
    private readonly angularRouter: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Objetos de aprendizaje por aprobar",
        routerLink: ["/admin/learning-object/pending"],
      },
    ]);

    this.form = this.fb.group({
      created_init: [this.resolveDateValue(this.activeRoute.snapshot.queryParams?.created_init)],
      created_end: [this.resolveDateValue(this.activeRoute.snapshot.queryParams?.created_end)],
      general_title: [this.activeRoute.snapshot.queryParams?.general_title || null],
      page: [this.resolvePageValue(this.activeRoute.snapshot.queryParams?.page)],
    });
  }

  ngOnInit(): void {
    void this.loadLearningObjects();
  }

  /**
   * Carga el listado pendiente aplicando los filtros actuales y sincroniza la
   * paginacion remota con la URL del modulo.
   */
  public async loadLearningObjects(resetPage = false): Promise<void> {
    await this.loadLearningObjectsPage(resetPage, true);
  }

  private async loadLearningObjectsPage(
    resetPage = false,
    canRecoverInvalidPage = true
  ): Promise<void> {
    if (resetPage) {
      this.form.controls["page"].setValue(1);
    }

    this.isLoading = true;
    this.refreshView();

    try {
      const response = await firstValueFrom(
        this.administratorService.listLearningObject(0, this.buildFilterParams())
      );
      const normalizedResponse = normalizeCollectionResponse(response);
      const requestedPage = this.getCurrentPage();
      const maxPage = this.getMaxPage(normalizedResponse.total);

      if (normalizedResponse.total > 0 && requestedPage > maxPage && canRecoverInvalidPage) {
        this.form.controls["page"].setValue(maxPage);
        await this.loadLearningObjectsPage(false, false);
        return;
      }

      this.learningobjectList = normalizedResponse.items as ObjectLearning[];
      this.totalRecords = normalizedResponse.total;
      this.first = this.totalRecords === 0 ? 0 : (requestedPage - 1) * this.pageSize;
    } catch (error: unknown) {
      if (canRecoverInvalidPage && this.getCurrentPage() > 1 && this.isPaginationOutOfRangeError(error)) {
        this.form.controls["page"].setValue(1);
        await this.loadLearningObjectsPage(false, false);
        return;
      }

      this.learningobjectList = [];
      this.totalRecords = 0;
      this.first = 0;
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar el listado de objetos pendientes.",
      });
    } finally {
      this.isLoading = false;
      this.hasLoaded = true;
      this.refreshView();
    }

    await this.updateUrl();
    this.restoreScrollPosition();
  }

  /**
   * Confirma y aprueba un OA pendiente, rehidratando luego el listado remoto.
   */
  public confirm2(event: Event, oaId: number): void {
    this.confirmationService.confirm({
      key: "confirm2",
      target: event.target as EventTarget,
      message: "¿Está seguro que desea aprobar?",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await firstValueFrom(
            this.administratorService.updatePublicandPrivateLearningObject(oaId, 1)
          );
          this.messageService.add({
            severity: "info",
            summary: "Confirmed",
            detail: "Aprobado con éxito",
          });
          await this.loadLearningObjects();
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

  public getDetail(slug: string): void {
    this.saveScrollPosition();
    this.router.navigate([`/admin/learning-object/pending/detail/${slug}`], {
      queryParams: this.getCurrentQueryParams(),
    });
  }

  /**
   * Elimina un OA pendiente y usa el mensaje ingresado como motivo visible
   * para el backend administrativo.
   */
  public deleteLearningObject(oaId: number): void {
    Swal.fire({
      title: "Escriba la razón de la eliminación del objeto de aprendizaje.",
      input: "textarea",
      width: "min(42rem, calc(100vw - 2rem))",
      inputAttributes: {
        autocapitalize: "off",
        rows: "9",
        maxlength: "3000",
        "aria-label": "Razón de eliminación del objeto de aprendizaje",
      },
      customClass: {
        popup: "admin-swal-popup admin-swal-popup--textarea",
        input: "admin-swal-textarea",
        actions: "admin-swal-actions",
      },
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      showLoaderOnConfirm: true,
      preConfirm: async (message) => {
        const rawMessage = normalizeMultilineMessage(message);

        if (!rawMessage.trim()) {
          Swal.showValidationMessage(
            "Error: No se ha proporcionado un mensaje para el autor."
          );
          return;
        }

        const data = { message: rawMessage };

        try {
          await firstValueFrom(this.learningobjectService.deleteObjestTeacherAdmin(oaId, data));
          await this.loadLearningObjects();
          Swal.fire({
            icon: "success",
            title: "Se ha eliminado el objeto de aprendizaje.",
            showConfirmButton: true,
            width: "min(32rem, calc(100vw - 2rem))",
            customClass: {
              popup: "admin-swal-popup",
              actions: "admin-swal-actions",
            },
          });
        } catch (error: unknown) {
          Swal.showValidationMessage(`Error: ${getHttpErrorMessage(error)}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  }

  public async paginate(event: { page: number }): Promise<void> {
    this.form.controls["page"].setValue(event.page + 1);
    await this.loadLearningObjects();
  }

  private updateUrl(): Promise<boolean> {
    const urlTree = this.angularRouter.parseUrl(this.angularRouter.url);
    const createdInit = this.form.get("created_init")?.value;
    const createdEnd = this.form.get("created_end")?.value;
    const generalTitle = this.form.get("general_title")?.value;

    if (createdInit) {
      urlTree.queryParams["created_init"] = moment(createdInit).format("YYYY-MM-DD");
    } else {
      delete urlTree.queryParams["created_init"];
    }

    if (createdEnd) {
      urlTree.queryParams["created_end"] = moment(createdEnd).format("YYYY-MM-DD");
    } else {
      delete urlTree.queryParams["created_end"];
    }

    if (generalTitle) {
      urlTree.queryParams["general_title"] = generalTitle;
    } else {
      delete urlTree.queryParams["general_title"];
    }

    if (this.getCurrentPage() > 1) {
      urlTree.queryParams["page"] = this.getCurrentPage();
    } else {
      delete urlTree.queryParams["page"];
    }

    return this.angularRouter.navigateByUrl(urlTree);
  }

  private resolveDateValue(value: string | Date | null | undefined): Date | null {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "string") {
      const parsedDate = moment(value, "YYYY-MM-DD", true);
      if (parsedDate.isValid()) {
        return parsedDate.toDate();
      }
    }

    return null;
  }

  private buildFilterParams(): Record<string, string | number> {
    const data: Record<string, string | number> = {
      general_title__icontains: this.form.value?.general_title || "",
      page: this.getCurrentPage(),
    };

    if (this.form.value?.created_init) {
      data["created_init"] = moment(this.form.value.created_init).format("YYYY-MM-DD");
    }

    if (this.form.value?.created_end) {
      data["created_end"] = moment(this.form.value.created_end).add(1, "days").format("YYYY-MM-DD");
    }

    return data;
  }

  private getCurrentPage(): number {
    return this.resolvePageValue(this.form.get("page")?.value);
  }

  private resolvePageValue(value: unknown): number {
    const page = Number(value || 1);
    return Number.isInteger(page) && page > 0 ? page : 1;
  }

  private getMaxPage(totalRecords: number): number {
    return Math.max(1, Math.ceil(totalRecords / this.pageSize));
  }

  private isPaginationOutOfRangeError(error: unknown): boolean {
    const errorRecord = error as {
      status?: number;
      message?: string;
      error?: {
        detail?: string;
        message?: string;
      };
    };
    const status = Number(errorRecord?.status);

    if (status !== 400 && status !== 404) {
      return false;
    }

    const message = [
      errorRecord?.error?.detail,
      errorRecord?.error?.message,
      errorRecord?.message,
    ].filter(Boolean).join(" ").toLowerCase();

    return message.includes("page") || message.includes("pagina") || message.includes("página");
  }

  private getCurrentQueryParams(): Params {
    return this.angularRouter.parseUrl(this.angularRouter.url).queryParams;
  }

  private getScrollStorageKey(): string {
    const urlTree = this.angularRouter.parseUrl(this.angularRouter.url);
    return `admin:learning-object:pending:scroll:${urlTree.toString()}`;
  }

  private saveScrollPosition(): void {
    sessionStorage.setItem(this.getScrollStorageKey(), String(window.scrollY || 0));
  }

  private restoreScrollPosition(): void {
    const key = this.getScrollStorageKey();
    const savedPositionRaw = sessionStorage.getItem(key);

    if (savedPositionRaw === null) {
      return;
    }

    const savedPosition = Number(savedPositionRaw);

    sessionStorage.removeItem(key);

    if (!Number.isFinite(savedPosition)) {
      return;
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: savedPosition });
    });
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
