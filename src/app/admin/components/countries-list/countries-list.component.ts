import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-countries-list",
  templateUrl: "./countries-list.component.html",
  styleUrls: ["./countries-list.component.scss"],
})
export class CountriesListComponent implements OnInit {
  @ViewChild("dt") table: Table;

  public countries: any[];
  public isLoading: boolean = false;
  
  constructor(
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private messageService: MessageService,
    private router: Router,
    private addressService: AddressService
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Paises",
        routerLink: ["/admin/config/country"],
      },
    ]);
  }

  ngOnInit(): void {
    this.loadData();
  }

  public async loadData() {
    try {
      this.isLoading = true;
      let resp: any = await this.addressService.getAllCountries().toPromise();
      this.countries = resp;
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }

  public async onDelete(id: number) {
    Swal.fire({
      title: "Estas seguro de eliminar?",
      text: "Se eliminara el registro y todos sus registros que dependan de este!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar!",
      cancelButtonText: "No, Cancelar!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.showLoading();
          let resp = await this.addressService.deleteCountry(id).toPromise();
          this.loadData();
          this.messageService.add({
            severity: "success",
            summary: "Eliminado",
            detail: "Pais eliminado correctamente",
          });
          Swal.hideLoading();
        } catch (error: any) {
          console.log(error);
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error.error?.message || error.message,
          });
        }
      }
    });
  }
}
