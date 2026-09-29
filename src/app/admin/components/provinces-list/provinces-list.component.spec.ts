import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { ProvincesListComponent } from "./provinces-list.component";

describe("ProvincesListComponent", () => {
  let fixture: ComponentFixture<ProvincesListComponent>;
  let component: ProvincesListComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getAllProvinces",
      "deleteProvince",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    addressServiceSpy.getAllProvinces.and.returnValue(
      of([{ id: 5, name: "AZUAY", is_active: true, country: { name: "ECUADOR" } } as any])
    );
    addressServiceSpy.deleteProvince.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [ProvincesListComponent],
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
      .overrideComponent(ProvincesListComponent, { set: { template: "" } })
      .compileComponents();

    spyOn(Swal, "fire").and.resolveTo({ isConfirmed: true } as any);
    spyOn(Swal, "showLoading");
    spyOn(Swal, "hideLoading");

    fixture = TestBed.createComponent(ProvincesListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar las provincias al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(addressServiceSpy.getAllProvinces).toHaveBeenCalled();
    expect(component.provinces[0].name).toBe("AZUAY");
    expect(component.isLoading).toBeFalse();
  });

  it("debe eliminar una provincia y refrescar la lista", async () => {
    await component.onDelete(5);

    expect(addressServiceSpy.deleteProvince).toHaveBeenCalledWith(5);
    expect(addressServiceSpy.getAllProvinces).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "success",
      summary: "Eliminado",
      detail: "Provincia eliminada correctamente",
    });
  });
});
