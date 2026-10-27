import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  forwardRef,
  inject,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  TouchedChangeEvent,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { InputTextModule } from "primeng/inputtext";
import { Select, SelectFilterEvent, SelectModule } from "primeng/select";
import { Subscription, firstValueFrom } from "rxjs";
import { filter } from "rxjs/operators";
import {
  USER_LOCATION_MAX_LENGTH,
  UserLocation,
} from "src/app/core/interfaces/user-location";
import {
  LocationCatalogService,
  LocationCountry,
  LocationState,
  getCountryDisplayName,
} from "src/app/services/location-catalog.service";

/** Valor del selector de ciudad que habilita el texto libre (D6). */
export const OTHER_CITY = "__other__";

/** Lista de ciudades a partir de la cual el selector usa scroll virtual. */
const VIRTUAL_SCROLL_THRESHOLD = 100;

type LocationFieldName = "country" | "province" | "city" | "otherCity" | "university";

export interface LocationOption {
  label: string;
  value: string;
  /** Nombre local que tambien encuentra el buscador (`München` para `Munich`). */
  native?: string;
}

const EMPTY_LOCATION: UserLocation = {
  country_code: "",
  country_name: "",
  province_code: "",
  province_name: "",
  city_name: "",
  university_name: "",
};

const requiredText: ValidatorFn = (control: AbstractControl) =>
  `${control.value ?? ""}`.trim() ? null : { required: true };

@Component({
  selector: "app-user-location-fields",
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, InputTextModule, TranslateModule],
  templateUrl: "./user-location-fields.component.html",
  styleUrls: ["./user-location-fields.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserLocationFieldsComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => UserLocationFieldsComponent),
      multi: true,
    },
  ],
})
/**
 * Campos de ubicacion de docentes y expertos (pais, provincia, ciudad y
 * universidad) como un solo control de formulario cuyo valor es `UserLocation`.
 *
 * Lo usan el registro y el perfil. Pais, provincia y ciudad salen de
 * `LocationCatalogService`. La provincia es obligatoria salvo en los paises
 * sin provincias en la libreria, y la ciudad se habilita despues de elegirla;
 * la ciudad admite texto libre ("Otra ciudad") cuando no esta en la libreria.
 * Al precargar un usuario se conserva la provincia guardada aunque no exista en
 * el catalogo, mientras no se cambie el pais ni la provincia.
 */
export class UserLocationFieldsComponent
  implements ControlValueAccessor, Validator, OnInit
{
  /** Prefijo de los ids del template, para poder usar el componente dos veces. */
  @Input() idPrefix = "location";
  /** Clase de las etiquetas, para igualar el estilo del formulario que lo usa. */
  @Input() labelClass = "";
  @Input() selectStyleClass = "";
  @Input() panelStyleClass = "";

  private readonly catalog = inject(LocationCatalogService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxLength = USER_LOCATION_MAX_LENGTH;
  readonly otherCityValue = OTHER_CITY;

  readonly form = new FormGroup({
    country: new FormControl<string | null>(null, Validators.required),
    province: new FormControl<string | null>(null),
    city: new FormControl<string | null>(null),
    otherCity: new FormControl("", { nonNullable: true }),
    university: new FormControl("", {
      nonNullable: true,
      validators: [requiredText, Validators.maxLength(USER_LOCATION_MAX_LENGTH.university_name)],
    }),
  });

  countryOptions: LocationOption[] = [];
  stateOptions: LocationOption[] = [];
  cityOptions: LocationOption[] = [];

  loadingCountries = false;
  loadingStates = false;
  loadingCities = false;
  countriesError = false;

  /** Provincia guardada que no se encontro en el catalogo (D9). */
  preservedProvince: { code: string; name: string } | null = null;

  private countries: LocationCountry[] = [];
  private states: LocationState[] = [];
  private countriesReady: Promise<void> = Promise.resolve();
  /** Control del formulario padre; se recibe en `validate()`. */
  private parentControl: AbstractControl | null = null;
  private parentTouchedSubscription?: Subscription;
  /**
   * Provincia de la que se cargaron las ciudades. El `[required]` de la
   * provincia revalida el control y emite el mismo valor: sin comparar con
   * esta, se borraria la ciudad elegida.
   */
  private citiesProvince: string | null = null;
  /** Se incrementa en cada cambio de pais o provincia para descartar respuestas viejas. */
  private loadToken = 0;

  private onChange: (value: UserLocation) => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  ngOnInit(): void {
    this.loadCountries();
    this.destroyRef.onDestroy(() => this.parentTouchedSubscription?.unsubscribe());

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.countryOptions = this.buildCountryOptions();
        this.cdr.markForCheck();
      });

    const { country, province, city } = this.form.controls;
    country.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((code) => this.onCountrySelected(code));
    province.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((code) => this.onProvinceSelected(code));
    city.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.onCitySelected(value));

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onChange(this.buildValue()));
  }

  /** Hay ciudades de la libreria para elegir; si no, la ciudad es texto libre. */
  get showCitySelect(): boolean {
    return this.cityOptions.length > 1;
  }

  /**
   * La ciudad todavia no se puede elegir: falta el pais o la provincia, o se
   * estan cargando. Se muestra un selector deshabilitado que lo explica.
   */
  get cityPending(): boolean {
    return (
      !this.form.controls.country.value ||
      this.loadingStates ||
      this.loadingCities ||
      (this.provinceRequired && !this.form.controls.province.value)
    );
  }

  /** Texto del selector de ciudad deshabilitado. */
  get cityPendingPlaceholder(): string {
    if (this.loadingStates || this.loadingCities) {
      return "location.loading";
    }
    return this.form.controls.country.value
      ? "location.placeholders.needsProvince"
      : "location.placeholders.needsCountry";
  }

  /**
   * El selector de provincia se ve siempre (deshabilitado hasta elegir el
   * pais), para que los campos no cambien de lugar; solo se oculta en los
   * paises sin provincias en la libreria.
   */
  get showProvince(): boolean {
    return !this.form.controls.country.value || this.provincePending || this.stateOptions.length > 0;
  }

  /** Falta el pais o se estan cargando sus provincias. */
  get provincePending(): boolean {
    return !this.form.controls.country.value || this.loadingStates;
  }

  /** Obligatoria si el pais tiene provincias, salvo que se conserve la guardada (D9). */
  get provinceRequired(): boolean {
    return this.stateOptions.length > 0 && !this.preservedProvince;
  }

  get showOtherCity(): boolean {
    return (
      !this.cityPending &&
      (!this.showCitySelect || this.form.controls.city.value === OTHER_CITY)
    );
  }

  /** Clase de los paneles: la propia (ancho fijo, ver `styles.scss`) y la del formulario. */
  get panelClass(): string {
    return `location-select-panel ${this.panelStyleClass}`.trim();
  }

  get useCityVirtualScroll(): boolean {
    return this.cityOptions.length > VIRTUAL_SCROLL_THRESHOLD;
  }

  /** Error visible de un control, solo cuando el usuario ya paso por el. */
  fieldError(name: LocationFieldName): string | null {
    const control = this.form.controls[name];
    if (!control.invalid || !(control.touched || control.dirty)) {
      return null;
    }
    return control.hasError("maxlength") ? "maxlength" : "required";
  }

  fieldId(name: string): string {
    return `${this.idPrefix}-${name}`;
  }

  /**
   * `aria-labelledby` de un selector: su etiqueta y, si hay, su error, para que
   * el lector de pantalla lea "Pais, Campo obligatorio". `p-select` no recibe
   * `aria-describedby`.
   */
  labelledBy(name: "country" | "province" | "city"): string {
    const label = this.fieldId(`${name}-label`);
    return this.fieldError(name) ? `${label} ${this.fieldId(`${name}-error`)}` : label;
  }

  /**
   * Al filtrar, PrimeNG deja sin opcion enfocada y Enter no elige nada. Se
   * enfoca la primera coincidencia para elegirla con Enter; el lector de
   * pantalla la anuncia por `aria-activedescendant`.
   */
  focusFirstMatch(select: Select, event: SelectFilterEvent): void {
    select.focusedOptionIndex.set(event.filter ? select.findFirstOptionIndex() : -1);
  }

  retryCountries(): void {
    this.loadCountries();
  }

  // ControlValueAccessor

  writeValue(value: UserLocation | null): void {
    void this.applyLocation({ ...EMPTY_LOCATION, ...(value ?? {}) });
  }

  registerOnChange(fn: (value: UserLocation) => void): void {
    this.onChange = fn;
  }

  /**
   * El control padre no se marca como tocado al salir de un campo: cada campo
   * muestra su error al salir de el. Si se marcara, el padre ya estaria tocado
   * al enviar y `markAllAsTouched()` no avisaria para mostrar los errores de los
   * campos que no se llenaron (ver `watchParentTouched`). Ademas, al abrir un
   * selector el foco pasa a su panel y se mostrarian errores antes de tiempo.
   */
  registerOnTouched(_fn: () => void): void {
    // Sin uso, ver arriba.
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  // Validator

  validate(control: AbstractControl): ValidationErrors | null {
    this.watchParentTouched(control);
    return this.form.disabled || this.form.valid ? null : { userLocation: true };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }


  /**
   * Ubicacion lista para enviar al backend. Provincia y ciudad van como `""`
   * cuando no hay, para que el backend no conserve las del pais anterior (D8).
   */
  buildValue(): UserLocation {
    const { country, province, city, otherCity, university } = this.form.getRawValue();
    const selectedCountry = this.countries.find((item) => item.iso2 === country);
    const selectedState = this.states.find((item) => item.iso2 === province);
    const provinceValue = selectedState
      ? { code: selectedState.iso2, name: selectedState.name }
      : this.preservedProvince ?? { code: "", name: "" };

    return {
      country_code: selectedCountry?.iso2 ?? "",
      country_name: selectedCountry?.name_es ?? "",
      province_code: provinceValue.code,
      province_name: provinceValue.name,
      city_name: (city && city !== OTHER_CITY ? city : otherCity).trim(),
      university_name: university.trim(),
    };
  }

  private loadCountries(): void {
    this.loadingCountries = true;
    this.countriesError = false;
    this.countriesReady = firstValueFrom(this.catalog.getCountries())
      .then((countries) => {
        this.countries = countries;
        this.countryOptions = this.buildCountryOptions();
      })
      .catch(() => {
        this.countriesError = true;
      })
      .finally(() => {
        this.loadingCountries = false;
        this.cdr.markForCheck();
      });
  }

  private buildCountryOptions(): LocationOption[] {
    const language = this.translate.currentLang || this.translate.defaultLang || "es";
    return this.countries
      .map((country) => ({
        label: getCountryDisplayName(country, language),
        value: country.iso2,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, language));
  }

  /**
   * Marca los campos internos cuando el formulario padre se marca como tocado
   * (por ejemplo con `markAllAsTouched()` al enviar), para mostrar sus errores.
   *
   * El control llega por `validate()` porque con `formControlName` aun no
   * existe cuando corre `ngOnInit` de este componente.
   */
  private watchParentTouched(control: AbstractControl): void {
    if (control === this.parentControl) {
      return;
    }
    this.parentControl = control;
    this.parentTouchedSubscription?.unsubscribe();
    this.parentTouchedSubscription = control.events
      .pipe(filter((event): event is TouchedChangeEvent => event instanceof TouchedChangeEvent))
      .subscribe((event) => {
        if (event.touched) {
          this.form.markAllAsTouched();
        } else {
          this.form.markAsUntouched();
        }
        this.cdr.markForCheck();
      });
  }

  private onCountrySelected(code: string | null): void {
    const token = ++this.loadToken;
    this.citiesProvince = null;
    this.preservedProvince = null;
    this.states = [];
    this.stateOptions = [];
    this.cityOptions = [];
    this.clearFields(["province", "city", "otherCity"]);
    this.updateCityValidators();

    if (code) {
      void this.loadStates(code, token).then(() => this.notifyAsyncChange());
    }
  }

  private onProvinceSelected(code: string | null): void {
    if (code === this.citiesProvince) {
      return;
    }
    const token = ++this.loadToken;
    this.citiesProvince = code;
    this.preservedProvince = null;
    this.cityOptions = [];
    this.clearFields(["city", "otherCity"]);
    this.updateCityValidators();

    const country = this.form.controls.country.value;
    if (country && code) {
      void this.loadCities(country, code, token).then(() => this.notifyAsyncChange());
    }
  }

  private onCitySelected(value: string | null): void {
    if (value !== OTHER_CITY) {
      this.clearFields(["otherCity"]);
    }
    this.updateCityValidators();
  }

  /**
   * Vacia los campos que dependen del que cambio y les quita el estado de
   * tocado, para que no aparezcan con error antes de que el usuario los llene.
   */
  private clearFields(names: ("province" | "city" | "otherCity")[]): void {
    for (const name of names) {
      const control = this.form.controls[name];
      control.setValue(name === "otherCity" ? "" : null, { emitEvent: false });
      control.markAsPristine();
      control.markAsUntouched();
    }
  }

  /**
   * Precarga un usuario: busca pais, provincia y ciudad en el catalogo. Lo que
   * no se encuentra se conserva (provincia) o pasa a "Otra ciudad" (ciudad).
   */
  private async applyLocation(location: UserLocation): Promise<void> {
    const token = ++this.loadToken;
    const countryCode = location.country_code.trim().toUpperCase();

    this.citiesProvince = null;
    this.preservedProvince = null;
    this.states = [];
    this.stateOptions = [];
    this.cityOptions = [];
    this.form.reset(
      {
        country: countryCode || null,
        province: null,
        city: null,
        otherCity: "",
        university: location.university_name,
      },
      { emitEvent: false }
    );
    this.updateCityValidators();

    if (!countryCode) {
      return;
    }

    await this.countriesReady;
    if (token !== this.loadToken) {
      return;
    }
    if (this.countries.length && !this.countries.some((item) => item.iso2 === countryCode)) {
      this.form.controls.country.setValue(null, { emitEvent: false });
      this.notifyAsyncChange(false);
      return;
    }

    await this.loadStates(countryCode, token);
    if (token !== this.loadToken) {
      return;
    }

    const state = await firstValueFrom(
      this.catalog.findState(countryCode, location.province_code, location.province_name)
    );
    if (token !== this.loadToken) {
      return;
    }

    if (state) {
      this.form.controls.province.setValue(state.iso2, { emitEvent: false });
      this.citiesProvince = state.iso2;
      await this.loadCities(countryCode, state.iso2, token);
      if (token !== this.loadToken) {
        return;
      }
    } else if (location.province_code || location.province_name) {
      this.preservedProvince = {
        code: location.province_code,
        name: location.province_name,
      };
    }

    const city = state
      ? await firstValueFrom(this.catalog.findCity(countryCode, state.iso2, location.city_name))
      : null;
    if (token !== this.loadToken) {
      return;
    }

    if (city && this.showCitySelect) {
      this.form.controls.city.setValue(city.name, { emitEvent: false });
    } else if (location.city_name) {
      this.form.patchValue(
        {
          city: this.showCitySelect ? OTHER_CITY : null,
          otherCity: location.city_name,
        },
        { emitEvent: false }
      );
    }
    this.updateCityValidators();
    this.notifyAsyncChange(false);
  }

  private async loadStates(countryCode: string, token: number): Promise<void> {
    this.loadingStates = true;
    this.cdr.markForCheck();
    const states = await firstValueFrom(this.catalog.getStates(countryCode));
    if (token !== this.loadToken) {
      return;
    }
    this.loadingStates = false;
    this.states = states;
    this.stateOptions = states.map((state) => ({
      label: state.name,
      value: state.iso2,
      native: state.native,
    }));
    this.updateCityValidators();
  }

  private async loadCities(countryCode: string, stateCode: string, token: number): Promise<void> {
    this.loadingCities = true;
    this.cdr.markForCheck();
    const cities = await firstValueFrom(this.catalog.getCities(countryCode, stateCode));
    if (token !== this.loadToken) {
      return;
    }
    this.loadingCities = false;
    this.cityOptions = cities.length
      ? [
          {
            label: this.translate.instant("location.otherCityOption"),
            value: OTHER_CITY,
          },
          ...cities.map((city) => ({ label: city.name, value: city.name, native: city.native })),
        ]
      : [];
    this.updateCityValidators();
  }

  /**
   * La provincia es obligatoria si el pais tiene provincias. La ciudad tambien:
   * en el selector si hay ciudades de la libreria y en el texto libre si no hay
   * o si se eligio "Otra ciudad".
   */
  private updateCityValidators(): void {
    const { province, city, otherCity } = this.form.controls;
    province.setValidators(this.provinceRequired ? Validators.required : null);
    province.updateValueAndValidity({ emitEvent: false });
    city.setValidators(this.showCitySelect ? Validators.required : null);
    otherCity.setValidators(
      this.showOtherCity
        ? [requiredText, Validators.maxLength(USER_LOCATION_MAX_LENGTH.city_name)]
        : null
    );
    city.updateValueAndValidity({ emitEvent: false });
    otherCity.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Avisa al formulario padre de cambios que llegaron despues de una carga.
   *
   * Al precargar (`emitValue = false`) no se usa `onChange`, que marcaria el
   * formulario como modificado: se actualiza el control padre directamente con
   * lo que se encontro en el catalogo (por ejemplo `province_code` de un
   * usuario migrado), para que al guardar se envie lo que se ve en pantalla.
   */
  private notifyAsyncChange(emitValue = true): void {
    this.loadingStates = false;
    this.loadingCities = false;
    if (emitValue) {
      this.onChange(this.buildValue());
    } else if (this.parentControl && this.form.controls.country.value) {
      this.parentControl.setValue(this.buildValue(), { emitModelToViewChange: false });
    }
    this.onValidatorChange();
    this.cdr.markForCheck();
  }
}
