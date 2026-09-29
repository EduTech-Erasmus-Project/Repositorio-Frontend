import { ChangeDetectorRef, Component, DestroyRef, OnInit, ViewChild, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ConfirmationService, MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { ManagedUserSummary } from "src/app/core/interfaces/api-contracts";
import { AdministratorService } from "src/app/services/administrator.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { UserService } from "../../services/user.service";

@Component({
  selector: "app-administrator-user-list",
  templateUrl: "./administrator-user-list.component.html",
  styleUrls: ["./administrator-user-list.component.scss"],
  styles: [`
  @media screen and (max-width: 960px) {
      :host ::ng-deep .p-datatable.p-datatable-customers.rowexpand-table .p-datatable-tbody > tr > td:nth-child(6) {
          display: flex;
      }
  }

`],
  providers: [MessageService, ConfirmationService],
  standalone: false,
})
/**
 * Tabla de administradores gestionados por el modulo de superusuario.
 * Permite consultar el estado actual del perfil y habilitar o deshabilitar
 * cuentas sin salir del listado.
 */
export class AdministratorUserListComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public administratorUsers: ManagedUserSummary[] = [];
  public isReady = false;
  public selectedUsers: ManagedUserSummary[] = [];

  @ViewChild("dt") table: Table;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private userServices: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private administratorService: AdministratorService,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      { label: "Listar usuario administrador" },
    ]);
  }

  ngOnInit(): void {
    this.loadAdministrators();
  }

  /**
   * Recupera la base completa de administradores usada por la tabla.
   */
  loadAdministrators(): void {
    this.isReady = false;

    this.userServices.listAdministratorUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: ManagedUserSummary[]) => {
        this.administratorUsers = resp || [];
        this.isReady = true;
        this.cdr.detectChanges();
      });
  }

  disable(event: Event, id: number): void {
    this.confirmationService.confirm({
      key: "confirm2",
      target: event.target as EventTarget,
      message: "¿Está seguro que desea deshabilitar usuario?",
      icon: "pi pi-exclamation-triangle",
      accept: () => this.updateAdministratorStatus(id, 0, "Deshabilitado con exito"),
    });
  }

  enable(event: Event, id: number): void {
    this.confirmationService.confirm({
      key: "confirm1",
      target: event.target as EventTarget,
      message: "¿Está seguro que desea habilitar usuario?",
      icon: "pi pi-exclamation-triangle",
      accept: () => this.updateAdministratorStatus(id, 1, "Habilitado con exito"),
    });
  }

  isAdministratorActive(user: ManagedUserSummary): boolean {
    return !!(user?.administrator?.administrator_is_active ?? user?.administrator?.["is_active"]);
  }

  private updateAdministratorStatus(id: number, status: number, successMessage: string): void {
    this.administratorService.updateAdministratorUser(id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.messageService.add({
          severity: "info",
          summary: "Confirmed",
          detail: successMessage,
        });
        setTimeout(() => {
          this.loadAdministrators();
        }, 600);
      });
  }
}
