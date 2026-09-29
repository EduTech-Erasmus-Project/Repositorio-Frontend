import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AccessdeniedComponent } from "./accessdenied.component";

describe("AccessdeniedComponent", () => {
  let component: AccessdeniedComponent;
  let fixture: ComponentFixture<AccessdeniedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessdeniedComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(AccessdeniedComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(AccessdeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("crea el componente de acceso denegado", () => {
    expect(component).toBeTruthy();
  });

  it("expone una ruta de retorno al inicio", () => {
    expect(component.homeRoute).toEqual(["/"]);
  });
});
