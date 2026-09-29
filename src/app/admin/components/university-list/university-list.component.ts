import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewRef } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { Country } from "src/app/core/interfaces/country";
import { University } from "src/app/core/interfaces/university";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import {
  getActivationStatusLabel,
  getActivationStatusSeverity,
} from "../../shared/admin-status.utils";
import Swal from "sweetalert2";
import { getHttpErrorMessage } from "src/app/core/utils/http-error.utils";

@Component({
    selector: "app-university-list",
    templateUrl: "./university-list.component.html",
    styleUrls: ["./university-list.component.scss"],
    standalone: false
})
export class UniversityListComponent implements OnInit {
  @ViewChild("dt") table!: Table;

  public universities: Array<University & { country?: Country | null }> = [];
  public isLoading = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private messageService: MessageService,
    private addressService: AddressService,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Universidades",
        routerLink: ["/admin/config/university"],
      },
    ]);
  }

  public readonly getStatusLabel = getActivationStatusLabel;
  public readonly getStatusSeverity = getActivationStatusSeverity;

  ngOnInit(): void {
    void this.loadData();
  }

  /**
   * Carga las universidades para el listado administrativo.
   */
  public async loadData(): Promise<void> {
    this.isLoading = true;

    try {
      this.universities = await firstValueFrom(this.addressService.getAllUniversities());
    } catch (error: unknown) {
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
   * Elimina una universidad luego de confirmar la operacion.
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
      await firstValueFrom(this.addressService.deleteUniversity(id));
      await this.loadData();
      this.messageService.add({
        severity: "success",
        summary: "Eliminado",
        detail: "Universidad eliminada correctamente",
      });
      Swal.hideLoading();
    } catch (error: unknown) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: getHttpErrorMessage(error),
      });
      this.refreshView();
    }
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
