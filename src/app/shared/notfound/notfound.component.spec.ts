import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NotfoundComponent } from "./notfound.component";

describe("NotfoundComponent", () => {
  let component: NotfoundComponent;
  let fixture: ComponentFixture<NotfoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotfoundComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(NotfoundComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(NotfoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("crea el componente de notfound", () => {
    expect(component).toBeTruthy();
  });

  it("expone rutas compartidas para volver al inicio y buscar", () => {
    expect(component.homeRoute).toEqual(["/"]);
    expect(component.searchRoute).toEqual(["/search"]);
  });
});
