import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { CitiesFormComponent } from "./cities-form.component";

describe("CitiesFormComponent", () => {
  let fixture: ComponentFixture<CitiesFormComponent>;
  let component: CitiesFormComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snapshotParams: any;

  beforeEach(async () => {
    snapshotParams = { id: "new" };
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getCountriesActive",
      "getCityById",
      "getProvinceById",
      "getProvincesByCountry",
      "createCity",
      "updateCity",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    addressServiceSpy.getCountriesActive.and.returnValue(
      of([{ id: 1, name: "Ecuador" }])
    );
    addressServiceSpy.getProvincesByCountry.and.returnValue(
      of([{ id: 9, name: "Azuay" }])
    );
    addressServiceSpy.getProvinceById.and.returnValue(
      of({ id: 9, name: "Azuay", country: 1 })
    );
    addressServiceSpy.getCityById.and.returnValue(
      of({
        id: 5,
        name: "Cuenca",
        province: { id: 9, name: "Azuay", country: 1 },
        is_active: true,
      } as any)
    );
    addressServiceSpy.createCity.and.returnValue(of({ id: 5 }));
    addressServiceSpy.updateCity.and.returnValue(of({ id: 5 }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CitiesFormComponent],
      providers: [
        { provide: AddressService, useValue: addressServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get params() {
                return snapshotParams;
              },
            },
          },
        },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        {
          provide: AdminComponent,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CitiesFormComponent, {
        set: { template: "" },
      })
      .compileComponents();

    spyOn(Swal, "fire");
  });

  async function createComponent() {
    fixture = TestBed.createComponent(CitiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it("debe cargar paises activos al iniciar", async () => {
    await createComponent();

    expect(addressServiceSpy.getCountriesActive).toHaveBeenCalled();
    expect(component.countries).toEqual([{ id: 1, name: "Ecuador" }] as any);
  });

  it("debe cargar el formulario en edicion resolviendo pais y provincias desde la provincia", async () => {
    snapshotParams = { id: "5" };

    await createComponent();
    await (component as any).loadById();

    expect(addressServiceSpy.getCityById).toHaveBeenCalledWith(5);
    expect(addressServiceSpy.getProvinceById).toHaveBeenCalledWith(9);
    expect(addressServiceSpy.getProvincesByCountry).toHaveBeenCalledWith(1);
    expect(component.provinces).toEqual([{ id: 9, name: "Azuay" }] as any);
    expect(component.form.value).toEqual(
      jasmine.objectContaining({
        name: "Cuenca",
        country: 1,
        province: 9,
        is_active: true,
      })
    );
  });

  it("debe recargar provincias al cambiar el pais y limpiar la provincia actual", async () => {
    await createComponent();
    component.form.patchValue({
      country: 1,
      province: 9,
    });

    await component.onChangeCountry();

    expect(addressServiceSpy.getProvincesByCountry).toHaveBeenCalledWith(1);
    expect(component.form.value.province).toBeNull();
    expect(component.provinces).toEqual([{ id: 9, name: "Azuay" }] as any);
  });

  it("debe crear la ciudad en mayusculas cuando el formulario es valido", async () => {
    await createComponent();
    component.form.patchValue({
      name: "Cuenca",
      country: 1,
      province: 9,
      is_active: true,
    });

    await component.onSave();

    expect(addressServiceSpy.createCity).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: "CUENCA",
        country: 1,
        province: 9,
        is_active: true,
      })
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/city"]);
  });

  it("debe actualizar la ciudad en mayusculas cuando existe id", async () => {
    snapshotParams = { id: "5" };

    await createComponent();
    await (component as any).loadById();
    component.form.patchValue({
      name: "Giron",
      country: 1,
      province: 9,
      is_active: false,
    });

    await component.onSave();

    expect(addressServiceSpy.updateCity).toHaveBeenCalledWith(
      5,
      jasmine.objectContaining({
        name: "GIRON",
        country: 1,
        province: 9,
        is_active: false,
      })
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/city"]);
  });
});
