import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { UserService } from "../../services/user.service";
import { LocationCatalogService } from "src/app/services/location-catalog.service";
import { ReportComponent } from "./report.component";

describe("ReportComponent", () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let catalogSpy: jasmine.SpyObj<LocationCatalogService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>("UserService", ["getReportUsers"]);
    catalogSpy = jasmine.createSpyObj<LocationCatalogService>("LocationCatalogService", ["getCountries"]);
    catalogSpy.getCountries.and.returnValue(
      of([
        { iso2: "EC", name: "Ecuador", name_es: "Ecuador", emoji: "" },
        { iso2: "DE", name: "Germany", name_es: "Alemania", emoji: "" },
      ])
    );
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
        { provide: LocationCatalogService, useValue: catalogSpy },
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

  it("debe cargar los paises del filtro en espanol y ordenados", fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(catalogSpy.getCountries).toHaveBeenCalled();
    expect(component.countryOptions).toEqual([
      { label: "Alemania", value: "DE" },
      { label: "Ecuador", value: "EC" },
    ]);
  }));

  it("debe enviar solo los filtros de ubicacion con valor", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({
      country: "EC",
      province: "  ",
      city: " Quito ",
      university: "Salesiana",
    });

    await component.listLearningObject();

    const params = userServiceSpy.getReportUsers.calls.mostRecent().args[0];
    expect(params).toEqual(
      jasmine.objectContaining({ country: "EC", city: "Quito", university: "Salesiana" })
    );
    expect("province" in params).toBeFalse();
    expect("campus" in params).toBeFalse();
  });

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
        country_code: "EC",
        country_name: "Ecuador",
        province_code: "P",
        province_name: "Pichincha",
        city_name: "Quito",
        university_name: "UPS",
        learning_objects: [
          {
            general_title: "OA 1",
            learning_object_file: { url: "https://example.com/oa1" },
          },
        ],
      },
    ]);

    expect(Array.isArray(rows[0])).toBeTrue();
    const row = (rows[0] as Array<Record<string, string | undefined>>)[0];
    expect(row).toEqual(
      jasmine.objectContaining({
        Pais: "Ecuador",
        Provincia: "Pichincha",
        Ciudad: "Quito",
        Universidad: "UPS",
        OA: "OA 1",
      })
    );
    expect("Campus" in row).toBeFalse();
  });

  it("debe mostrar la ubicacion en una sola columna", () => {
    expect(
      component.getLocationLabel({ city_name: "Quito", province_name: "Pichincha", country_name: "Ecuador" })
    ).toBe("Quito, Pichincha, Ecuador");
    expect(component.getLocationLabel({ city_name: "Macao", country_name: "Macau S.A.R." })).toBe(
      "Macao, Macau S.A.R."
    );
    expect(component.getLocationLabel({})).toBe("-");
  });
});
