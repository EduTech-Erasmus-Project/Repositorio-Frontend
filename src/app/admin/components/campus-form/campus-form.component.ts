import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { ActivatedRoute, Router } from "@angular/router";
import { AddressService } from "../../services/address.service";
import Swal from "sweetalert2";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-campus-form",
  templateUrl: "./campus-form.component.html",
  styleUrls: ["./campus-form.component.scss"],
})
export class CampusFormComponent implements OnInit {
  public loader: boolean = false;
  public form: FormGroup;
  private _id?: number;

  public cities?: any[];
  public universities?: any[];

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
        routerLink: ["/admin/config/campus/new"],
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
      address: [null, Validators.required],
      university: [null, Validators.required],
      city: [null, Validators.required],
      is_active: [true, Validators.required],
    });

    this.loadData();
    if (this._id) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/campus/" + this._id],
        },
      ]);
      this.loadById();
    }
  }

  private async loadData() {
    try {
      let resp: any = await forkJoin({
        cities: this.addressService.getCitiesActive(),
        universities: this.addressService.getAllUniversities(),
      }).toPromise();
      this.cities = resp.cities;
      this.universities = resp.universities;
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
      let resp = await this.addressService.getCampusById(this._id).toPromise();
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
    return await this.addressService.updateCampus(this._id, data).toPromise();
  }

  private async create(data) {
    return await this.addressService.createCampus(data).toPromise();
  }

  public back() {
    this.router.navigate(["/admin/config/campus"]);
  }

  // public async onChangeCountry() {
  //   try {
  //     let resp: any = await this.addressService
  //       .getProvincesByCountry(this.form.value.country)
  //       .toPromise();
  //     this.provinces = resp;
  //   } catch (error: any) {
  //     this.back();
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error!",
  //       text: error.error?.message || error.message,
  //     });
  //   }
  // }
}
