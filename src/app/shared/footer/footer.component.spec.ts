import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FooterComponent } from "./footer.component";

describe("FooterComponent", () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FooterComponent],
    })
      .overrideComponent(FooterComponent, {
        set: { template: "" },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("debe exponer el anio actual del footer compartido", () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it("debe usar una ruta absoluta para terminos y condiciones", () => {
    expect(component.termsRoute).toEqual(["/terms-and-conditions"]);
  });
});
