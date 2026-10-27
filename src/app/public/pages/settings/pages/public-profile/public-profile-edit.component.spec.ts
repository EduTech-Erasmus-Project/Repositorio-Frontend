import { HttpErrorResponse } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MessageService } from "primeng/api";
import { Subject, of, throwError } from "rxjs";
import { OwnPublicProfile } from "src/app/core/interfaces/PublicProfile";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { PublicProfileService } from "src/app/services/public-profile.service";
import { PublicProfileEditComponent } from "./public-profile-edit.component";

const emptyProfile: OwnPublicProfile = {
  user_key: "3f2b8c1e-5d4a-4c1b-9a77-2f1e0c9b8a10",
  is_public: true,
  headline: "",
  faculty: "",
  bio: "",
  research_lines: [],
  subjects: [],
  research_group: "",
  field_visibility: {
    headline: "public",
    faculty: "public",
    bio: "public",
    research_lines: "public",
    subjects: "public",
    research_group: "public",
  },
  highest_degree: null,
  links: [],
  degrees: [],
};

const fullProfile: OwnPublicProfile = {
  ...emptyProfile,
  headline: "Docente de Ingenieria Civil",
  research_lines: ["Hidraulica"],
  field_visibility: { ...emptyProfile.field_visibility, research_group: "private" },
  links: [
    { type: "website", url: "https://mi-sitio.ec", order: 2, is_visible: false },
    { type: "orcid", url: "https://orcid.org/0000-0002-1825-0097", order: 1, is_visible: true },
  ],
  degrees: [{ level: "phd", title: "Doctor en Ingenieria", institution: "UPM", year: 2019, is_visible: true }],
};

describe("PublicProfileEditComponent", () => {
  let fixture: ComponentFixture<PublicProfileEditComponent>;
  let component: PublicProfileEditComponent;
  let serviceSpy: jasmine.SpyObj<PublicProfileService>;
  let messageSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj("PublicProfileService", [
      "getOwnProfile",
      "saveOwnProfile",
      "patchOwnProfile",
      "getAuthor",
    ]);
    serviceSpy.getOwnProfile.and.returnValue(of(fullProfile));
    serviceSpy.getAuthor.and.returnValue(of({} as any));
    messageSpy = jasmine.createSpyObj("MessageService", ["add"]);

    await TestBed.configureTestingModule({
      declarations: [PublicProfileEditComponent],
      providers: [
        { provide: PublicProfileService, useValue: serviceSpy },
        { provide: MessageService, useValue: messageSpy },
        { provide: LoginService, useValue: { user: { first_name: "Ana", last_name: "Perez", email: "ana@ups.edu.ec" } } },
        { provide: BreadcrumbService, useValue: jasmine.createSpyObj("BreadcrumbService", ["setItems"]) },
        {
          provide: LanguageService,
          useValue: { translate: { onLangChange: new Subject(), instant: (key: string) => `t:${key}` } },
        },
      ],
    })
      .overrideComponent(PublicProfileEditComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(PublicProfileEditComponent);
    component = fixture.componentInstance;
  });

  async function load(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it("debe ofrecer ver el perfil publico cuando ya se puede abrir", async () => {
    await load();

    expect(serviceSpy.getAuthor).toHaveBeenCalledWith(emptyProfile.user_key);
    expect(component.publicPageState()).toBe("available");
  });

  it("debe avisar que falta publicar un OA si la pagina publica responde 404", async () => {
    serviceSpy.getAuthor.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

    await load();

    expect(component.publicPageState()).toBe("empty");
  });

  it("no debe consultar la pagina publica si el perfil esta oculto", async () => {
    serviceSpy.getOwnProfile.and.returnValue(of({ ...fullProfile, is_public: false }));

    await load();

    expect(serviceSpy.getAuthor).not.toHaveBeenCalled();
  });

  it("debe ofrecer los cinco niveles de titulo del backend, de menor a mayor", async () => {
    await load();

    expect(component.degreeLevelOptions().map((option) => option.value)).toEqual([
      "technical",
      "third",
      "specialty",
      "master",
      "phd",
    ]);
  });

  it("debe dejar salir sin preguntar solo si no hay cambios", async () => {
    await load();

    expect(component.confirmLeave()).toBeTrue();

    component.form.controls.headline.setValue("Otro cargo");
    component.form.markAsDirty();

    expect(component.confirmLeave()).toEqual(jasmine.any(Promise));
  });

  it("debe calcular el avance del perfil y actualizarlo al editar", async () => {
    await load();

    // fullProfile: cargo, lineas, titulo y enlaces; faltan "Sobre mi" y facultad.
    expect(component.progressDone()).toBe(4);
    expect(component.progressPercent()).toBe(67);
    expect(component.progress().find((item) => item.label === "authorProfile.about")?.done).toBeFalse();

    component.form.controls.bio.setValue("Investigo hidraulica");
    component.form.controls.faculty.setValue("Ingenieria");

    expect(component.progressDone()).toBe(6);
    expect(component.progressPercent()).toBe(100);
  });

  it("debe cargar el perfil con los enlaces en su orden y sin cambios pendientes", async () => {
    await load();

    expect(component.loading()).toBeFalse();
    expect(component.form.controls.headline.value).toBe("Docente de Ingenieria Civil");
    expect(component.form.controls.field_visibility.controls.research_group.value).toBe("private");
    expect(component.links.controls.map((link) => link.controls.type.value)).toEqual(["orcid", "website"]);
    expect(component.degrees.length).toBe(1);
    expect(component.userKey()).toBe(emptyProfile.user_key);
    expect(component.form.dirty).toBeFalse();
  });

  it("debe mostrar el estado de error si no carga", async () => {
    serviceSpy.getOwnProfile.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    await load();

    expect(component.loadError()).toBeTrue();
  });

  it("debe guardar todo en un PUT con orden, textos limpios y sin filas vacias", async () => {
    serviceSpy.saveOwnProfile.and.callFake((payload) => of({ ...fullProfile, ...payload } as OwnPublicProfile));
    await load();

    component.form.controls.headline.setValue("  Nuevo titular  ");
    component.addTextItem("research_lines");
    component.addTextItem("subjects");
    component.subjects.at(0).setValue("Hidrologia");
    component.moveLink(1, -1);
    await component.save();

    const payload = serviceSpy.saveOwnProfile.calls.mostRecent().args[0];
    expect(payload.headline).toBe("Nuevo titular");
    expect(payload.research_lines).toEqual(["Hidraulica"]);
    expect(payload.subjects).toEqual(["Hidrologia"]);
    expect(payload.links).toEqual([
      { type: "website", url: "https://mi-sitio.ec", order: 1, is_visible: false },
      { type: "orcid", url: "https://orcid.org/0000-0002-1825-0097", order: 2, is_visible: true },
    ]);
    expect(payload.degrees?.[0]).toEqual(
      { level: "phd", title: "Doctor en Ingenieria", institution: "UPM", year: 2019, is_visible: true }
    );
    expect(Object.keys(payload.field_visibility ?? {})).not.toContain("location");
    expect(payload.is_public).toBeUndefined();
    expect(component.form.dirty).toBeFalse();
    expect(messageSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: "success" }));
  });

  it("no debe guardar si un enlace no cumple las reglas del backend", async () => {
    await load();

    const orcidUrl = component.links.at(0).controls.url;
    orcidUrl.setValue("https://orcid.org/abc");
    expect(orcidUrl.errors).toEqual({ orcid: true });

    // Digito de control incorrecto y digitos intercambiados.
    orcidUrl.setValue("https://orcid.org/0000-0002-1825-0098");
    orcidUrl.markAsDirty();
    expect(orcidUrl.errors).toEqual({ orcidChecksum: true });
    expect(component.errorKey(orcidUrl)?.key).toBe("publicProfileEdit.errors.orcidChecksum");
    orcidUrl.setValue("https://orcid.org/0000-0002-8125-0097");
    expect(orcidUrl.errors).toEqual({ orcidChecksum: true });

    // La X final es valida, tambien en minuscula.
    orcidUrl.setValue("https://orcid.org/0000-0002-1694-233x");
    expect(orcidUrl.errors).toBeNull();
    component.links.at(1).controls.url.setValue("http://mi-sitio.ec");
    expect(component.links.at(1).controls.url.errors).toEqual({ https: true });
    // Cambiar el tipo revalida la URL con el dominio del tipo nuevo.
    component.links.at(0).controls.type.setValue("linkedin");
    expect(orcidUrl.errors).toEqual({ domain: { domain: "linkedin.com" } });

    await component.save();

    expect(serviceSpy.saveOwnProfile).not.toHaveBeenCalled();
    expect(component.errorKey(orcidUrl)?.key).toBe("publicProfileEdit.errors.domain");
  });

  it("debe validar el anio y los campos obligatorios del titulo", async () => {
    await load();

    component.addDegree();
    const degree = component.degrees.at(1);
    degree.controls.year.setValue(1900);
    expect(degree.controls.year.errors).toEqual({ year: { min: 1950, max: new Date().getFullYear() } });
    expect(degree.controls.title.hasError("required")).toBeTrue();
    expect(component.form.invalid).toBeTrue();
  });

  it("debe ubicar los errores 400 del backend en el campo y el item", async () => {
    serviceSpy.saveOwnProfile.and.returnValue(
      throwError(() => new HttpErrorResponse({
        status: 400,
        error: { headline: ["Muy largo"], links: [{}, { url: ["Dominio"] }], research_lines: { "0": ["Largo"] } },
      }))
    );
    await load();

    await component.save();

    expect(component.form.controls.headline.hasError("server")).toBeTrue();
    expect(component.links.at(1).controls.url.hasError("server")).toBeTrue();
    expect(component.links.at(0).controls.url.hasError("server")).toBeFalse();
    expect(component.researchLines.at(0).hasError("server")).toBeTrue();
    expect(component.errorKey(component.form.controls.headline)?.key).toBe("publicProfileEdit.errors.server");
    expect(messageSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: "t:publicProfileEdit.messages.invalid" }));
  });

  it("debe marcar el error de lista cuando el backend rechaza enlaces repetidos", async () => {
    serviceSpy.saveOwnProfile.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { links: ["Hay más de un enlace del mismo tipo."] } }))
    );
    await load();

    await component.save();

    expect(component.listErrors().links).toBeTrue();
  });

  it("debe activar u ocultar el perfil con PATCH y revertir si falla", async () => {
    await load();
    serviceSpy.patchOwnProfile.and.returnValue(of({ ...fullProfile, is_public: false }));

    await component.togglePublic(false);

    expect(serviceSpy.patchOwnProfile).toHaveBeenCalledWith({ is_public: false });
    expect(component.isPublic()).toBeFalse();

    serviceSpy.patchOwnProfile.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    await component.togglePublic(true);

    expect(component.isPublic()).toBeFalse();
    expect(messageSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: "error" }));
  });

  it("debe ofrecer en cada enlace solo los tipos libres y no pasar de los limites", async () => {
    serviceSpy.getOwnProfile.and.returnValue(of(emptyProfile));
    await load();

    for (let index = 0; index < 10; index++) {
      component.addLink();
      component.addTextItem("research_lines");
    }

    expect(component.links.length).toBe(7);
    expect(component.researchLines.length).toBe(5);
    expect(component.linkTypeOptions()[0].map((option) => option.value)).toEqual(["orcid"]);
    expect(component.form.dirty).toBeTrue();
  });

  it("debe descartar los cambios y volver a lo guardado", async () => {
    await load();

    component.form.controls.headline.setValue("Cambio");
    component.removeLink(0);
    component.discardChanges();

    expect(component.form.controls.headline.value).toBe("Docente de Ingenieria Civil");
    expect(component.links.length).toBe(2);
    expect(component.form.dirty).toBeFalse();
  });
});
