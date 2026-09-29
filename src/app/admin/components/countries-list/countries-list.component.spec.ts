import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { CountriesListComponent } from "./countries-list.component";

describe("CountriesListComponent", () => {
  let fixture: ComponentFixture<CountriesListComponent>;
  let component: CountriesListComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getAllCountries",
      "deleteCountry",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    addressServiceSpy.getAllCountries.and.returnValue(
      of([{ id: 1, name: "ECUADOR", is_active: true }])
    );
    addressServiceSpy.deleteCountry.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [CountriesListComponent],
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
      .overrideComponent(CountriesListComponent, { set: { template: "" } })
      .compileComponents();

    spyOn(Swal, "fire").and.resolveTo({ isConfirmed: true } as any);
    spyOn(Swal, "showLoading");
    spyOn(Swal, "hideLoading");

    fixture = TestBed.createComponent(CountriesListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar los paises al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(addressServiceSpy.getAllCountries).toHaveBeenCalled();
    expect(component.countries.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it("debe eliminar un pais y recargar la tabla", async () => {
    await component.onDelete(1);

    expect(addressServiceSpy.deleteCountry).toHaveBeenCalledWith(1);
    expect(addressServiceSpy.getAllCountries).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "success",
      summary: "Eliminado",
      detail: "Pais eliminado correctamente",
    });
  });
});
