import { HttpErrorResponse } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, convertToParamMap } from "@angular/router";
import { BehaviorSubject, Subject, of, throwError } from "rxjs";
import { AuthorLearningObject, PublicAuthor } from "src/app/core/interfaces/PublicProfile";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { PublicProfileService } from "src/app/services/public-profile.service";
import { AuthorComponent } from "./author.component";

/** Deja terminar las cargas que el componente lanza sin esperar. */
const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

const USER_KEY = "3f2b8c1e-5d4a-4c1b-9a77-2f1e0c9b8a10";

/** Perfil con solo los datos fijos de la cuenta (sin campos opcionales). */
const minimalAuthor: PublicAuthor = {
  user_key: USER_KEY,
  first_name: "Juan",
  last_name: "Perez",
  email: "jperez@ups.edu.ec",
  image_url: null,
  university_name: "",
  professions: [],
  knowledge_areas: [],
  member_since: 2021,
  links: [],
  degrees: [],
};

describe("AuthorComponent", () => {
  let fixture: ComponentFixture<AuthorComponent>;
  let component: AuthorComponent;
  let serviceSpy: jasmine.SpyObj<PublicProfileService>;
  let breadcrumbSpy: jasmine.SpyObj<BreadcrumbService>;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let title: Title;
  let loginSpy: jasmine.SpyObj<LoginService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj("PublicProfileService", ["getAuthor", "getAuthorLearningObjects", "getOwnProfile"]);
    serviceSpy.getAuthor.and.returnValue(of(minimalAuthor));
    // Backend con `page_size`: las paginas salen del tamano pedido.
    serviceSpy.getAuthorLearningObjects.and.callFake((_userKey, _page, pageSize) =>
      of({
        count: 20,
        pages: Math.ceil(20 / (pageSize ?? 16)),
        links: { next: "", previous: "" },
        results: [{ id: 7, slug: "oa-7", general_title: "OA 7", views: 14, downloads: 3 } as any],
      })
    );
    breadcrumbSpy = jasmine.createSpyObj("BreadcrumbService", ["setItems"]);
    loginSpy = jasmine.createSpyObj("LoginService", ["validateRole", "bootstrapSession"]);
    loginSpy.validateRole.and.returnValue(false);
    loginSpy.bootstrapSession.and.resolveTo(true);
    paramMap$ = new BehaviorSubject(convertToParamMap({ userKey: USER_KEY }));

    const translateMock = {
      onLangChange: new Subject<unknown>(),
      get: (key: string, params?: { name?: string }) => of(params?.name ? `${params.name} - ROA` : key),
    };

    await TestBed.configureTestingModule({
      declarations: [AuthorComponent],
      providers: [
        { provide: PublicProfileService, useValue: serviceSpy },
        { provide: BreadcrumbService, useValue: breadcrumbSpy },
        { provide: LanguageService, useValue: { translate: translateMock } },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$ } },
        { provide: LoginService, useValue: loginSpy },
      ],
    })
      .overrideComponent(AuthorComponent, { set: { template: "" } })
      .compileComponents();

    title = TestBed.inject(Title);
    title.setTitle("ROA - UPS");
    fixture = TestBed.createComponent(AuthorComponent);
    component = fixture.componentInstance;
  });

  it("debe cargar el perfil y la primera pagina de sus OA", async () => {
    fixture.detectChanges();
    await flushPromises();

    expect(serviceSpy.getAuthor).toHaveBeenCalledWith(USER_KEY);
    expect(serviceSpy.getAuthorLearningObjects).toHaveBeenCalledWith(USER_KEY, 1, 10);
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBeNull();
    expect(component.author()).toEqual(minimalAuthor);
    expect(component.learningObjects()[0]).toEqual(jasmine.objectContaining({ views: 14, downloads: 3 }));
    expect(component.learningObjectsTotal()).toBe(20);
  });

  it("debe ordenar la formacion, numerar solo las secciones con datos y armar las pestanas", async () => {
    serviceSpy.getAuthor.and.returnValue(
      of({
        ...minimalAuthor,
        highest_degree: "phd",
        faculty: "Ingenieria",
        research_lines: ["Hidraulica"],
        degrees: [
          { level: "third", title: "Ingeniero Civil", institution: "UPS", year: 2010 },
          { level: "technical", title: "Tecnologo en Construccion", institution: "IST", year: 2006 },
          { level: "phd", title: "Doctor en Ingenieria", institution: "UPM", year: 2019 },
          { level: "specialty", title: "Especialista en Estructuras", institution: "UCuenca", year: 2012 },
          { level: "master", title: "Magister en Hidraulica", institution: "EPN", year: 2014 },
        ],
      })
    );

    fixture.detectChanges();
    await flushPromises();

    expect(component.degrees().map((degree) => degree.level)).toEqual([
      "phd",
      "master",
      "specialty",
      "third",
      "technical",
    ]);
    expect(component.profileFacts().map((fact) => fact.labelKey)).toEqual([
      "authorProfile.faculty",
      "authorProfile.highestDegree",
    ]);
    expect(component.sections()).toEqual(["about", "formation", "research"]);
    expect(component.tabs().map((tab) => tab.id)).toEqual(["trajectory", "research", "resources"]);
    expect(component.tabs()[2].count).toBe(20);
    expect(component.hasSidebar()).toBeFalse();
  });

  it("no debe dibujar secciones vacias ni la pestana de investigacion sin datos", async () => {
    fixture.detectChanges();
    await flushPromises();

    expect(component.sections()).toEqual([]);
    expect(component.tabs().map((tab) => tab.id)).toEqual(["resources"]);
    // La pestana marcada cae en la primera que existe.
    expect(component.selectedTab()).toBe("resources");
  });

  it("debe contraer formacion, asignaturas y lineas sin recortar los datos", async () => {
    serviceSpy.getAuthor.and.returnValue(
      of({
        ...minimalAuthor,
        degrees: Array.from({ length: 10 }, (_, index) => ({
          level: "master" as const,
          title: `Magister ${index}`,
          institution: "UPS",
          year: 2000 + index,
        })),
        subjects: Array.from({ length: 10 }, (_, index) => `Asignatura ${index}`),
        research_lines: ["L1", "L2", "L3", "L4", "L5"],
      })
    );

    fixture.detectChanges();
    await flushPromises();

    expect(component.visibleDegrees().length).toBe(3);
    expect(component.hiddenDegrees()).toBe(7);
    expect(component.visibleSubjects().length).toBe(5);
    expect(component.hiddenSubjects()).toBe(5);
    expect(component.visibleResearchLines().length).toBe(3);
    expect(component.hiddenResearchLines()).toBe(2);

    component.degreesExpanded.set(true);
    component.subjectsExpanded.set(true);
    expect(component.visibleDegrees().length).toBe(10);
    expect(component.visibleSubjects().length).toBe(10);

    // Al cargar otro perfil vuelven a mostrarse contraidas.
    await component.loadAuthor();
    expect(component.degreesExpanded()).toBeFalse();
    expect(component.subjectsExpanded()).toBeFalse();
  });

  it("debe mostrar el cargo bajo el nombre o, si no hay, las profesiones", async () => {
    serviceSpy.getAuthor.and.returnValue(
      of({ ...minimalAuthor, professions: [{ id: 1, description: "Ingeniero" } as any] })
    );
    fixture.detectChanges();
    await flushPromises();
    expect(component.subtitle()).toBe("Ingeniero");
    expect(component.hasSidebar()).toBeTrue();

    serviceSpy.getAuthor.and.returnValue(
      of({ ...minimalAuthor, headline: "Docente titular", professions: [{ id: 1, description: "Ingeniero" } as any] })
    );
    await component.loadAuthor();
    expect(component.subtitle()).toBe("Docente titular");
  });

  it("debe publicar breadcrumb y titulo con el nombre del docente", async () => {
    fixture.detectChanges();
    await flushPromises();

    expect(breadcrumbSpy.setItems).toHaveBeenCalledWith([
      { label: "ROA" },
      { label: "authorPage.breadcrumb" },
      { label: "Juan Perez" },
    ]);
    expect(title.getTitle()).toBe("Juan Perez - ROA");

    fixture.destroy();
    expect(title.getTitle()).toBe("ROA - UPS");
  });

  it("no debe tocar breadcrumb ni titulo si se salio de la pagina durante la carga", async () => {
    const author$ = new Subject<PublicAuthor>();
    serviceSpy.getAuthor.and.returnValue(author$);

    fixture.detectChanges();
    fixture.destroy();
    author$.next(minimalAuthor);
    author$.complete();
    await flushPromises();

    expect(breadcrumbSpy.setItems).not.toHaveBeenCalled();
    expect(title.getTitle()).toBe("ROA - UPS");
  });

  it("debe mostrar perfil no disponible ante un 404 sin pedir los OA", async () => {
    serviceSpy.getAuthor.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: "<!DOCTYPE html>" }))
    );

    fixture.detectChanges();
    await flushPromises();

    expect(component.error()).toBe("notFound");
    expect(component.author()).toBeNull();
    expect(serviceSpy.getAuthorLearningObjects).not.toHaveBeenCalled();
    expect(title.getTitle()).toBe("ROA - UPS");
  });

  it("debe mostrar un error generico ante otros errores", async () => {
    serviceSpy.getAuthor.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    fixture.detectChanges();
    await flushPromises();

    expect(component.error()).toBe("generic");
  });

  it("debe pedir la pagina elegida en el paginador", async () => {
    fixture.detectChanges();
    await flushPromises();

    component.onPageChange({ first: 10, page: 1, rows: 10 });
    await flushPromises();

    expect(serviceSpy.getAuthorLearningObjects).toHaveBeenCalledWith(USER_KEY, 2, 10);
    expect(component.learningObjectsFirst()).toBe(10);
  });

  it("debe volver a la primera pagina al cambiar las filas por pagina", async () => {
    fixture.detectChanges();
    await flushPromises();

    component.onPageChange({ first: 20, page: 1, rows: 20 });
    await flushPromises();

    expect(component.pageSize()).toBe(20);
    expect(component.learningObjectsFirst()).toBe(0);
    expect(serviceSpy.getAuthorLearningObjects).toHaveBeenCalledWith(USER_KEY, 1, 20);
  });

  it("debe conservar el perfil si fallan los OA y permitir reintentar", async () => {
    serviceSpy.getAuthorLearningObjects.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    fixture.detectChanges();
    await flushPromises();

    expect(component.author()).not.toBeNull();
    expect(component.learningObjectsError()).toBeTrue();

    serviceSpy.getAuthorLearningObjects.and.returnValue(
      of({ count: 0, pages: 1, links: { next: "", previous: "" }, results: [] })
    );
    component.retryLearningObjects();
    await flushPromises();

    expect(component.learningObjectsError()).toBeFalse();
    expect(component.learningObjects()).toEqual([]);
  });

  it("debe ofrecer editar solo cuando el docente ve su propio perfil", async () => {
    loginSpy.validateRole.and.returnValue(true);
    serviceSpy.getOwnProfile.and.returnValue(of({ user_key: USER_KEY } as any));

    fixture.detectChanges();
    await flushPromises();

    expect(component.isOwnProfile()).toBeTrue();

    paramMap$.next(convertToParamMap({ userKey: "otro" }));
    serviceSpy.getAuthor.and.returnValue(of({ ...minimalAuthor, user_key: "otro" }));
    await component.loadAuthor();

    expect(component.isOwnProfile()).toBeFalse();
  });

  it("no debe consultar el perfil propio si el usuario no es docente", async () => {
    fixture.detectChanges();
    await flushPromises();

    expect(serviceSpy.getOwnProfile).not.toHaveBeenCalled();
    expect(component.isOwnProfile()).toBeFalse();
  });

  it("debe abrir el OA al hacer clic en su fila", () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, "navigate").and.resolveTo(true);

    component.openLearningObject({ slug: "mi-oa" } as AuthorLearningObject);
    component.openLearningObject({} as AuthorLearningObject);

    expect(navigateSpy).toHaveBeenCalledOnceWith(["/object", "mi-oa"]);
  });

  it("debe recargar al cambiar de autor en la misma ruta", async () => {
    fixture.detectChanges();
    await flushPromises();

    paramMap$.next(convertToParamMap({ userKey: "otro-docente" }));
    await flushPromises();

    expect(serviceSpy.getAuthor).toHaveBeenCalledWith("otro-docente");
  });
});
