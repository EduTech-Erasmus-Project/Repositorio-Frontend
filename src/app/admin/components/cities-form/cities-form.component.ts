import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import Swal from "sweetalert2";
import { City } from "src/app/core/interfaces/city";
import { Country } from "src/app/core/interfaces/country";
import { Province } from "src/app/core/interfaces/province";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import {
  controlInvalid,
  getRequestErrorMessage,
  normalizeUppercaseText,
  toEntityId,
} from "../../shared/admin-form.utils";

interface CityFormControls {
  name: FormControl<string | null>;
  country: FormControl<number | null>;
  province: FormControl<number | null>;
  is_active: FormControl<boolean>;
}

interface CityPayload {
  name: string;
  country: number;
  province: number;
  is_active: boolean;
}

type CityResponse = City & {
  country?: Country | number | null;
  province?: Province | number | null;
};

type ProvinceResponse = Province & {
  country?: Country | number | null;
};

@Component({
  selector: "app-cities-form",
  templateUrl: "./cities-form.component.html",
  styleUrls: ["./cities-form.component.scss"],
  standalone: false,
})
export class CitiesFormComponent implements OnInit {
  public saving = false;
  public form!: FormGroup<CityFormControls>;
  private _id: number | null = null;

  public countries: Country[] = [];
  public provinces: Province[] = [];

  constructor(
    private _fb: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public appMain: AdminComponent,
    private route: ActivatedRoute,
    private router: Router,
    private addressService: AddressService,
    private cdr: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      {
        label: "Agregar",
        routerLink: ["/admin/config/city/new"],
      },
    ]);

    const idParam = this.route.snapshot.params?.["id"];
    if (idParam === "new") {
      this._id = null;
    } else if (typeof idParam !== "string" || Number.isNaN(Number(idParam))) {
      this.back();
      return;
    } else {
      this._id = Number(idParam);
    }
  }

  public get isEditMode(): boolean {
    return this._id !== null;
  }

  ngOnInit(): void {
    this.form = this._fb.group<CityFormControls>({
      name: this._fb.control<string | null>(null, Validators.required),
      country: this._fb.control<number | null>(null, Validators.required),
      province: this._fb.control<number | null>(null, Validators.required),
      is_active: this._fb.nonNullable.control(true, Validators.required),
    });

    void this.loadCountries();

    if (this._id !== null) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/city/" + this._id],
        },
      ]);
      void this.loadById();
    }
  }

  private async loadCountries() {
    try {
      this.countries = await firstValueFrom(this.addressService.getCountriesActive());
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudieron cargar los paises.");
    }
  }

  private async loadById() {
    try {
      const resp = await firstValueFrom(this.addressService.getCityById(this._id as number)) as CityResponse;

      const provinceId = toEntityId(resp.province);
      let countryId = toEntityId(resp.country);

      if (!countryId && provinceId) {
        const province = await firstValueFrom(
          this.addressService.getProvinceById(provinceId)
        ) as ProvinceResponse;
        countryId = toEntityId(province.country);
      }

      if (countryId) {
        this.form.patchValue({ country: countryId });
        await this.onChangeCountry(false);
      }

      this.form.patchValue({
        name: resp.name ?? null,
        country: countryId,
        province: provinceId,
        is_active: Boolean(resp.is_active),
      });
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudo cargar la ciudad.");
    }
  }

  public fieldInvalid(field: keyof CityFormControls) {
    return controlInvalid(this.form.get(field));
  }

  public async onSave() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    try {
      this.saving = true;
      this.refreshView();
      const data = this.buildPayload();

      if (this._id !== null) {
        await this.update(data);
      } else {
        await this.create(data);
      }

      this.back();
    } catch (error: unknown) {
      this.showError(error, "No se pudo guardar la ciudad.");
    } finally {
      this.saving = false;
      this.refreshView();
    }
  }

  public back() {
    this.router.navigate(["/admin/config/city"]);
  }

  public async onChangeCountry(resetProvince = true) {
    const countryId = this.form.controls.country.value;
    if (!countryId) {
      this.provinces = [];
      if (resetProvince) {
        this.form.patchValue({ province: null });
      }
      this.refreshView();
      return;
    }

    try {
      if (resetProvince) {
        this.form.patchValue({ province: null });
      }

      this.provinces = await firstValueFrom(
        this.addressService.getProvincesByCountry(countryId)
      );
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudieron cargar las provincias.");
    }
  }

  private buildPayload(): CityPayload {
    return {
      name: normalizeUppercaseText(this.form.controls.name.value),
      country: Number(this.form.controls.country.value),
      province: Number(this.form.controls.province.value),
      is_active: this.form.controls.is_active.value,
    };
  }

  private async update(data: CityPayload) {
    return await firstValueFrom(this.addressService.updateCity(this._id as number, data));
  }

  private async create(data: CityPayload) {
    return await firstValueFrom(this.addressService.createCity(data));
  }

  private showError(error: unknown, fallback: string) {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: getRequestErrorMessage(error, fallback),
    });
  }

  private refreshView(): void {
    const view = this.cdr as ViewRef;
    if (!view.destroyed) {
      this.cdr.detectChanges();
    }
  }
}
