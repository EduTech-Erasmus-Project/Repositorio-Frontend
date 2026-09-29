import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import Swal from "sweetalert2";
import { Country } from "src/app/core/interfaces/country";
import { University } from "src/app/core/interfaces/university";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import {
  controlInvalid,
  getRequestErrorMessage,
  normalizeUppercaseText,
  toEntityId,
} from "../../shared/admin-form.utils";

interface UniversityFormControls {
  name: FormControl<string | null>;
  country: FormControl<number | null>;
  is_active: FormControl<boolean>;
}

interface UniversityPayload {
  name: string;
  country: number;
  is_active: boolean;
}

type UniversityResponse = University & {
  country?: Country | number | null;
};

@Component({
  selector: "app-university-form",
  templateUrl: "./university-form.component.html",
  styleUrls: ["./university-form.component.scss"],
  standalone: false,
})
export class UniversityFormComponent implements OnInit {
  public saving = false;
  public form!: FormGroup<UniversityFormControls>;
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
        routerLink: ["/admin/config/university/new"],
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
    this.form = this._fb.group<UniversityFormControls>({
      name: this._fb.control<string | null>(null, Validators.required),
      country: this._fb.control<number | null>(null, Validators.required),
      is_active: this._fb.nonNullable.control(true, Validators.required),
    });

    void this.loadCountries();

    if (this._id !== null) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/university/" + this._id],
        },
      ]);
      void this.loadById();
    }
  }

  /**
   * Carga los paises activos disponibles para asociar universidades.
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
   * Recupera la universidad actual cuando el formulario abre en modo edicion.
   */
  private async loadById() {
    try {
      const resp = await firstValueFrom(
        this.addressService.getUniversityById(this._id as number)
      ) as UniversityResponse;

      this.form.patchValue({
        name: resp.name ?? null,
        country: toEntityId(resp.country),
        is_active: Boolean(resp.is_active),
      });
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudo cargar la universidad.");
    }
  }

  public fieldInvalid(field: keyof UniversityFormControls) {
    return controlInvalid(this.form.get(field));
  }

  /**
   * Persiste la universidad en create/update a partir del formulario actual.
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
      this.showError(error, "No se pudo guardar la universidad.");
    } finally {
      this.saving = false;
      this.refreshView();
    }
  }

  private buildPayload(): UniversityPayload {
    return {
      name: normalizeUppercaseText(this.form.controls.name.value),
      country: Number(this.form.controls.country.value),
      is_active: this.form.controls.is_active.value,
    };
  }

  private async update(data: UniversityPayload) {
    return await firstValueFrom(
      this.addressService.updateUniversity(this._id as number, data)
    );
  }

  private async create(data: UniversityPayload) {
    return await firstValueFrom(
      this.addressService.createUniversity(data as Partial<University>)
    );
  }

  public back() {
    this.router.navigate(["/admin/config/university"]);
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
