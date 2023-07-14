import { Component, OnInit, ViewChild } from "@angular/core";
import { Table } from "primeng/table";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { MessageService } from "primeng/api";
import { NavigationExtras, Router } from "@angular/router";
import { SettingsService } from "../../services/settings.service";
import Swal from "sweetalert2";
import { TypeUserOption } from "src/app/core/interfaces/TypeUserOption";

@Component({
  selector: "app-email-domains-list",
  templateUrl: "./email-domains-list.component.html",
  styleUrls: ["./email-domains-list.component.scss"],
})
export class EmailDomainsListComponent implements OnInit {
  @ViewChild("dt") table: Table;

  public domains: any[];
  public isLoading: boolean = false;
  public type_option_register_name: number;
  public optionsResgister: any[] = [];
  public typeOptionRegisterArray: any[] = [];

  public selectedValue: string = 'profesor';
  public opntionValueSelected: string = "TODOS";
  private id_option_register: number = 0;
  public typeReference: number;
  public typeReference_aux_boolean: boolean = false;
  constructor(
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private messageService: MessageService,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Dominios",
        routerLink: ["/admin/config/domain"],
      },
    ]);
  }

  ngOnInit(): void {

    this.loadDataOptionRegister();
    this.loadDataTypeUserOptionRegister();
  }

  /**
   * Funcion para cargar los datos de relaciones de registros entr las tablas
   * @method loadDataTypeUserOptionRegister
   */
  public async loadDataTypeUserOptionRegister() {
    try {
      let typeUserOption: any = await this.settingsService.getTypeUserOptionRegister().toPromise();
      if (typeUserOption.length > 0) {
        if (this.selectedValue == "profesor") {
          this.typeOptionRegisterArray = typeUserOption;
          let typeRolOption = typeUserOption.filter(res => res.description == "TEACHER")
          this.type_option_register_name = typeRolOption[0].option_register;
          this.typeReference = this.type_option_register_name;
        } else if (this.selectedValue == "experto") {
          this.typeOptionRegisterArray = typeUserOption;
          let typeRolOption = typeUserOption.filter(res => res.description == "EXPERT")
          this.type_option_register_name = typeRolOption[0].option_register;
          this.typeReference = this.type_option_register_name;
        } else if (this.selectedValue == "estudiante") {
          this.typeOptionRegisterArray = typeUserOption;
          let typeRolOption = typeUserOption.filter(res => res.description == "STUDENT")
          this.type_option_register_name = typeRolOption[0].option_register;
          this.typeReference = this.type_option_register_name;
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }


  /**
   * Tipo de opcion de registro para 
   * los correos 
   * @method loadDataOptionRegister
   */
  private async loadDataOptionRegister() {
    try {
      let optionRegister: any = await this.settingsService.getOptionRegister().toPromise();
      if (optionRegister.length > 0) {
        this.optionsResgister = optionRegister.map(res => {
          return {
            id: res.id,
            type_option: this.placeName(res.type_option)
          }
        });
        this.loadData('profesor');
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }

  /**
   * Funcion para cargar los datos
   * @method loadData
   */
  public async loadData(name_rol: string) {
    try {
      //this.selectedValue = name_rol;
      this.isLoading = true;
      if (name_rol == 'profesor') {
        let optionRegisterObject = this.optionsResgister.filter(res => res.type_option == this.opntionValueSelected)
        this.id_option_register = optionRegisterObject[0].id;
        let resp = await this.settingsService.getDomainsTeacher(this.id_option_register).toPromise();
        this.assignantData(resp);
      }
      if (name_rol == 'experto') {
        let optionRegisterObject = this.optionsResgister.filter(res => res.type_option == this.opntionValueSelected)
        this.id_option_register = optionRegisterObject[0].id;
        let resp = await this.settingsService.getDomainExpert(this.id_option_register).toPromise();
        this.assignantData(resp);
      }
      if (name_rol == 'estudiante') {
        let optionRegisterObject = this.optionsResgister.filter(res => res.type_option == this.opntionValueSelected)
        this.id_option_register = optionRegisterObject[0].id;
        let resp = await this.settingsService.getDomainStudent(this.id_option_register).toPromise();
        this.assignantData(resp);
      }
    } catch (error: any) {
      this.isLoading = false;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }

  /**
   * Funcion para cargar asignar los datos de 
   * cada consulta
   * @method assignantData
   */
  private assignantData(resp) {
    this.domains = resp.data.map(data => {
      return {
        type_option: this.placeName(data.option_register_email.type_option),
        option_id: data.option_register_email.id,
        domain: data.domain,
        is_active: data.is_active,
        id:data.id      }
    });

    // if(this.domains.length > 0) {
    //   this.type_option_register_name = this.domains[0].type_option;
    // }


    this.isLoading = false;
  }
  private placeName(name: string) {
    switch (name) {
      case "ALL":
        return "TODOS";
      case "ONLY":
        return "SOLO";
      case "EXCEPT":
        return "EXCEPTO";
    }
  }

  private placeNameRevert(name: string) {
    switch (name) {
      case "TODOS":
        return "ALL";
      case "SOLO":
        return "ONLY";
      case "EXCEPTO":
        return "EXCEPT";
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
          let resp = await this.settingsService.deleteDomain(id).toPromise();
          this.loadData(this.selectedValue);
          this.messageService.add({
            severity: "success",
            summary: "Eliminado",
            detail: "Dominio eliminado correctamente",
          });
          Swal.hideLoading();
        } catch (error: any) {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error.error?.message || error.message,
          });
        }
      }
    });
  }

  /**
   * funcion para en envio de dominios al momento de crear cada unos de los dominios 
   * @method sendParamsCreateEmailDomain
   */
  sendParamsCreateEmailDomain() {
    this.router.navigate(['/admin/config/domain/new'], { queryParams: { type: this.selectedValue } })
  }

  sendParamsEditEmailDomain(id:number) {
    this.router.navigate(['/admin/config/domain/'+id], { queryParams: { type: this.selectedValue } })
  }

  public async updateRelationTypeUserOption() {
    let data: any;
    let id = 0;
    if (this.selectedValue == "profesor") {
      data = this.typeOptionRegisterArray.filter(res => res.description === "TEACHER")[0];
      id = data.id;
      data.option_register = this.type_option_register_name
    }else if (this.selectedValue == "experto") {
      data = this.typeOptionRegisterArray.filter(res => res.description === "EXPERT")[0];
      id = data.id;
      data.option_register = this.type_option_register_name
    }else if (this.selectedValue == "estudiante") {
      data = this.typeOptionRegisterArray.filter(res => res.description === "STUDENT")[0];
      id = data.id;
      data.option_register = this.type_option_register_name
    }
    try {
      let updateType = await this.settingsService.updateTypeUserOptionRegister(data, id).toPromise();
      this.messageService.add({
        severity: "success",
        summary: "Modificado",
        detail: "Tipo de registro modificado correctamente",
      })
      this.typeReference_aux_boolean = false;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }

  }

  public changeNameOption() {
    if (this.type_option_register_name != this.typeReference) {
      this.typeReference = this.type_option_register_name;
      this.typeReference_aux_boolean = true;
    } else {
      this.typeReference_aux_boolean = false;
    }
  }
}
