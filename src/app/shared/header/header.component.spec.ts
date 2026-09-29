import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HeaderComponent } from "./header.component";

describe("HeaderComponent", () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
    }).compileComponents();
  });

  function createComponent() {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  }

  it("debe renderizar el titulo recibido por input", () => {
    createComponent();
    component.header_title = "Panel principal";
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("h2").textContent.trim()).toBe(
      "Panel principal"
    );
  });

  it("debe aplicar el alto y tamano de texto configurados", () => {
    createComponent();
    component.header_title = "Busqueda";
    component.header_height = 25;
    component.header_text_size = 30;
    fixture.detectChanges();

    const wrapper: HTMLElement = fixture.nativeElement.querySelector(".header-component");
    const title: HTMLElement = fixture.nativeElement.querySelector("h2");

    expect(wrapper.getAttribute("style")).toContain("height: 25vh");
    expect(title.getAttribute("style")).toContain("font-size: 30px");
  });
});
