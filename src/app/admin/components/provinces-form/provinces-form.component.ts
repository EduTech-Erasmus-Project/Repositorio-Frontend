import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import Swal from "sweetalert2";
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

interface ProvinceFormControls {
  name: FormControl<string | null>;
  country: FormControl<number | null>;
  is_active: FormControl<boolean>;
}

interface ProvincePayload {
  name: string;
  country: number;
  is_active: boolean;
}

@Component({
  selector: "app-provinces-form",
  templateUrl: "./provinces-form.component.html",
  styleUrls: ["./provinces-form.component.scss"],
  standalone: false,
})
export class ProvincesFormComponent implements OnInit {
  public saving = false;
  public form!: FormGroup<ProvinceFormControls>;
  private _id: number | null = null;

  public countries: Country[] = [];

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
        routerLink: ["/admin/config/province/new"],
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
    this.form = this._fb.group<ProvinceFormControls>({
      name: this._fb.control<string | null>(null, Validators.required),
      country: this._fb.control<number | null>(null, Validators.required),
      is_active: this._fb.nonNullable.control(true, Validators.required),
    });

    void this.loadCountries();

    if (this._id !== null) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/province/" + this._id],
        },
      ]);
      void this.loadById();
    }
  }

  /**
   * Carga el catalogo de paises activos usado por el selector de provincias.
   */
  private async loadCountries() {
    try {
      this.countries = await firstValueFrom(this.addressService.getCountriesActive());
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudieron cargar los paises.");
    }
  }

  /**
   * Recupera la provincia actual y adapta las relaciones al formulario.
   */
  private async loadById() {
    try {
      const resp = await firstValueFrom(this.addressService.getProvinceById(this._id as number));
      this.form.patchValue({
        name: resp.name ?? null,
        country: toEntityId(resp.country),
        is_active: Boolean(resp.is_active),
      });
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudo cargar la provincia.");
    }
  }

  public fieldInvalid(field: keyof ProvinceFormControls) {
    return controlInvalid(this.form.get(field));
  }

  /**
   * Crea o actualiza la provincia respetando las validaciones locales.
   */
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
      this.showError(error, "No se pudo guardar la provincia.");
    } finally {
      this.saving = false;
      this.refreshView();
    }
  }

  private buildPayload(): ProvincePayload {
    return {
      name: normalizeUppercaseText(this.form.controls.name.value),
      country: Number(this.form.controls.country.value),
      is_active: this.form.controls.is_active.value,
    };
  }

  private async update(data: ProvincePayload) {
    return await firstValueFrom(this.addressService.updateProvince(this._id as number, data));
  }

  private async create(data: ProvincePayload) {
    return await firstValueFrom(this.addressService.createProvince(data as Partial<Province>));
  }

  public back() {
    this.router.navigate(["/admin/config/province"]);
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
