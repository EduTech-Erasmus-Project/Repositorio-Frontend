import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LinkTypeIconComponent } from "./link-type-icon.component";

describe("LinkTypeIconComponent", () => {
  let fixture: ComponentFixture<LinkTypeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LinkTypeIconComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(LinkTypeIconComponent);
  });

  function render(type: string): HTMLElement {
    fixture.componentRef.setInput("type", type);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("debe dibujar el logo de marca con su color", () => {
    const path = render("orcid").querySelector("svg path");
    expect(path?.getAttribute("fill")).toBe("#A6CE39");
    expect(path?.getAttribute("d")).toContain("M12 0C5.372");
  });

  it("debe usar un icono generico para los tipos sin marca", () => {
    const element = render("website");
    expect(element.querySelector("svg")).toBeNull();
    expect(element.querySelector("i")?.className).toContain("pi-globe");
    expect(element.querySelector("i")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("debe usar pi-building para la pagina institucional", () => {
    expect(render("institutional").querySelector("i")?.className).toContain("pi-building");
  });
});
