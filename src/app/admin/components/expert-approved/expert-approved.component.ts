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
} from "../../shared/admin-managed-user.utils";

/**
 * Lista los expertos aprobados y permite administrar sus roles activos y la
 * navegacion hacia el detalle de perfil y actividades asociadas.
 */
@Component({
  selector: "app-expert-approved",
  templateUrl: "./expert-approved.component.html",
  styleUrls: ["./expert-approved.component.scss"],
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
export class ExpertApprovedComponent implements OnInit {
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
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      buildManagedAdminListBreadcrumb("expert", "approved"),
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
        void this.loadApprovedExperts(1, query.trim());
      });

    void this.loadApprovedExperts();
  }

  /**
   * Carga una pagina del listado aprobado usando el filtro actual.
   */
  public async loadApprovedExperts(
    page: number = this.currentPage,
    query: string = this.searchTerm.trim()
  ): Promise<void> {
    this.isLoading = true;
    this.refreshView();

    try {
      const response = await firstValueFrom(
        this.administratorService.getExpertAproved(page, query)
      );
      const normalizedResponse = normalizeCollectionResponse(
        response as ApiCursorPaginatedResponse<ManagedUserSummary>
      );

      if (
        page > 1 &&
        normalizedResponse.items.length === 0 &&
        normalizedResponse.hasPreviousPage
      ) {
        await this.loadApprovedExperts(page - 1);
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
        detail: "No se pudo cargar el listado de expertos aprobados",
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
    this.router.navigate([buildManagedAdminProfilePath("expert", id, "approved")]);
  }

  public openEvaluatedLearningObjects(id: number): void {
    this.router.navigate([buildManagedAdminEvaluatedPath("expert", id)]);
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

  public async paginate(event: { page: number }): Promise<void> {
    await this.loadApprovedExperts(event.page + 1);
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
        this.administratorService.updateCollaboratingExpertAproved(
          id,
          teacherStatus,
          expertStatus
        )
      );
      this.messageService.add({
        severity: "info",
        summary: "Confirmed",
        detail: "Deshabilitado con exito",
      });
      await this.loadApprovedExperts(this.currentPage);
    } catch {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "No se pudo actualizar el estado del experto",
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
