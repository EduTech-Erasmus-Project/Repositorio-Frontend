import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { ActivatedRoute, Router } from "@angular/router";
import { AddressService } from "../../services/address.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-provinces-form",
  templateUrl: "./provinces-form.component.html",
  styleUrls: ["./provinces-form.component.scss"],
})
export class ProvincesFormComponent implements OnInit {
  public loader: boolean = false;
  public form: FormGroup;
  private _id?: number;

  public countries?: any[];

  constructor(
    private _fb: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private route: ActivatedRoute,
    private router: Router,
    private addressService: AddressService
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Agregar",
        routerLink: ["/admin/config/province/new"],
      },
    ]);

    let params = this.route.snapshot.params?.id;
    if (params === "new") {
      this._id = null;
    } else if (isNaN(params)) {
      //this.router.navigate(["/admin/config/province"]);
      this.back();
      return;
    }
    this._id = Number(params);
  }

  ngOnInit(): void {
    
    this.form = this._fb.group({
      name: [null, Validators.required],
      country: [null, Validators.required],
      is_active: [true, Validators.required],
    });
    
    this.loadData();
    if (this._id) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/province/" + this._id],
        },
      ]);
      this.loadById();
    }
  }

  private async loadData() {
    try {
      let resp: any = await this.addressService
        .getCountriesActive()
        .toPromise();
      this.countries = resp;
    } catch (error: any) {
      this.back();
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
    }
  }

  private async loadById() {
    try {
      let resp = await this.addressService.getProvinceById(this._id).toPromise();
      this.form.patchValue(resp);
    } catch (error: any) {
      this.back();
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.error?.message || error.message,
      });
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
      let data = {
        ...this.form.value,
        name: this.form.value.name.toUpperCase(),
      };

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
    return await this.addressService.updateProvince(this._id, data).toPromise();
  }

  private async create(data) {
    return await this.addressService.createProvince(data).toPromise();
  }

  public back() {
    this.router.navigate(["/admin/config/province"]);
  }
}
