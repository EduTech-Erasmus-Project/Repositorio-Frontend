import { ChangeDetectorRef, Component, OnInit, ViewRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, forkJoin } from "rxjs";
import Swal from "sweetalert2";
import { Campus } from "src/app/core/interfaces/campus";
import { City } from "src/app/core/interfaces/city";
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

interface CampusFormControls {
  name: FormControl<string | null>;
  address: FormControl<string | null>;
  university: FormControl<number | null>;
  city: FormControl<number | null>;
  is_active: FormControl<boolean>;
}

interface CampusPayload {
  name: string;
  address: string;
  university: number;
  city: number;
  is_active: boolean;
}

type CampusResponse = Campus & {
  city?: City | number | null;
  university?: University | number | null;
};

@Component({
  selector: "app-campus-form",
  templateUrl: "./campus-form.component.html",
  styleUrls: ["./campus-form.component.scss"],
  standalone: false,
})
export class CampusFormComponent implements OnInit {
  public saving = false;
  public form!: FormGroup<CampusFormControls>;
  private _id: number | null = null;

  public cities: City[] = [];
  public universities: University[] = [];

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
        routerLink: ["/admin/config/campus/new"],
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
    this.form = this._fb.group<CampusFormControls>({
      name: this._fb.control<string | null>(null, Validators.required),
      address: this._fb.control<string | null>(null, Validators.required),
      university: this._fb.control<number | null>(null, Validators.required),
      city: this._fb.control<number | null>(null, Validators.required),
      is_active: this._fb.nonNullable.control(true, Validators.required),
    });

    void this.loadCatalogs();

    if (this._id !== null) {
      this.breadcrumbService.setItems([
        {
          label: "Editar",
          routerLink: ["/admin/config/campus/" + this._id],
        },
      ]);
      void this.loadById();
    }
  }

  /**
   * Carga los catalogos base que necesita el formulario de campus.
   */
  private async loadCatalogs() {
    try {
      const resp = await firstValueFrom(
        forkJoin({
          cities: this.addressService.getCitiesActive(),
          universities: this.addressService.getAllUniversities(),
        })
      );
      this.cities = resp.cities;
      this.universities = resp.universities;
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudieron cargar ciudades y universidades.");
    }
  }

  /**
   * Recupera el campus actual y adapta las relaciones al formulario reactivo.
   */
  private async loadById() {
    try {
      const resp = await firstValueFrom(this.addressService.getCampusById(this._id as number)) as CampusResponse;
      this.form.patchValue({
        name: resp.name ?? null,
        address: resp.address ?? null,
        university: toEntityId(resp.university),
        city: toEntityId(resp.city),
        is_active: Boolean(resp.is_active),
      });
      this.refreshView();
    } catch (error: unknown) {
      this.back();
      this.showError(error, "No se pudo cargar el campus.");
    }
  }

  public fieldInvalid(field: keyof CampusFormControls) {
    return controlInvalid(this.form.get(field));
  }

  /**
   * Crea o actualiza el campus a partir del estado actual del formulario.
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
      this.showError(error, "No se pudo guardar el campus.");
    } finally {
      this.saving = false;
      this.refreshView();
    }
  }

  private buildPayload(): CampusPayload {
    return {
      name: normalizeUppercaseText(this.form.controls.name.value),
      address: String(this.form.controls.address.value ?? "").trim(),
      university: Number(this.form.controls.university.value),
      city: Number(this.form.controls.city.value),
      is_active: this.form.controls.is_active.value,
    };
  }

  private async update(data: CampusPayload) {
    return await firstValueFrom(this.addressService.updateCampus(this._id as number, data));
  }

  private async create(data: CampusPayload) {
    return await firstValueFrom(this.addressService.createCampus(data as Partial<Campus>));
  }

  public back() {
    this.router.navigate(["/admin/config/campus"]);
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
