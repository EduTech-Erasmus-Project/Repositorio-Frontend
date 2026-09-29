import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { CampusFormComponent } from "./campus-form.component";

describe("CampusFormComponent", () => {
  let fixture: ComponentFixture<CampusFormComponent>;
  let component: CampusFormComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snapshotParams: any;

  beforeEach(async () => {
    snapshotParams = { id: "new" };
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getCitiesActive",
      "getAllUniversities",
      "getCampusById",
      "createCampus",
      "updateCampus",
    ]);
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

    addressServiceSpy.getCitiesActive.and.returnValue(
      of([{ id: 3, name: "Cuenca" }])
    );
    addressServiceSpy.getAllUniversities.and.returnValue(
      of([{ id: 7, name: "UPS" }])
    );
    addressServiceSpy.getCampusById.and.returnValue(
      of({
        id: 11,
        name: "El Vecino",
        address: "Av. de las Americas",
        city: { id: 3, name: "Cuenca" },
        university: { id: 7, name: "UPS" },
        is_active: true,
      } as any)
    );
    addressServiceSpy.createCampus.and.returnValue(of({ id: 11 }));
    addressServiceSpy.updateCampus.and.returnValue(of({ id: 11 }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CampusFormComponent],
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
      .overrideComponent(CampusFormComponent, {
        set: { template: "" },
      })
      .compileComponents();

    spyOn(Swal, "fire");
  });

  function createComponent() {
    fixture = TestBed.createComponent(CampusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("debe cargar ciudades y universidades al iniciar", async () => {
    createComponent();
    await fixture.whenStable();

    expect(addressServiceSpy.getCitiesActive).toHaveBeenCalled();
    expect(addressServiceSpy.getAllUniversities).toHaveBeenCalled();
    expect(component.cities).toEqual([{ id: 3, name: "Cuenca" }] as any);
    expect(component.universities).toEqual([{ id: 7, name: "UPS" }] as any);
  });

  it("debe precargar campus en edicion convirtiendo ciudad y universidad a ids", async () => {
    snapshotParams = { id: "11" };

    createComponent();
    await fixture.whenStable();

    expect(addressServiceSpy.getCampusById).toHaveBeenCalledWith(11);
    expect(component.form.value).toEqual(
      jasmine.objectContaining({
        name: "El Vecino",
        address: "Av. de las Americas",
        city: 3,
        university: 7,
        is_active: true,
      })
    );
  });

  it("debe crear el campus en mayusculas cuando el formulario es valido", async () => {
    createComponent();
    await fixture.whenStable();
    component.form.patchValue({
      name: "Norte",
      address: "Av. Loja",
      city: 3,
      university: 7,
      is_active: true,
    });

    await component.onSave();

    expect(addressServiceSpy.createCampus).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: "NORTE",
        address: "Av. Loja",
        city: 3,
        university: 7,
        is_active: true,
      })
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/campus"]);
  });

  it("debe actualizar el campus cuando existe id", async () => {
    snapshotParams = { id: "11" };

    createComponent();
    await fixture.whenStable();
    component.form.patchValue({
      name: "Sur",
      address: "Av. Solano",
      city: 3,
      university: 7,
      is_active: false,
    });

    await component.onSave();

    expect(addressServiceSpy.updateCampus).toHaveBeenCalledWith(
      11,
      jasmine.objectContaining({
        name: "SUR",
        address: "Av. Solano",
        city: 3,
        university: 7,
        is_active: false,
      })
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/admin/config/campus"]);
  });
});
