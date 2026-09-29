import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { UserService } from "../../services/user.service";
import { AddressService } from "../../services/address.service";
import { ReportComponent } from "./report.component";

describe("ReportComponent", () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let addressServiceSpy: jasmine.SpyObj<AddressService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>("UserService", ["getReportUsers"]);
    addressServiceSpy = jasmine.createSpyObj<AddressService>("AddressService", [
      "getCitiesActive",
      "getUniversitiesActive",
      "getCampusActive",
    ]);

    addressServiceSpy.getCitiesActive.and.returnValue(of([{ id: 1, name: "Quito" }]));
    addressServiceSpy.getUniversitiesActive.and.returnValue(of([{ id: 2, name: "UPS" }]));
    addressServiceSpy.getCampusActive.and.returnValue(of([{ id: 3, name: "Sur" }]));
    userServiceSpy.getReportUsers.and.returnValue(
      of({
        count: 1,
        pages: 1,
        links: { next: "", previous: "" },
        results: [
          {
            id: 10,
            first_name: "Ana",
            last_name: "Perez",
            email: "ana@test.com",
            learning_objects: [],
          },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ReportComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AddressService, useValue: addressServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
            },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ReportComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar catalogos base en ngOnInit", fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(addressServiceSpy.getCitiesActive).toHaveBeenCalled();
    expect(addressServiceSpy.getUniversitiesActive).toHaveBeenCalled();
    expect(addressServiceSpy.getCampusActive).toHaveBeenCalled();
    expect(component.cities.length).toBe(1);
    expect(component.universities.length).toBe(1);
    expect(component.campus.length).toBe(1);
  }));

  it("debe cargar la primera pagina del reporte con los filtros actuales", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({
      query: "ana",
      upload: "all",
    });

    await component.listLearningObject();

    expect(userServiceSpy.getReportUsers).toHaveBeenCalled();
    expect(component.data.length).toBe(1);
    expect(component.totalRecords).toBe(1);
    expect(component.currentPage).toBe(1);
    expect(component.hasSearched).toBeTrue();
  });

  it("debe mapear filas de exportacion incluyendo OAs del usuario", () => {
    const rows = component.mapUsersToExportRows([
      {
        first_name: "Ana",
        last_name: "Perez",
        email: "ana@test.com",
        country: { name: "Ecuador" },
        province: { name: "Pichincha" },
        city: { name: "Quito" },
        university: { name: "UPS" },
        campus: { name: "Sur" },
        learning_objects: [
          {
            general_title: "OA 1",
            learning_object_file: { url: "https://example.com/oa1" },
          },
        ],
      },
    ]);

    expect(Array.isArray(rows[0])).toBeTrue();
    expect((rows[0] as Array<Record<string, string | undefined>>)[0].OA).toBe("OA 1");
  });
});
