import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  forwardRef,
} from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { EducationLevel } from "src/app/core/interfaces/EducationLevel";
import { AGE_MAX, AGE_MIN, levelAgeRange } from "../settings-form.utils";

type AgeRange = [number, number];
type AgeBound = "min" | "max";

/** Pasos del teclado en los campos de edad (patron spinbutton de WAI-ARIA). */
const KEY_STEPS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 5, PageDown: -5 };

let nextId = 0;

/**
 * Rango de edad del OA sin deslizador.
 *
 * Muestra siempre dos campos de edad llenos con la edad tipica del nivel CINE
 * elegido, mas "sin limite de edad maxima" (se guarda como 99). Cada campo se
 * puede escribir, subir y bajar con las flechas (Re Pag / Av Pag de 5 en 5) o
 * con sus botones - y +, que tambien se alcanzan con Tab.
 * Si cambia el nivel y la edad era la del nivel anterior, se pone la del
 * nuevo; si el docente la cambio, se respeta.
 *
 * Valor del control: `[min, max]` o `null` (sin edad elegida).
 */
@Component({
  selector: "app-age-range-field",
  standalone: true,
  imports: [FormsModule, TranslateModule, ButtonModule, CheckboxModule],
  templateUrl: "./age-range-field.component.html",
  styleUrls: ["./age-range-field.component.css"],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AgeRangeFieldComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => AgeRangeFieldComponent), multi: true },
  ],
})
export class AgeRangeFieldComponent implements ControlValueAccessor, Validator, OnChanges {
  /** Nivel educativo elegido en el formulario. */
  @Input() level: EducationLevel | null = null;

  readonly ageMin = AGE_MIN;
  readonly ageMax = AGE_MAX;
  readonly idPrefix = `age-range-${nextId++}`;

  public value: AgeRange | null = null;
  /** Texto que el docente esta escribiendo; se descarta al salir del campo. */
  public drafts: Record<AgeBound, string | null> = { min: null, max: null };
  public disabled = false;

  private registered = false;
  private pendingEmit = false;
  private onChange: (value: AgeRange | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes["level"]) {
      return;
    }

    const previous = levelAgeRange(changes["level"].previousValue);
    const next = this.levelRange;
    const followsLevel = !this.value || this.sameRange(this.value, previous);

    if (next && followsLevel && !this.sameRange(this.value, next)) {
      // Llega durante el dibujo del padre: se avisa al formulario despues.
      this.setValue(next, true);
    }
  }

  get levelRange(): AgeRange | null {
    return levelAgeRange(this.level);
  }

  get min(): number | null {
    return this.value?.[0] ?? null;
  }

  get max(): number | null {
    return this.value?.[1] ?? null;
  }

  get noUpperLimit(): boolean {
    return this.max === AGE_MAX;
  }

  get invalidOrder(): boolean {
    return !!this.value && this.value[0] > this.value[1];
  }

  get followsLevel(): boolean {
    return !!this.value && this.sameRange(this.value, this.levelRange);
  }

  useLevelAge(): void {
    if (this.levelRange) {
      this.setValue(this.levelRange);
    }
  }

  /** Lo que muestra cada campo: lo que se escribe o la edad guardada. */
  displayValue(bound: AgeBound): string {
    if (bound === "max" && this.noUpperLimit) {
      return "";
    }
    return this.drafts[bound] ?? (this[bound]?.toString() ?? "");
  }

  /** Limite superior de cada campo; 99 en la maxima es "sin limite". */
  boundMax(bound: AgeBound): number {
    return bound === "max" ? AGE_MAX - 1 : AGE_MAX;
  }

  canStep(bound: AgeBound, delta: number): boolean {
    if (this.disabled || (bound === "max" && this.noUpperLimit)) {
      return false;
    }
    const current = this.currentBound(bound);
    return delta < 0 ? current > AGE_MIN : current < this.boundMax(bound);
  }

  step(bound: AgeBound, delta: number): void {
    if (bound === "max" && this.noUpperLimit) {
      return;
    }
    this.drafts[bound] = null;
    this.setBound(bound, this.clamp(this.currentBound(bound) + delta, this.boundMax(bound)));
  }

  /** Solo deja escribir numeros; el valor cambia en cuanto hay uno valido. */
  onInput(bound: AgeBound, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, "").slice(0, 2);
    if (digits !== input.value) {
      input.value = digits;
    }
    this.drafts[bound] = digits;
    if (digits !== "") {
      this.setBound(bound, this.clamp(Number(digits), this.boundMax(bound)));
    }
  }

  onKeydown(bound: AgeBound, event: KeyboardEvent): void {
    if (event.key in KEY_STEPS) {
      event.preventDefault();
      this.step(bound, KEY_STEPS[event.key]);
    } else if (event.key === "Enter") {
      // Enter confirma la edad; no debe enviar todo el formulario.
      event.preventDefault();
      this.onBlur(bound);
    }
  }

  /** Al salir se muestra la edad guardada (si quedo vacio, la anterior). */
  onBlur(bound: AgeBound): void {
    this.drafts[bound] = null;
    this.markTouched();
    this.cdr.markForCheck();
  }

  onMinChange(min: number | null): void {
    this.setValue([min ?? AGE_MIN, this.max ?? this.levelRange?.[1] ?? AGE_MAX]);
  }

  onMaxChange(max: number | null): void {
    this.setValue([this.min ?? this.levelRange?.[0] ?? AGE_MIN, max ?? AGE_MAX]);
  }

  onNoUpperLimitChange(noLimit: boolean): void {
    const min = this.min ?? AGE_MIN;
    const fallbackMax = this.levelRange && this.levelRange[1] !== AGE_MAX ? this.levelRange[1] : min;
    this.setValue([min, noLimit ? AGE_MAX : Math.max(min, fallbackMax)]);
  }

  markTouched(): void {
    this.onTouched();
  }

  writeValue(value: AgeRange | null): void {
    const written: AgeRange | null =
      Array.isArray(value) && value.length === 2 ? [value[0], value[1]] : null;
    if (!written && this.levelRange) {
      // Sin edad elegida pero con nivel: se propone la del nivel.
      this.setValue(this.levelRange, true);
    } else {
      this.value = written;
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: AgeRange | null) => void): void {
    this.onChange = fn;
    this.registered = true;
    if (this.pendingEmit) {
      this.pendingEmit = false;
      this.emitLater();
    }
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    if (!this.value) {
      return { required: true };
    }
    const [min, max] = this.value;
    if (min < AGE_MIN || max > AGE_MAX) {
      return { ageOutOfRange: true };
    }
    return min > max ? { ageOrder: true } : null;
  }

  /**
   * Guarda el valor y avisa al formulario. Con `deferred` (cambios que no
   * vienen del usuario) el aviso va en una microtarea, para no cambiar el
   * formulario mientras el padre se esta dibujando; si el formulario aun no
   * registro su `onChange`, se avisa al registrarlo.
   */
  private setValue(value: AgeRange, deferred = false): void {
    this.value = value;
    this.cdr.markForCheck();
    if (!this.registered) {
      this.pendingEmit = true;
    } else if (deferred) {
      this.emitLater();
    } else {
      this.onChange(value);
      this.onValidatorChange();
    }
  }

  private emitLater(): void {
    queueMicrotask(() => {
      this.onChange(this.value);
      this.onValidatorChange();
      this.cdr.markForCheck();
    });
  }

  private setBound(bound: AgeBound, age: number): void {
    if (bound === "min") {
      this.onMinChange(age);
    } else {
      this.onMaxChange(age);
    }
  }

  private currentBound(bound: AgeBound): number {
    const index = bound === "min" ? 0 : 1;
    return this.value?.[index] ?? this.levelRange?.[index] ?? (bound === "min" ? AGE_MIN : this.boundMax(bound));
  }

  private clamp(age: number, max: number): number {
    return Math.min(Math.max(age, AGE_MIN), max);
  }

  private sameRange(a: AgeRange | null, b: AgeRange | null): boolean {
    return !!a && !!b && a[0] === b[0] && a[1] === b[1];
  }
}
