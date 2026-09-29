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
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom } from "rxjs";
import {
  ApiCursorPaginatedResponse,
  ApiMessageResponse,
  ManagedUserSummary,
} from "src/app/core/interfaces/api-contracts";
import { normalizeCollectionResponse } from "src/app/core/utils/backend-response.utils";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import {
  buildManagedAdminListBreadcrumb,
  buildManagedAdminProfilePath,
  getManagedAdminAvatarUrl,
  getManagedAdminRoles,
  isManagedExpertActive,
  isManagedTeacherActive,
} from "../../shared/admin-managed-user.utils";

/**
 * Gestiona las solicitudes pendientes de docentes, incluyendo aprobacion,
 * eliminacion y acceso al detalle del perfil solicitado.
 */
@Component({
  selector: "app-teacher-pending",
  templateUrl: "./teacher-pending.component.html",
  styleUrls: ["./teacher-pending.component.scss"],
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
export class TeacherPendingComponent implements OnInit {
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

  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService: AdministratorService,
    public appMain: AdminComponent,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      buildManagedAdminListBreadcrumb("teacher", "pending"),
    ]);
  }

  ngOnInit(): void {
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query) => {
        void this.loadPendingTeachers(1, query.trim());
      });

    void this.loadPendingTeachers();
  }

  /**
   * Carga una pagina del listado pendiente con el filtro actual.
   */
  public async loadPendingTeachers(
    page: number = this.currentPage,
    query: string = this.searchTerm.trim()
  ): Promise<void> {
    this.isLoading = true;
    this.refreshView();

    try {
      const response = await firstValueFrom(
        this.administratorService.getTeacherToAprove(page, query)
      );
      const normalizedResponse = normalizeCollectionResponse(
        response as ApiCursorPaginatedResponse<ManagedUserSummary>
      );

      if (
        page > 1 &&
        normalizedResponse.items.length === 0 &&
        normalizedResponse.hasPreviousPage
      ) {
        await this.loadPendingTeachers(page - 1);
        return;
      }

      this.currentPage = page;
      this.searchTerm = query;
      this.users = normalizedResponse.items;
      this.totalRecords = normalizedResponse.total;
      this.first = normalizedResponse.total === 0 ? 0 : (page - 1) * this.pageSize;
    } catch {
      this.users = [];
      this.totalRecords = 0;
      this.first = 0;
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar el listado de docentes pendientes",
      });
    } finally {
      this.isLoading = false;
      this.hasLoaded = true;
      this.refreshView();
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
    this.router.navigate([buildManagedAdminProfilePath("teacher", id, "pending")]);
  }

  /**
   * Confirma y aprueba la solicitud pendiente del rol indicado.
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
      message: "¿Está seguro que desea habilitar usuario?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        void this.updatePendingStatus(id, teacherStatus, expertStatus);
      },
    });
  }

  /**
   * Confirma y elimina la solicitud pendiente del docente.
   */
  public confirmDeleteUser(event: Event, userId: number): void {
    this.confirmationService.confirm({
      key: "deleteUserTeacher",
      target: event.target as EventTarget,
      message: "¿Está seguro que desea eliminar el usuario?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        void this.deletePendingTeacher(userId);
      },
    });
  }

  public async paginate(event: { page: number }): Promise<void> {
    await this.loadPendingTeachers(event.page + 1);
  }

  public getRoles(user: ManagedUserSummary): string[] {
    return getManagedAdminRoles(user, "pending");
  }

  public getAvatarUrl(user: ManagedUserSummary): string | null {
    return getManagedAdminAvatarUrl(user);
  }

  public canApproveTeacher(user: ManagedUserSummary): boolean {
    return Boolean(user.teacher) && !isManagedTeacherActive(user);
  }

  public canApproveExpert(user: ManagedUserSummary): boolean {
    return Boolean(user.collaboratingExpert) && !isManagedExpertActive(user);
  }

  private async updatePendingStatus(
    id: number,
    teacherStatus: number,
    expertStatus: number
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.administratorService.updateTeacherToAprove(id, teacherStatus, expertStatus)
      );
      this.messageService.add({
        severity: "info",
        summary: "Confirmed",
        detail: "Habilitado con éxito",
      });
      await this.loadPendingTeachers(this.currentPage);
    } catch {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo aprobar la solicitud del docente",
      });
    }
  }

  private async deletePendingTeacher(userId: number): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.administratorService.deleteUserTeacher(userId)
      );
      const wasDeleted = (response as ApiMessageResponse)?.code === 200;

      this.messageService.add({
        severity: wasDeleted ? "info" : "error",
        summary: wasDeleted ? "Confirmed" : "Error",
        detail: wasDeleted
          ? "Usuario eliminado con éxito"
          : "Error al eliminar un registro",
      });

      if (wasDeleted) {
        await this.loadPendingTeachers(this.currentPage);
      }
    } catch {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Error al eliminar un registro",
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
