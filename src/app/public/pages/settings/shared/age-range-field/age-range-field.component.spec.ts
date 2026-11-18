import { ChangeDetectorRef, SimpleChange } from "@angular/core";
import { FormControl } from "@angular/forms";
import { EducationLevel } from "src/app/core/interfaces/EducationLevel";
import { formatAgeRange, levelAgeRange, parseAgeRange } from "../settings-form.utils";
import { AgeRangeFieldComponent } from "./age-range-field.component";

const PRIMARY: EducationLevel = { id: 1, isced_code: 1, typical_age_min: 6, typical_age_max: 11 };
const BACHELOR: EducationLevel = { id: 4, isced_code: 6, typical_age_min: 18, typical_age_max: null };

describe("AgeRangeFieldComponent", () => {
  let component: AgeRangeFieldComponent;
  let emitted: Array<[number, number] | null>;

  const flush = () => Promise.resolve();

  function setLevel(level: EducationLevel | null): void {
    const previous = component.level;
    component.level = level;
    component.ngOnChanges({ level: new SimpleChange(previous, level, previous === null) });
  }

  beforeEach(() => {
    component = new AgeRangeFieldComponent({ markForCheck: () => {} } as unknown as ChangeDetectorRef);
    emitted = [];
  });

  function register(): void {
    component.registerOnChange((value) => emitted.push(value));
    component.registerOnValidatorChange(() => {});
  }

  it("debe proponer la edad del nivel cuando no hay edad elegida", async () => {
    component.writeValue(null);
    register();
    setLevel(PRIMARY);
    await flush();

    expect(component.value).toEqual([6, 11]);
    expect(emitted.at(-1)).toEqual([6, 11]);
    expect(component.followsLevel).toBeTrue();
  });

  it("debe avisar al formulario aunque el nivel llegue antes de registrarse", async () => {
    setLevel(BACHELOR);
    component.writeValue(null);
    register();
    await flush();

    expect(emitted.at(-1)).toEqual([18, 99]);
  });

  it("debe seguir al nivel nuevo si la edad era la del nivel anterior", async () => {
    register();
    setLevel(PRIMARY);
    setLevel(BACHELOR);
    await flush();

    expect(component.value).toEqual([18, 99]);
  });

  it("debe respetar la edad cambiada por el docente al cambiar el nivel", async () => {
    register();
    setLevel(PRIMARY);
    component.onMaxChange(14);
    setLevel(BACHELOR);
    await flush();

    expect(component.value).toEqual([6, 14]);
    expect(component.followsLevel).toBeFalse();
  });

  it("debe conservar la edad guardada de un OA aunque difiera del nivel", () => {
    component.writeValue([18, 65]);
    register();
    setLevel(BACHELOR);

    expect(component.value).toEqual([18, 65]);
    expect(component.followsLevel).toBeFalse();
  });

  it("debe completar la otra edad con la del nivel si aun no hay rango", () => {
    component.writeValue(null);
    register();
    component.level = PRIMARY;
    component.value = null;
    component.onMinChange(8);

    expect(component.value).toEqual([8, 11]);
  });

  it("debe volver a la edad del nivel", () => {
    register();
    component.writeValue([20, 30]);
    setLevel(BACHELOR);
    component.useLevelAge();

    expect(component.value).toEqual([18, 99]);
    expect(component.followsLevel).toBeTrue();
  });

  it("debe manejar sin limite de edad maxima", () => {
    register();
    component.writeValue([12, 14]);
    setLevel(PRIMARY);
    component.onNoUpperLimitChange(true);
    expect(component.value).toEqual([12, 99]);
    expect(component.noUpperLimit).toBeTrue();

    component.onNoUpperLimitChange(false);
    expect(component.value).toEqual([12, 12]);
  });

  it("debe subir y bajar la edad con las flechas sin enviar el formulario con Enter", () => {
    register();
    component.writeValue([6, 11]);
    const key = (bound: "min" | "max", k: string) => {
      const event = new KeyboardEvent("keydown", { key: k, cancelable: true });
      component.onKeydown(bound, event);
      return event.defaultPrevented;
    };

    expect(key("min", "ArrowUp")).toBeTrue();
    expect(component.value).toEqual([7, 11]);
    key("max", "PageDown");
    expect(component.value).toEqual([7, 6]);
    expect(key("min", "Enter")).toBeTrue();
    expect(key("min", "Tab")).toBeFalse();
  });

  it("debe aceptar solo numeros al escribir y respetar los limites", () => {
    register();
    component.writeValue([6, 11]);
    const type = (bound: "min" | "max", text: string) => {
      const input = document.createElement("input");
      input.value = text;
      component.onInput(bound, { target: input } as unknown as Event);
      return input.value;
    };

    expect(type("min", "1a5")).toBe("15");
    expect(component.value).toEqual([15, 11]);
    type("max", "99");
    expect(component.value).toEqual([15, 98]);
    expect(component.noUpperLimit).toBeFalse();

    type("min", "");
    expect(component.value).toEqual([15, 98]);
    expect(component.displayValue("min")).toBe("");
    component.onBlur("min");
    expect(component.displayValue("min")).toBe("15");
  });

  it("debe desactivar los botones en los extremos y con sin limite", () => {
    register();
    component.writeValue([0, 98]);
    expect(component.canStep("min", -1)).toBeFalse();
    expect(component.canStep("max", 1)).toBeFalse();
    expect(component.canStep("min", 1)).toBeTrue();

    component.onNoUpperLimitChange(true);
    expect(component.canStep("max", -1)).toBeFalse();
    expect(component.displayValue("max")).toBe("");
  });

  it("debe validar rango vacio y orden", () => {
    const control = new FormControl(null);
    component.writeValue(null);
    expect(component.validate(control)).toEqual({ required: true });

    component.writeValue([20, 10]);
    expect(component.validate(control)).toEqual({ ageOrder: true });

    component.writeValue([10, 20]);
    expect(component.validate(control)).toBeNull();
  });
});

describe("age range utils", () => {
  it("debe ignorar el valor del deslizador anterior y las edades imposibles", () => {
    expect(parseAgeRange("5-100")).toBeNull();
    expect(parseAgeRange("5-147")).toBeNull();
    expect(parseAgeRange("100-100")).toBeNull();
    expect(parseAgeRange("30-20")).toBeNull();
    expect(parseAgeRange("")).toBeNull();
  });

  it("debe conservar la minima del docente si solo la maxima es excesiva", () => {
    expect(parseAgeRange("13-100")).toEqual([13, 99]);
    expect(parseAgeRange("18-65")).toEqual([18, 65]);
    expect(parseAgeRange("5-10")).toEqual([5, 10]);
  });

  it("debe formatear y leer la edad tipica del nivel", () => {
    expect(formatAgeRange([18, 99])).toBe("18-99");
    expect(levelAgeRange(BACHELOR)).toEqual([18, 99]);
    expect(levelAgeRange(PRIMARY)).toEqual([6, 11]);
    expect(levelAgeRange({ typical_age_min: null })).toBeNull();
  });
});
