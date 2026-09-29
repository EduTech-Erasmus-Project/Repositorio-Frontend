import { Location } from "@angular/common";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ErrorComponent } from "./error.component";

describe("ErrorComponent", () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj("Location", ["back"]);

    await TestBed.configureTestingModule({
      declarations: [ErrorComponent],
      providers: [{ provide: Location, useValue: locationSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(ErrorComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("crea el componente de error", () => {
    expect(component).toBeTruthy();
  });

  it("vuelve a la pagina anterior cuando se invoca goBack", () => {
    component.goBack();

    expect(locationSpy.back).toHaveBeenCalled();
  });
});
