import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import Swal from "sweetalert2";
import { Country } from "src/app/core/interfaces/country";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import {
  controlInvalid,
  getRequestErrorMessage,
  normalizeUppercaseText,
} from "../../shared/admin-form.utils";

interface CountryFormControls {
  name: FormControl<string | null>;
  is_active: FormControl<boolean>;
}

interface CountryPayload {
  name: string;
  is_active: boolean;
}

@Component({
  selector: "app-countries-form",
  templateUrl: "./countries-form.component.html",
  styleUrls: ["./countries-form.component.scss"],
  standalone: false,
})
export class CountriesFormComponent implements OnInit {
  public saving = false;
  public form!: FormGroup<CountryFormControls>;
  private _id: number | null = null;

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
        routerLink: ["/admin/config/country/new"],
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
    this.form = this._fb.group<CountryFormControls>({
      name: this._fb.control<string | null>(null, Validators.required),
      is_active: this._fb.nonNullable.control(true, Validators.required),
    });

    if (this._id !== null) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/country/" + this._id],
        },
      ]);
      void this.loadData();
    }
  }

  /**
   * Hidrata el formulario cuando el catalogo se abre en modo edicion.
   */
  public async loadData() {
    try {
      const resp = await firstValueFrom(this.addressService.getCountryById(this._id as number));
      this.form.patchValue({
        name: resp.name ?? null,
        is_active: Boolean(resp.is_active),
      });
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudo cargar el pais.");
    }
  }

  public fieldInvalid(field: keyof CountryFormControls) {
    return controlInvalid(this.form.get(field));
  }

  /**
   * Persiste el pais segun el modo actual del formulario.
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
      this.showError(error, "No se pudo guardar el pais.");
    } finally {
      this.saving = false;
      this.refreshView();
    }
  }

  private buildPayload(): CountryPayload {
    return {
      name: normalizeUppercaseText(this.form.controls.name.value),
      is_active: this.form.controls.is_active.value,
    };
  }

  private async update(data: CountryPayload) {
    return await firstValueFrom(this.addressService.updateCountry(this._id as number, data));
  }

  private async create(data: CountryPayload) {
    return await firstValueFrom(this.addressService.createCountry(data as Partial<Country>));
  }

  public back() {
    this.router.navigate(["/admin/config/country"]);
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
