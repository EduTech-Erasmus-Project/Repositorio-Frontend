import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { CitiesListComponent } from "./cities-list.component";

describe("CitiesListComponent", () => {
  let fixture: ComponentFixture<CitiesListComponent>;
  let component: CitiesListComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getAllCities",
      "deleteCity",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    addressServiceSpy.getAllCities.and.returnValue(
      of([{ id: 7, name: "CUENCA", is_active: true, province: { name: "AZUAY" } } as any])
    );
    addressServiceSpy.deleteCity.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [CitiesListComponent],
      providers: [
        { provide: AddressService, useValue: addressServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: BreadcrumbService,
          useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]),
        },
        { provide: AdminComponent, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CitiesListComponent, { set: { template: "" } })
      .compileComponents();

    spyOn(Swal, "fire").and.resolveTo({ isConfirmed: true } as any);
    spyOn(Swal, "showLoading");
    spyOn(Swal, "hideLoading");

    fixture = TestBed.createComponent(CitiesListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar las ciudades al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(addressServiceSpy.getAllCities).toHaveBeenCalled();
    expect(component.cities[0].name).toBe("CUENCA");
    expect(component.isLoading).toBeFalse();
  });

  it("debe eliminar una ciudad y refrescar la lista", async () => {
    await component.onDelete(7);

    expect(addressServiceSpy.deleteCity).toHaveBeenCalledWith(7);
    expect(addressServiceSpy.getAllCities).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "success",
      summary: "Eliminado",
      detail: "Ciudad eliminada correctamente",
    });
  });
});
