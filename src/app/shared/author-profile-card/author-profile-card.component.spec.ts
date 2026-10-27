import { Component, Input, Pipe, PipeTransform } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import {
  AuthorProfileCardComponent,
  AuthorProfileCardData,
} from "./author-profile-card.component";

@Pipe({
  name: "translate",
  standalone: false,
})
class TranslatePipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Component({
  selector: "p-tag",
  template: "<span class='tag-stub'>{{ value }}</span>",
  standalone: false,
})
class PTagStubComponent {
  @Input() value = "";
  @Input() severity = "";
  @Input() icon = "";
}

describe("AuthorProfileCardComponent", () => {
  let fixture: ComponentFixture<AuthorProfileCardComponent>;
  let component: AuthorProfileCardComponent;
  let translateMock: { currentLang: string; onLangChange: Subject<{ lang: string }> };

  const fullProfile: AuthorProfileCardData = {
    first_name: "Juan",
    last_name: "Perez",
    email: "jperez@ups.edu.ec",
    image_url: null,
    university_name: "Universidad Politecnica Salesiana",
    professions: [{ id: 4, description: "Ingeniero Civil" }],
    knowledge_areas: [{ id: 7, name_es: "Ingenieria", name_en: "Engineering" }],
    member_since: 2021,
    highest_degree: "phd",
    headline: "Docente de Ingenieria Civil",
    faculty: "Ingenieria",
    bio: "Investigo sobre hidraulica.",
    research_lines: ["Hidraulica", "Suelos"],
    subjects: ["Mecanica de suelos"],
    research_group: "GIIT",
    links: [
      { type: "website", url: "https://mi-sitio.ec", order: 2 },
      { type: "orcid", url: "https://orcid.org/0000-0002-1825-0097", order: 1 },
    ],
    degrees: [{ level: "phd", title: "Doctor en Ingenieria", institution: "UPM", year: 2019 }],
  };

  function render(profile: AuthorProfileCardData, extra: Record<string, unknown> = {}) {
    fixture.componentRef.setInput("profile", profile);
    Object.entries(extra).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    translateMock = { currentLang: "es", onLangChange: new Subject() };

    await TestBed.configureTestingModule({
      declarations: [AuthorProfileCardComponent, TranslatePipeMock, PTagStubComponent],
      providers: [{ provide: LanguageService, useValue: { translate: translateMock } }],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorProfileCardComponent);
    component = fixture.componentInstance;
  });

  it("debe mostrar la cabecera con nombre, iniciales e institucion", () => {
    const element = render(fullProfile);

    expect(element.querySelector("h2")?.textContent).toContain("Juan Perez");
    expect(element.querySelector(".author-profile-card-avatar-fallback")?.textContent).toContain("JP");
    expect(element.textContent).toContain("Universidad Politecnica Salesiana");
    expect(element.textContent).toContain("jperez@ups.edu.ec");
  });

  it("debe mostrar los campos opcionales y los links ordenados", () => {
    const element = render(fullProfile);

    expect(element.textContent).toContain("Investigo sobre hidraulica.");
    expect(element.textContent).toContain("GIIT");
    // La ubicacion no se muestra: el perfil publico solo trae la universidad.
    expect(element.textContent).not.toContain("Cuenca, Ecuador");
    const linkLabels = Array.from(element.querySelectorAll(".author-profile-card-external")).map(
      (link) => link.getAttribute("href")
    );
    expect(linkLabels).toEqual(["https://orcid.org/0000-0002-1825-0097", "https://mi-sitio.ec"]);
  });

  it("no debe pintar secciones de campos que no vienen", () => {
    const element = render({
      first_name: "Ana",
      last_name: "Mora",
      links: [],
      degrees: [],
    });

    expect(element.querySelector(".author-profile-card-section")).toBeNull();
    expect(element.textContent).toContain("authorProfile.empty");
  });

  it("debe usar el nombre del area segun el idioma", () => {
    render(fullProfile);
    expect(component.knowledgeAreas()).toEqual(["Ingenieria"]);

    translateMock.onLangChange.next({ lang: "en" });

    expect(component.knowledgeAreas()).toEqual(["Engineering"]);
  });

  it("no debe marcar nada como oculto en el perfil publico", () => {
    const element = render(fullProfile);

    expect(element.querySelector(".tag-stub")).toBeNull();
  });

  it("debe marcar como oculto lo que el docente dejo en Solo yo (admin)", () => {
    const element = render(
      {
        ...fullProfile,
        links: [{ type: "orcid", url: "https://orcid.org/0000-0002-1825-0097", is_visible: false }],
        degrees: [{ level: "master", title: "Magister", institution: "UPS", is_visible: true }],
      },
      {
        showHeader: false,
        isPublic: true,
        fieldVisibility: {
          headline: "public",
          faculty: "public",
          bio: "private",
          research_lines: "public",
          subjects: "public",
          research_group: "private",
        },
      }
    );

    const hiddenTags = element.querySelectorAll(".tag-stub");
    expect(hiddenTags.length).toBe(3);
    expect(element.querySelector("h2")).toBeNull();
    expect(element.textContent).toContain("Docente de Ingenieria Civil");
  });

  it("debe avisar cuando el perfil no es publico (admin)", () => {
    const element = render(fullProfile, { showHeader: false, isPublic: false });

    expect(element.textContent).toContain("authorProfile.profileNotPublic");
  });
});
