import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AdminComponent } from "../../admin.component";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AddressService } from "../../services/address.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-countries-form",
  templateUrl: "./countries-form.component.html",
  styleUrls: ["./countries-form.component.scss"],
})
export class CountriesFormComponent implements OnInit {
  public loader: boolean = false;
  public form: FormGroup;
  private _id?: number;

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
        routerLink: ["/admin/config/country/new"],
      },
    ]);

    let params = this.route.snapshot.params?.id;
    if (params === "new") {
      this._id = null;
    } else if (isNaN(params)) {
      this.router.navigate(["/admin/config/country"]);
      return;
    }
    this._id = Number(params);
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      name: [null, Validators.required],
      is_active: [true, Validators.required],
    });

    if (this._id) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/country/"+this._id],
        },
      ]);
      this.loadData();
    }
  }

  public async loadData() {
    try {
      let resp = await this.addressService.getCountryById(this._id).toPromise();
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
    return await this.addressService.updateCountry(this._id, data).toPromise();
  }

  private async create(data) {
    return await this.addressService.createCountry(data).toPromise();
  }

  public back() {
    this.router.navigate(["/admin/config/country"]);
  }
}
