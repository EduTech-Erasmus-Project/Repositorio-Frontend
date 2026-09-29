import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewRef } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { Country } from "src/app/core/interfaces/country";
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
    selector: "app-countries-list",
    templateUrl: "./countries-list.component.html",
    styleUrls: ["./countries-list.component.scss"],
    standalone: false
})
export class CountriesListComponent implements OnInit {
  @ViewChild("dt") table!: Table;

  public countries: Country[] = [];
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
        label: "Paises",
        routerLink: ["/admin/config/country"],
      },
    ]);
  }

  public readonly getStatusLabel = getActivationStatusLabel;
  public readonly getStatusSeverity = getActivationStatusSeverity;

  ngOnInit(): void {
    void this.loadData();
  }

  /**
   * Carga el catalogo completo de paises para administracion.
   */
  public async loadData(): Promise<void> {
    this.isLoading = true;

    try {
      this.countries = await firstValueFrom(this.addressService.getAllCountries());
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
   * Solicita confirmacion y elimina el pais seleccionado.
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
      await firstValueFrom(this.addressService.deleteCountry(id));
      await this.loadData();
      this.messageService.add({
        severity: "success",
        summary: "Eliminado",
        detail: "Pais eliminado correctamente",
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
