import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { CampusListComponent } from "./campus-list.component";

describe("CampusListComponent", () => {
  let fixture: ComponentFixture<CampusListComponent>;
  let component: CampusListComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getAllCampus",
      "deleteCampus",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    addressServiceSpy.getAllCampus.and.returnValue(
      of([
        {
          id: 21,
          name: "MATRIZ",
          address: "Elia Liut",
          is_active: true,
          university: { name: "UPS" },
          city: { name: "CUENCA" },
        } as any,
      ])
    );
    addressServiceSpy.deleteCampus.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [CampusListComponent],
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
      .overrideComponent(CampusListComponent, { set: { template: "" } })
      .compileComponents();

    spyOn(Swal, "fire").and.resolveTo({ isConfirmed: true } as any);
    spyOn(Swal, "showLoading");
    spyOn(Swal, "hideLoading");

    fixture = TestBed.createComponent(CampusListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar los campus al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(addressServiceSpy.getAllCampus).toHaveBeenCalled();
    expect(component.campus[0].name).toBe("MATRIZ");
    expect(component.isLoading).toBeFalse();
  });

  it("debe eliminar un campus y refrescar la lista", async () => {
    await component.onDelete(21);

    expect(addressServiceSpy.deleteCampus).toHaveBeenCalledWith(21);
    expect(addressServiceSpy.getAllCampus).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "success",
      summary: "Eliminado",
      detail: "Campus eliminado correctamente",
    });
  });
});
