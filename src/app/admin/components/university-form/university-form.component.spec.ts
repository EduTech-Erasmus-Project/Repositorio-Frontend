import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { UniversityFormComponent } from "./university-form.component";

describe("UniversityFormComponent", () => {
  let fixture: ComponentFixture<UniversityFormComponent>;
  let component: UniversityFormComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snapshotParams: any;

  beforeEach(async () => {
    snapshotParams = { id: "new" };
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getCountriesActive",
      "getUniversityById",
      "createUniversity",
      "updateUniversity",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    addressServiceSpy.getCountriesActive.and.returnValue(
      of([{ id: 1, name: "Ecuador" }])
    );
    addressServiceSpy.getUniversityById.and.returnValue(
      of({
        id: 11,
        name: "UPS",
        country: 1,
        is_active: true,
      } as any)
    );
    addressServiceSpy.createUniversity.and.returnValue(of({ id: 11 }));
    addressServiceSpy.updateUniversity.and.returnValue(of({ id: 11 }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [UniversityFormComponent],
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
      .overrideComponent(UniversityFormComponent, {
        set: { template: "" },
      })
      .compileComponents();

    spyOn(Swal, "fire");
  });

  function createComponent() {
    fixture = TestBed.createComponent(UniversityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe cargar paises activos al iniciar", async () => {
    createComponent();
    await fixture.whenStable();

    expect(addressServiceSpy.getCountriesActive).toHaveBeenCalled();
    expect(component.countries).toEqual([{ id: 1, name: "Ecuador" }] as any);
  });

  it("debe precargar la universidad en edicion convirtiendo el pais a id", async () => {
    snapshotParams = { id: "11" };

    createComponent();
    await fixture.whenStable();

    expect(addressServiceSpy.getUniversityById).toHaveBeenCalledWith(11);
    expect(component.form.value).toEqual(
      jasmine.objectContaining({
        name: "UPS",
        country: 1,
        is_active: true,
      })
    );
  });

  it("debe crear la universidad en mayusculas", async () => {
    createComponent();
    await fixture.whenStable();
    component.form.patchValue({
      name: "Uda",
      country: 1,
      is_active: true,
    });

    await component.onSave();

    expect(addressServiceSpy.createUniversity).toHaveBeenCalledWith({
      name: "UDA",
      country: 1,
      is_active: true,
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/university"]);
  });

  it("debe actualizar la universidad cuando existe id", async () => {
    snapshotParams = { id: "11" };

    createComponent();
    await fixture.whenStable();
    component.form.patchValue({
      name: "Utpl",
      country: 1,
      is_active: false,
    });

    await component.onSave();

    expect(addressServiceSpy.updateUniversity).toHaveBeenCalledWith(11, {
      name: "UTPL",
      country: 1,
      is_active: false,
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/university"]);
  });
});
