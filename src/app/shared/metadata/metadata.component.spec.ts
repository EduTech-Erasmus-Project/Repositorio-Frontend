import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MetadataComponent } from "./metadata.component";

describe("MetadataComponent", () => {
  let fixture: ComponentFixture<MetadataComponent>;
  let component: MetadataComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataComponent],
    })
      .overrideComponent(MetadataComponent, {
        set: { template: "" },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataComponent);
    component = fixture.componentInstance;
    component.learningobjectdetail = {
      general_catalog: "LOM",
      educational_description: "Descripcion educativa",
      life_cycle_dateTime: "2026-06-24T00:00:00.000Z",
    } as any;
    fixture.detectChanges();
  });

  it("debe construir las secciones esperadas del detalle de metadatos", () => {
    const sections = component.metadataSections;

    expect(sections.length).toBeGreaterThan(5);
    expect(sections[0].title).toBe("General");
    expect(sections.some((section) => section.key === "accessibility")).toBeTrue();
  });

  it("debe normalizar valores faltantes con fallback legible", () => {
    expect(component.displayValue(undefined, "N/A")).toBe("N/A");
    expect(component.displayValue("Activo")).toBe("Activo");
  });

  it("debe identificar cuando una fila tiene fecha valida para mostrar", () => {
    expect(component.hasDisplayDate("2026-06-24T00:00:00.000Z")).toBeTrue();
    expect(component.hasDisplayDate("")).toBeFalse();
  });
});
