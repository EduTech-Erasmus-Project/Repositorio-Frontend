import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewRef,
  inject,
} from "@angular/core";
import { Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ConfirmationService, MessageService } from "primeng/api";
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom, map } from "rxjs";
import {
  ApiCursorPaginatedResponse,
  ManagedUserSummary,
} from "src/app/core/interfaces/api-contracts";
import { normalizeCollectionResponse } from "src/app/core/utils/backend-response.utils";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import {
  buildManagedAdminEvaluatedPath,
  buildManagedAdminListBreadcrumb,
  buildManagedAdminProfilePath,
  buildManagedAdminUploadPath,
  getManagedAdminAvatarUrl,
  getManagedAdminRoles,
  isManagedExpertActive,
  isManagedTeacherActive,
  isPageNotFoundError,
} from "../../shared/admin-managed-user.utils";

/**
 * Lista los docentes aprobados y permite administrar sus accesos secundarios
 * como deshabilitacion, detalle de perfil y navegacion hacia sus OAs.
 */
@Component({
  selector: "app-teacher-approved",
  templateUrl: "./teacher-approved.component.html",
  styleUrls: ["./teacher-approved.component.scss"],
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
export class TeacherApprovedComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  public users: ManagedUserSummary[] = [];
  public selectedUsers: ManagedUserSummary[] = [];
  public isLoading = true;
  public hasLoaded = false;
  public totalRecords = 0;
  public pageSize = 10;
  public currentPage = 1;
  public first = 0;
  public searchTerm = "";
  /** Búsqueda (sin espacios extremos) que corresponde a la tabla mostrada. */
  private appliedQuery = "";
  /** Solo la última carga actualiza la tabla; las respuestas viejas se descartan. */
  private latestRequest = 0;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    public appMain: AdminComponent,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      buildManagedAdminListBreadcrumb("teacher", "approved"),
    ]);
  }

  ngOnInit(): void {
    this.searchInput$
      .pipe(
        map((query) => query.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query) => {
        void this.loadApprovedTeachers(1, query);
      });

    void this.loadApprovedTeachers();
  }

  /**
   * Carga una pagina del listado aprobado usando el filtro actual.
   */
  public async loadApprovedTeachers(
    page: number = this.currentPage,
    query: string = this.appliedQuery
  ): Promise<void> {
    const request = ++this.latestRequest;
    this.isLoading = true;
    this.refreshView();

    try {
      const response = await firstValueFrom(
        this.administratorService.getTeacherAproved(page, query)
      );
      if (request !== this.latestRequest) {
        return;
      }
      const normalizedResponse = normalizeCollectionResponse(
        response as ApiCursorPaginatedResponse<ManagedUserSummary>
      );

      if (
        page > 1 &&
        normalizedResponse.items.length === 0 &&
        normalizedResponse.hasPreviousPage
      ) {
        await this.loadApprovedTeachers(page - 1, query);
        return;
      }

      this.currentPage = page;
      // `searchTerm` no se toca: es lo que el usuario sigue escribiendo.
      this.appliedQuery = query;
      this.users = normalizedResponse.items;
      this.totalRecords = normalizedResponse.total;
      this.first = normalizedResponse.total === 0 ? 0 : (page - 1) * this.pageSize;
    } catch (error) {
      if (request !== this.latestRequest) {
        return;
      }
      if (page > 1 && isPageNotFoundError(error)) {
        await this.loadApprovedTeachers(page - 1, query);
        return;
      }
      this.users = [];
      this.totalRecords = 0;
      this.first = 0;
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar el listado de docentes aprobados",
      });
    } finally {
      if (request === this.latestRequest) {
        this.isLoading = false;
        this.hasLoaded = true;
        this.refreshView();
      }
    }
  }

  public onSearchInput(value: string): void {
    this.searchTerm = value;
    this.searchInput$.next(value);
  }

  public clearSearch(): void {
    if (!this.searchTerm) {
      return;
    }

    this.searchTerm = "";
    this.searchInput$.next("");
  }

  public openProfile(id: number): void {
    this.router.navigate([buildManagedAdminProfilePath("teacher", id, "approved")]);
  }

  public openEvaluatedLearningObjects(id: number): void {
    this.router.navigate([buildManagedAdminEvaluatedPath("teacher", id)]);
  }

  public openUploadedLearningObjects(id: number): void {
    this.router.navigate([buildManagedAdminUploadPath(id)]);
  }

  /**
   * Confirma y actualiza el estado del usuario aprobado segun el rol elegido.
   */
  public confirmStatusChange(
    event: Event,
    id: number,
    teacherStatus: number,
    expertStatus: number
  ): void {
    this.confirmationService.confirm({
      key: "confirm2",
      target: event.target as EventTarget,
      message: "¿Está seguro que desea deshabilitar usuario?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        void this.updateApprovalStatus(id, teacherStatus, expertStatus);
      },
    });
  }

  public async paginate(event: { page: number; first: number }): Promise<void> {
    // `first` sigue al paginador para que una recuperación de página sí lo mueva.
    this.first = event.first;
    await this.loadApprovedTeachers(event.page + 1);
  }

  public getRoles(user: ManagedUserSummary): string[] {
    return getManagedAdminRoles(user, "approved");
  }

  public getAvatarUrl(user: ManagedUserSummary): string | null {
    return getManagedAdminAvatarUrl(user);
  }

  public hasTeacherRole(user: ManagedUserSummary): boolean {
    return Boolean(user.teacher);
  }

  public hasExpertRole(user: ManagedUserSummary): boolean {
    return Boolean(user.collaboratingExpert);
  }

  public canDisableTeacher(user: ManagedUserSummary): boolean {
    return this.hasTeacherRole(user) && isManagedTeacherActive(user);
  }

  public canDisableExpert(user: ManagedUserSummary): boolean {
    return this.hasExpertRole(user) && isManagedExpertActive(user);
  }

  private async updateApprovalStatus(
    id: number,
    teacherStatus: number,
    expertStatus: number
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.administratorService.updateTeacherAproved(id, teacherStatus, expertStatus)
      );
      this.messageService.add({
        severity: "info",
        summary: "Confirmed",
        detail: "Deshabilitado con éxito",
      });
      await this.loadApprovedTeachers(this.currentPage);
    } catch {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el estado del docente",
      });
    }
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
