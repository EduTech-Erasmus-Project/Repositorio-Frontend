import { Component } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { UserLocation } from "src/app/core/interfaces/user-location";
import { normalizeLocationName } from "src/app/core/utils/location-name.utils";
import { LocationCatalogService } from "src/app/services/location-catalog.service";
import { OTHER_CITY, UserLocationFieldsComponent } from "./user-location-fields.component";

const COUNTRIES = [
  { iso2: "EC", name: "Ecuador", name_es: "Ecuador", emoji: "" },
  { iso2: "DE", name: "Germany", name_es: "Alemania", emoji: "" },
  { iso2: "GI", name: "Gibraltar", name_es: "Gibraltar", emoji: "" },
];

const STATES: Record<string, { iso2: string; name: string }[]> = {
  EC: [
    { iso2: "A", name: "Azuay" },
    { iso2: "P", name: "Pichincha" },
  ],
};

const CITIES: Record<string, { name: string }[]> = {
  "EC-P": [{ name: "Quito" }, { name: "Sangolquí" }],
  "EC-A": [],
};

function createCatalogStub() {
  return {
    getCountries: jasmine.createSpy("getCountries").and.returnValue(of(COUNTRIES)),
    getStates: jasmine
      .createSpy("getStates")
      .and.callFake((country: string) => of(STATES[country] ?? [])),
    getCities: jasmine
      .createSpy("getCities")
      .and.callFake((country: string, state: string) => of(CITIES[`${country}-${state}`] ?? [])),
    findState: jasmine
      .createSpy("findState")
      .and.callFake((country: string, code: string, name: string) =>
        of(
          (STATES[country] ?? []).find(
            (state) =>
              (code && state.iso2 === code) ||
              (name && normalizeLocationName(state.name) === normalizeLocationName(name))
          ) ?? null
        )
      ),
    findCity: jasmine
      .createSpy("findCity")
      .and.callFake((country: string, state: string, name: string) =>
        of(
          (CITIES[`${country}-${state}`] ?? []).find(
            (city) => normalizeLocationName(city.name) === normalizeLocationName(name)
          ) ?? null
        )
      ),
  };
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UserLocationFieldsComponent],
  template: `<div class="p-grid"><app-user-location-fields [formControl]="control" idPrefix="test" /></div>`,
})
class HostComponent {
  control = new FormControl<UserLocation | null>(null);
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UserLocationFieldsComponent],
  template: `<form [formGroup]="form"><app-user-location-fields formControlName="location" /></form>`,
})
class FormGroupHostComponent {
  form = new FormGroup({ location: new FormControl<UserLocation | null>(null) });
}

describe("UserLocationFieldsComponent", () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: UserLocationFieldsComponent;

  function setup(initial: UserLocation | null = null): void {
    TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [{ provide: LocationCatalogService, useValue: createCatalogStub() }],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    host.control.setValue(initial);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    component = fixture.debugElement.query(By.directive(UserLocationFieldsComponent))
      .componentInstance;
  }

  function select(name: "country" | "province" | "city", value: string | null): void {
    component.form.controls[name].setValue(value);
    tick();
    fixture.detectChanges();
  }

  it("ordena los paises por el nombre que se muestra", fakeAsync(() => {
    setup();

    expect(component.countryOptions.map((option) => option.label)).toEqual([
      "Alemania",
      "Ecuador",
      "Gibraltar",
    ]);
  }));

  it("entrega la ubicacion completa al elegir pais, provincia y ciudad", fakeAsync(() => {
    setup();
    expect(host.control.invalid).toBeTrue();

    select("country", "DE");
    select("country", "EC");
    expect(component.stateOptions.length).toBe(2);
    select("province", "P");
    expect(component.showCitySelect).toBeTrue();
    expect(component.cityOptions[0].value).toBe(OTHER_CITY);
    select("city", "Quito");
    component.form.controls.university.setValue("  Universidad Politécnica Salesiana ");
    tick();

    expect(host.control.value).toEqual({
      country_code: "EC",
      country_name: "Ecuador",
      province_code: "P",
      province_name: "Pichincha",
      city_name: "Quito",
      university_name: "Universidad Politécnica Salesiana",
    });
    expect(host.control.valid).toBeTrue();
  }));

  it("limpia provincia y ciudad al cambiar de pais y las envia vacias", fakeAsync(() => {
    setup();
    select("country", "EC");
    select("province", "P");
    select("city", "Quito");

    select("country", "GI");

    expect(component.form.getRawValue()).toEqual(
      jasmine.objectContaining({ province: null, city: null, otherCity: "" })
    );
    expect(host.control.value).toEqual(
      jasmine.objectContaining({
        country_code: "GI",
        country_name: "Gibraltar",
        province_code: "",
        province_name: "",
        city_name: "",
      })
    );
  }));

  it("exige la provincia y habilita la ciudad despues de elegirla", fakeAsync(() => {
    setup();
    expect(component.cityPending).toBeTrue();
    expect(fixture.nativeElement.querySelector("#test-other-city")).toBeNull();

    select("country", "EC");
    component.form.controls.university.setValue("UPS");
    tick();

    expect(component.form.controls.province.hasError("required")).toBeTrue();
    expect(component.cityPending).toBeTrue();
    expect(host.control.invalid).toBeTrue();
    expect(fixture.nativeElement.querySelector("#test-other-city")).toBeNull();

    select("province", "A");
    expect(component.cityPending).toBeFalse();
    expect(component.showOtherCity).toBeTrue();

    component.form.controls.otherCity.setValue("Cuenca");
    tick();
    expect(host.control.valid).toBeTrue();
  }));

  it("no exige provincia si el pais no tiene provincias", fakeAsync(() => {
    setup();
    select("country", "GI");

    expect(component.showProvince).toBeFalse();
    expect(component.form.controls.province.hasError("required")).toBeFalse();
  }));

  it("conserva la ciudad si la provincia se revalida sin cambiar", fakeAsync(() => {
    setup();
    select("country", "EC");
    select("province", "P");
    select("city", "Quito");

    component.form.controls.province.updateValueAndValidity();
    tick();

    expect(component.form.controls.city.value).toBe("Quito");
  }));

  it("pide la ciudad como texto libre si el pais no tiene provincias", fakeAsync(() => {
    setup();
    select("country", "GI");

    expect(component.stateOptions).toEqual([]);
    expect(component.showCitySelect).toBeFalse();
    expect(fixture.nativeElement.querySelector("#test-other-city")).not.toBeNull();
    expect(component.form.controls.otherCity.hasError("required")).toBeTrue();

    component.form.controls.otherCity.setValue("Gibraltar");
    component.form.controls.university.setValue("University of Gibraltar");
    tick();

    expect(host.control.value?.city_name).toBe("Gibraltar");
    expect(host.control.valid).toBeTrue();
  }));

  it("usa el texto libre cuando se elige Otra ciudad", fakeAsync(() => {
    setup();
    select("country", "EC");
    select("province", "P");
    select("city", OTHER_CITY);
    expect(component.form.controls.otherCity.hasError("required")).toBeTrue();

    component.form.controls.otherCity.setValue(" Conocoto ");
    tick();
    expect(host.control.value?.city_name).toBe("Conocoto");

    select("city", "Sangolquí");
    expect(component.form.controls.otherCity.value).toBe("");
    expect(host.control.value?.city_name).toBe("Sangolquí");
  }));

  it("no muestra error en los campos que vacia al cambiar de pais", fakeAsync(() => {
    setup();
    select("country", "GI");
    component.form.controls.otherCity.markAsTouched();
    expect(component.fieldError("otherCity")).toBe("required");

    select("country", "EC");
    select("province", "P");
    select("city", OTHER_CITY);

    expect(component.form.controls.otherCity.touched).toBeFalse();
    expect(component.fieldError("otherCity")).toBeNull();
  }));

  it("precarga un usuario existente sin marcar el formulario como modificado", fakeAsync(() => {
    setup({
      country_code: "ec",
      country_name: "Ecuador",
      province_code: "",
      province_name: "pichincha",
      city_name: "SANGOLQUI",
      university_name: "UPS",
    });

    expect(component.form.getRawValue()).toEqual({
      country: "EC",
      province: "P",
      city: "Sangolquí",
      otherCity: "",
      university: "UPS",
    });
    expect(host.control.dirty).toBeFalse();
    expect(host.control.valid).toBeTrue();
    // El padre recibe la ubicacion completada con el catalogo (codigo de
    // provincia y nombres exactos), sin quedar como modificado.
    expect(host.control.value).toEqual({
      country_code: "EC",
      country_name: "Ecuador",
      province_code: "P",
      province_name: "Pichincha",
      city_name: "Sangolquí",
      university_name: "UPS",
    });
  }));

  it("muestra en Otra ciudad la ciudad que no esta en la libreria", fakeAsync(() => {
    setup({
      country_code: "EC",
      country_name: "Ecuador",
      province_code: "P",
      province_name: "Pichincha",
      city_name: "Conocoto",
      university_name: "UPS",
    });

    expect(component.form.controls.city.value).toBe(OTHER_CITY);
    expect(component.form.controls.otherCity.value).toBe("Conocoto");
    expect(component.buildValue().city_name).toBe("Conocoto");
  }));

  it("conserva la provincia guardada que no esta en el catalogo", fakeAsync(() => {
    setup({
      country_code: "EC",
      country_name: "Ecuador",
      province_code: "",
      province_name: "Galápagos",
      city_name: "Puerto Ayora",
      university_name: "UPS",
    });

    expect(component.preservedProvince).toEqual({ code: "", name: "Galápagos" });
    expect(component.showCitySelect).toBeFalse();
    expect(component.buildValue()).toEqual(
      jasmine.objectContaining({ province_name: "Galápagos", city_name: "Puerto Ayora" })
    );

    select("province", "A");
    expect(component.preservedProvince).toBeNull();
    expect(host.control.value?.province_name).toBe("Azuay");
  }));

  it("descarta un pais guardado que no existe en el catalogo", fakeAsync(() => {
    setup({
      country_code: "ZZ",
      country_name: "",
      province_code: "",
      province_name: "",
      city_name: "",
      university_name: "",
    });

    expect(component.form.controls.country.value).toBeNull();
    expect(host.control.invalid).toBeTrue();
  }));

  it("muestra los errores cuando el formulario padre se marca como tocado", fakeAsync(() => {
    setup();
    expect(fixture.nativeElement.querySelectorAll(".p-error").length).toBe(0);

    host.control.markAsTouched();
    fixture.detectChanges();

    expect(component.form.controls.country.touched).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll(".p-error").length).toBeGreaterThan(0);
    expect(component.labelledBy("country")).toBe("test-country-label test-country-error");
    expect(fixture.nativeElement.querySelector("#test-country-error")).not.toBeNull();
  }));

  it("muestra los errores con formControlName al marcar todo el formulario", fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormGroupHostComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [{ provide: LocationCatalogService, useValue: createCatalogStub() }],
    });
    const groupFixture = TestBed.createComponent(FormGroupHostComponent);
    groupFixture.detectChanges();
    tick();

    groupFixture.componentInstance.form.markAllAsTouched();
    groupFixture.detectChanges();

    expect(groupFixture.nativeElement.querySelectorAll(".p-error").length).toBeGreaterThan(0);
  }));

  it("valida el largo maximo de la universidad", fakeAsync(() => {
    setup();
    component.form.controls.university.setValue("x".repeat(201));
    component.form.controls.university.markAsTouched();

    expect(component.fieldError("university")).toBe("maxlength");
  }));
});
