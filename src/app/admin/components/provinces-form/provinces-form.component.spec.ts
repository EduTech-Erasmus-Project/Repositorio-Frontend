import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { ProvincesFormComponent } from "./provinces-form.component";

describe("ProvincesFormComponent", () => {
  let fixture: ComponentFixture<ProvincesFormComponent>;
  let component: ProvincesFormComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snapshotParams: any;

  beforeEach(async () => {
    snapshotParams = { id: "new" };
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getCountriesActive",
      "getProvinceById",
      "createProvince",
      "updateProvince",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    addressServiceSpy.getCountriesActive.and.returnValue(
      of([{ id: 1, name: "Ecuador" }])
    );
    addressServiceSpy.getProvinceById.and.returnValue(
      of({
        id: 9,
        name: "Azuay",
        country: 1,
        is_active: true,
      } as any)
    );
    addressServiceSpy.createProvince.and.returnValue(of({ id: 9 }));
    addressServiceSpy.updateProvince.and.returnValue(of({ id: 9 }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ProvincesFormComponent],
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
      .overrideComponent(ProvincesFormComponent, {
        set: { template: "" },
      })
      .compileComponents();

    spyOn(Swal, "fire");
  });

  function createComponent() {
    fixture = TestBed.createComponent(ProvincesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe cargar paises activos al iniciar", async () => {
    createComponent();
    await fixture.whenStable();

    expect(addressServiceSpy.getCountriesActive).toHaveBeenCalled();
    expect(component.countries).toEqual([{ id: 1, name: "Ecuador" }] as any);
  });

  it("debe precargar la provincia en edicion convirtiendo el pais a id", async () => {
    snapshotParams = { id: "9" };

    createComponent();
    await fixture.whenStable();

    expect(addressServiceSpy.getProvinceById).toHaveBeenCalledWith(9);
    expect(component.form.value).toEqual(
      jasmine.objectContaining({
        name: "Azuay",
        country: 1,
        is_active: true,
      })
    );
  });

  it("debe crear la provincia en mayusculas", async () => {
    createComponent();
    await fixture.whenStable();
    component.form.patchValue({
      name: "Cañar",
      country: 1,
      is_active: true,
    });

    await component.onSave();

    expect(addressServiceSpy.createProvince).toHaveBeenCalledWith({
      name: "CAÑAR",
      country: 1,
      is_active: true,
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/province"]);
  });

  it("debe actualizar la provincia cuando existe id", async () => {
    snapshotParams = { id: "9" };

    createComponent();
    await fixture.whenStable();
    component.form.patchValue({
      name: "Loja",
      country: 1,
      is_active: false,
    });

    await component.onSave();

    expect(addressServiceSpy.updateProvince).toHaveBeenCalledWith(9, {
      name: "LOJA",
      country: 1,
      is_active: false,
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/province"]);
  });
});
