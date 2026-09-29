import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { CountriesFormComponent } from "./countries-form.component";

describe("CountriesFormComponent", () => {
  let fixture: ComponentFixture<CountriesFormComponent>;
  let component: CountriesFormComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snapshotParams: any;

  beforeEach(async () => {
    snapshotParams = { id: "new" };
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getCountryById",
      "createCountry",
      "updateCountry",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    addressServiceSpy.getCountryById.and.returnValue(
      of({
        id: 1,
        name: "Ecuador",
        is_active: true,
      })
    );
    addressServiceSpy.createCountry.and.returnValue(of({ id: 1 }));
    addressServiceSpy.updateCountry.and.returnValue(of({ id: 1 }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CountriesFormComponent],
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
      .overrideComponent(CountriesFormComponent, {
        set: { template: "" },
      })
      .compileComponents();

    spyOn(Swal, "fire");
  });

  function createComponent() {
    fixture = TestBed.createComponent(CountriesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe iniciar el formulario para creacion", () => {
    createComponent();

    expect(component.form.value).toEqual({
      name: null,
      is_active: true,
    });
  });

  it("debe precargar el pais en edicion", async () => {
    snapshotParams = { id: "1" };

    createComponent();
    await fixture.whenStable();

    expect(addressServiceSpy.getCountryById).toHaveBeenCalledWith(1);
    expect(component.form.value).toEqual({
      name: "Ecuador",
      is_active: true,
    });
  });

  it("debe crear el pais en mayusculas", async () => {
    createComponent();
    component.form.patchValue({
      name: "Peru",
      is_active: true,
    });

    await component.onSave();

    expect(addressServiceSpy.createCountry).toHaveBeenCalledWith({
      name: "PERU",
      is_active: true,
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/country"]);
  });

  it("debe actualizar el pais cuando existe id", async () => {
    snapshotParams = { id: "1" };

    createComponent();
    await fixture.whenStable();
    component.form.patchValue({
      name: "Colombia",
      is_active: false,
    });

    await component.onSave();

    expect(addressServiceSpy.updateCountry).toHaveBeenCalledWith(1, {
      name: "COLOMBIA",
      is_active: false,
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/country"]);
  });
});
