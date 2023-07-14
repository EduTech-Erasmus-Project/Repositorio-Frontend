import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { ActivatedRoute, Router } from "@angular/router";
import { SettingsService } from "../../services/settings.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-email-domains-form",
  templateUrl: "./email-domains-form.component.html",
  styleUrls: ["./email-domains-form.component.scss"],
})
export class EmailDomainsFormComponent implements OnInit {
  public loader: boolean = false;
  public form: FormGroup;
  private _id?: number;

  public types: any[] = [
    { label: "ESTUDIANTE", value: "ESTUDIANTE" },
    { label: "DOCENTE", value: "DOCENTE" },
    { label: "EXPERTO", value: "EXPERTO" },
  ];

  public optionsRegister: any[] = [];
  public value_type: string = "";
  public valueSelected: string = "";
  public optionsResgister : any[]=[];

  constructor(
    private _fb: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Agregar",
        routerLink: ["/admin/config/domain/new"],
      },
    ]);

    let params = this.route.snapshot.params?.id;
    if (params === "new") {
      this._id = null;
    } else if (isNaN(params)) {
      this.router.navigate(["/admin/config/domain"]);
      return;
    }
    this._id = Number(params);
    this.route.queryParams.subscribe(params => {
      // Accede a los parámetros de consulta
      if(params['type']){
        this.valueSelected = params['type'];
        this.value_type = this.chageNameType(params['type']); 
      }else{
        this.router.navigate(['/admin/config/domain']);
      }
      
    });
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      domain: [null, Validators.required],
      type: [{value:this.value_type, disabled :true}, Validators.required],
      is_active: [true, Validators.required],
      option_register_email:[null, Validators.required]
    });

    if (this._id) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/domain/" + this._id],
        },
      ]);
      this.loadData();
    }

  this.loadOptionRegister();
  }


   

  /**
   * Funcion para cambiar el nombre del tipo
   * @param name 
   */
  private chageNameType(name: string) {
    switch (name) {
      case 'profesor':
        return 'TEACHER'
      case 'experto':
        return 'EXPERT'
      case 'estudiante':
        return 'STUDENT'
    }
  }

 
  public async loadData() {
    try {
      let resp:any = await this.settingsService.getDomain(this._id, this.value_type).toPromise();
      if(resp.data.length < 0) {
        this.back();
      }
      resp.data[0].option_register_email = resp.data[0].option_register_email.id
      this.form.patchValue(resp.data[0]);
    } catch (error: any) {
      this.back();
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }

  private async loadOptionRegister() {
    try {
      let optionRegex: any = await this.settingsService.getOptionRegister().toPromise();
      if (optionRegex.length > 0) {
        this.optionsRegister = optionRegex.map(res => {
          return {
            id: res.id,
            type_option: this.placeName(res.type_option)
          }
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
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


  public getErrorRequired(field: string) {
    return (
      this.form.get(field)?.hasError("required") &&
      this.form.get(field)?.touched
    );
  }

  public async onSave() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    try {
      this.loader = true;
      let data = this.form.getRawValue();
      if (this._id) {
        await this.update(data);
      } else {
        await this.create(data);
      }

      this.back();
    } catch (error) {
      this.loader = false;
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }

  private async update(data) {
    return await this.settingsService.updateDomain(this._id, data, this.value_type).toPromise();
  }

  private async create(data) {
    return await this.settingsService.createDomain(data).toPromise();
  }

  public back() {
    this.router.navigate(["/admin/config/domain"]);
  }
}
