import { ChangeDetectorRef, Component, DestroyRef, OnInit, ViewChild, ViewRef, inject } from '@angular/core';
import { AdministratorService } from 'src/app/services/administrator.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { AdminComponent } from '../../admin.component';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ApiCursorPaginatedResponse,
  ManagedUserSummary,
} from 'src/app/core/interfaces/api-contracts';
import { normalizeCollectionResponse } from 'src/app/core/utils/backend-response.utils';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import Swal from 'sweetalert2';

/**
 * Lista estudiantes desde el panel administrativo con busqueda remota y
 * paginacion server-side sobre el endpoint de gestion.
 */
@Component({
    selector: 'app-student',
    templateUrl: './student.component.html',
    styleUrls: ['./student.component.scss'],
    styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }

`],
    standalone: false
})

export class StudentComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();
  @ViewChild('dt') table?: Table;
  @ViewChild('paginator', { static: true }) paginator?: Paginator;

  listStudent: ManagedUserSummary[] = [];
  isLoading = false;
  hasLoaded = false;
  public totalRecords = 0;
  public pageSize = 10;
  public currentPage = 1;
  public first = 0;
  public searchTerm = "";

  constructor(
    private breadcrumbService: BreadcrumbService,
    private administratorService:AdministratorService,
    public appMain: AdminComponent,
    private cdr: ChangeDetectorRef,
  ) { 
    this.breadcrumbService.setItems([
      { label: 'Estudiantes' },
  ]);
  }

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.searchTerm = query;
        this.getStudentList(1);
      });

    void this.getStudentList();
  }

  /**
   * Carga una pagina de estudiantes y sincroniza el estado del paginador.
   */
  getStudentList(page: number = this.currentPage): void {
    this.isLoading = true;

    this.administratorService
      .getStudentList(page, this.searchTerm)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: ApiCursorPaginatedResponse<ManagedUserSummary>) => {
          const normalizedResponse = normalizeCollectionResponse(resp);

          if (page > 1 && normalizedResponse.items.length === 0 && normalizedResponse.hasPreviousPage) {
            void this.getStudentList(page - 1);
            return;
          }

          this.currentPage = page;
          this.listStudent = normalizedResponse.items;
          this.totalRecords = normalizedResponse.total;

          if (page === 1 && normalizedResponse.items.length > 0) {
            this.pageSize = normalizedResponse.items.length;
          }

          this.first = normalizedResponse.total === 0 ? 0 : (this.currentPage - 1) * this.pageSize;
          this.hasLoaded = true;
          this.refreshView();
        },
        error: (error: unknown) => {
          this.listStudent = [];
          this.totalRecords = 0;
          this.first = 0;
          this.hasLoaded = true;
          this.isLoading = false;
          this.showRequestError(error, 'No se pudo cargar la lista de estudiantes.');
          this.refreshView();
        },
        complete: () => {
          this.isLoading = false;
          this.refreshView();
        }
      });
  }

  onSearchInput(value: string): void {
    this.searchInput$.next(value.trim());
  }

  paginate(event: { page: number }): void {
    void this.getStudentList(event.page + 1);
  }

  public getAvatar(student: ManagedUserSummary): string {
    return student.image_url || student.image || 'assets/img/usercard.png';
  }

  public getPreferenceLabels(student: ManagedUserSummary): string[] {
    return student.student?.preferences?.map((preference) => preference.description || '').filter(Boolean) || [];
  }

  private showRequestError(error: unknown, fallback: string): void {
    const message =
      typeof error === 'object' && error !== null && 'error' in error
        ? ((error as { error?: { message?: string } }).error?.message || fallback)
        : fallback;

    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
    });
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
