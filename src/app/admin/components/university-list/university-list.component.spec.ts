import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import Swal from "sweetalert2";
import { MessageService } from "primeng/api";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { AdminComponent } from "../../admin.component";
import { AddressService } from "../../services/address.service";
import { UniversityListComponent } from "./university-list.component";

describe("UniversityListComponent", () => {
  let fixture: ComponentFixture<UniversityListComponent>;
  let component: UniversityListComponent;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    addressServiceSpy = jasmine.createSpyObj("AddressService", [
      "getAllUniversities",
      "deleteUniversity",
    ]);
    messageServiceSpy = jasmine.createSpyObj("MessageService", ["add"]);

    addressServiceSpy.getAllUniversities.and.returnValue(
      of([{ id: 11, name: "UPS", is_active: true, country: { name: "ECUADOR" } } as any])
    );
    addressServiceSpy.deleteUniversity.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [UniversityListComponent],
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
      .overrideComponent(UniversityListComponent, { set: { template: "" } })
      .compileComponents();

    spyOn(Swal, "fire").and.resolveTo({ isConfirmed: true } as any);
    spyOn(Swal, "showLoading");
    spyOn(Swal, "hideLoading");

    fixture = TestBed.createComponent(UniversityListComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar las universidades al iniciar", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(addressServiceSpy.getAllUniversities).toHaveBeenCalled();
    expect(component.universities[0].name).toBe("UPS");
    expect(component.isLoading).toBeFalse();
  });

  it("debe eliminar una universidad y refrescar la lista", async () => {
    await component.onDelete(11);

    expect(addressServiceSpy.deleteUniversity).toHaveBeenCalledWith(11);
    expect(addressServiceSpy.getAllUniversities).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: "success",
      summary: "Eliminado",
      detail: "Universidad eliminada correctamente",
    });
  });
});
