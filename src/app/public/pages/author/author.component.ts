import { ViewportScroller } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, map } from "rxjs";
import { AcademicDegreeLevel, AuthorLearningObject, PublicAuthor } from "src/app/core/interfaces/PublicProfile";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";
import { LanguageService } from "src/app/services/language.service";
import { LoginService } from "src/app/services/login.service";
import { PublicProfileService } from "src/app/services/public-profile.service";

/** `notFound`: el perfil no existe o no es publico (404); `generic`: cualquier otro error. */
export type AuthorPageError = "notFound" | "generic";

interface ProfileFact {
  labelKey: string;
  value: string;
  /** `value` es una clave de traduccion (nivel del grado). */
  translateValue?: boolean;
}

/** Secciones de la columna principal, en orden; las vacias no se dibujan. */
export type AuthorSectionId = "about" | "formation" | "research";

/** Pestanas de navegacion: llevan a una seccion sin ocultar las demas. */
export type AuthorTabId = "trajectory" | "research" | "resources";

interface AuthorTab {
  id: AuthorTabId;
  labelKey: string;
  target: string;
  count?: number;
}

/** Orden de la formacion: del grado mas alto al mas bajo. */
const DEGREE_RANK: Record<AcademicDegreeLevel, number> = { phd: 0, master: 1, specialty: 2, third: 3, technical: 4 };

/** Listas repetitivas: cuantos elementos se ven antes de "Ver mas" (no se recortan, se contraen). */
const COLLAPSED = { degrees: 3, subjects: 5, researchLines: 3 } as const;

/**
 * Pagina publica del docente (`/author/:userKey`).
 *
 * Responsabilidades:
 * - Mostrar la cabecera, las secciones numeradas (sobre mi, formacion,
 *   investigacion) con la barra lateral de areas, enlaces y profesiones, y la
 *   tabla paginada de sus OA publicos.
 * - Contraer solo las listas largas (formacion, asignaturas, lineas); el resto
 *   queda siempre visible.
 * - Tratar cualquier 404 como "perfil no disponible" sin leer el cuerpo, para
 *   no distinguir entre perfil inexistente, oculto o de alguien que no es docente.
 *
 * No responsabilidades:
 * - Filtrar campos privados: el backend ya los omite.
 */
@Component({
  selector: "app-author",
  templateUrl: "./author.component.html",
  styleUrls: ["./author.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AuthorComponent implements OnInit, OnDestroy {
  /** Mismas opciones de filas que el detalle del docente en el admin. */
  readonly rowsPerPageOptions = [5, 10, 20, 50];
  readonly pageSize = signal(10);
  readonly skeletonRows = Array.from({ length: 4 }, (_, index) => index);

  readonly author = signal<PublicAuthor | null>(null);
  readonly loading = signal(true);
  readonly error = signal<AuthorPageError | null>(null);

  readonly learningObjects = signal<AuthorLearningObject[]>([]);
  readonly learningObjectsTotal = signal(0);
  readonly learningObjectsFirst = signal(0);
  readonly learningObjectsLoading = signal(false);
  readonly learningObjectsError = signal(false);
  readonly degreesExpanded = signal(false);
  readonly subjectsExpanded = signal(false);
  readonly researchLinesExpanded = signal(false);
  /** Pestana marcada; se actualiza al hacer scroll por las secciones. */
  readonly activeTab = signal<AuthorTabId>("trajectory");

  readonly fullName = computed(() => {
    const author = this.author();
    return author ? `${author.first_name} ${author.last_name}`.trim() : "";
  });

  readonly initials = computed(() => {
    const author = this.author();
    const initials = `${author?.first_name?.trim().charAt(0) ?? ""}${author?.last_name?.trim().charAt(0) ?? ""}`;
    return initials.toUpperCase() || "U";
  });

  readonly institution = computed(() => this.author()?.university_name?.trim() ?? "");

  readonly professions = computed(() =>
    (this.author()?.professions ?? []).map((profession) => profession.description).filter(Boolean)
  );

  /** Bajo el nombre: el cargo; si no lo hay, las profesiones. */
  readonly subtitle = computed(() => this.author()?.headline || this.professions().join(" · "));

  /** El backend ya los entrega en el orden que eligio el docente. */
  readonly links = computed(() => this.author()?.links ?? []);

  readonly knowledgeAreas = computed(() => {
    const useEnglish = this.currentLang() === "en";
    return (this.author()?.knowledge_areas ?? []).map((area) =>
      useEnglish ? area.name_en || area.name_es : area.name_es || area.name_en
    );
  });

  readonly profileFacts = computed<ProfileFact[]>(() => {
    const author = this.author();
    const facts: ProfileFact[] = [
      { labelKey: "authorProfile.faculty", value: author?.faculty ?? "" },
      {
        labelKey: "authorProfile.highestDegree",
        value: author?.highest_degree ? `authorProfile.degreeLevels.${author.highest_degree}` : "",
        translateValue: true,
      },
    ];
    return facts.filter((fact) => fact.value.trim());
  });

  readonly degrees = computed(() =>
    [...(this.author()?.degrees ?? [])].sort(
      (a, b) => DEGREE_RANK[a.level] - DEGREE_RANK[b.level] || (b.year ?? 0) - (a.year ?? 0)
    )
  );
  readonly visibleDegrees = computed(() =>
    this.degreesExpanded() ? this.degrees() : this.degrees().slice(0, COLLAPSED.degrees)
  );
  readonly hiddenDegrees = computed(() => Math.max(this.degrees().length - COLLAPSED.degrees, 0));

  readonly subjects = computed(() => this.author()?.subjects ?? []);
  readonly visibleSubjects = computed(() =>
    this.subjectsExpanded() ? this.subjects() : this.subjects().slice(0, COLLAPSED.subjects)
  );
  readonly hiddenSubjects = computed(() => Math.max(this.subjects().length - COLLAPSED.subjects, 0));

  readonly researchLines = computed(() => this.author()?.research_lines ?? []);
  readonly visibleResearchLines = computed(() =>
    this.researchLinesExpanded() ? this.researchLines() : this.researchLines().slice(0, COLLAPSED.researchLines)
  );
  readonly hiddenResearchLines = computed(() =>
    Math.max(this.researchLines().length - COLLAPSED.researchLines, 0)
  );

  /** Secciones con contenido, numeradas en el orden en que se dibujan (01, 02, 03). */
  readonly sections = computed<AuthorSectionId[]>(() => {
    const author = this.author();
    const sections: AuthorSectionId[] = [];
    if (author?.bio || this.profileFacts().length || this.subjects().length) {
      sections.push("about");
    }
    if (this.degrees().length) {
      sections.push("formation");
    }
    if (author?.research_group || this.researchLines().length) {
      sections.push("research");
    }
    return sections;
  });

  readonly hasSidebar = computed(
    () => !!this.knowledgeAreas().length || !!this.links().length || !!this.professions().length
  );

  readonly tabs = computed<AuthorTab[]>(() => {
    const sections = this.sections();
    const tabs: AuthorTab[] = [];
    const trajectory = sections.find((section) => section !== "research");
    if (trajectory) {
      tabs.push({ id: "trajectory", labelKey: "authorPage.tabs.trajectory", target: `author-section-${trajectory}` });
    }
    if (sections.includes("research")) {
      tabs.push({ id: "research", labelKey: "authorPage.tabs.research", target: "author-section-research" });
    }
    tabs.push({
      id: "resources",
      labelKey: "authorPage.tabs.resources",
      target: "author-section-resources",
      count: this.learningObjectsTotal(),
    });
    return tabs;
  });

  /** Pestana marcada; si la ultima vista ya no existe (perfil sin esa seccion), la primera. */
  readonly selectedTab = computed<AuthorTabId>(() => {
    const tabs = this.tabs();
    return tabs.some((tab) => tab.id === this.activeTab()) ? this.activeTab() : tabs[0].id;
  });

  /** `user_key` del docente en sesion; la sesion (`/user/`) no lo trae. */
  private readonly ownUserKey = signal<string | null>(null);

  /** El docente esta viendo su propio perfil: se ofrece editarlo. */
  readonly isOwnProfile = computed(() => {
    const userKey = this.author()?.user_key;
    return !!userKey && userKey === this.ownUserKey();
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly publicProfileService = inject(PublicProfileService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly translate = inject(LanguageService).translate;
  private readonly currentLang = toSignal(
    this.translate.onLangChange.pipe(map((event: { lang: string }) => event.lang)),
    { initialValue: this.translate.currentLang }
  );
  private readonly title = inject(Title);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private sectionObserver: IntersectionObserver | null = null;
  private readonly previousTitle = this.title.getTitle();
  private userKey = "";
  /** Evita escribir breadcrumb o titulo si se salio de la pagina durante una carga. */
  private destroyed = false;

  ngOnInit(): void {
    void this.loadOwnUserKey();
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.userKey = params.get("userKey") ?? "";
      // Sin restauracion global de scroll: al cambiar de autor se empieza arriba.
      this.viewportScroller.scrollToPosition([0, 0]);
      void this.loadAuthor();
    });
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      void this.publishPageInfo();
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.sectionObserver?.disconnect();
    this.title.setTitle(this.previousTitle);
  }

  /**
   * Carga el perfil y, si existe, la primera pagina de sus OA.
   */
  async loadAuthor(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.author.set(null);
    this.degreesExpanded.set(false);
    this.subjectsExpanded.set(false);
    this.researchLinesExpanded.set(false);
    this.activeTab.set("trajectory");
    this.learningObjects.set([]);
    this.learningObjectsTotal.set(0);
    this.learningObjectsFirst.set(0);

    try {
      const author = await firstValueFrom(this.publicProfileService.getAuthor(this.userKey));
      this.author.set(author);
      this.observeSections();
      void this.publishPageInfo();
      void this.loadLearningObjects(1);
    } catch (err) {
      this.error.set((err as HttpErrorResponse)?.status === 404 ? "notFound" : "generic");
      void this.publishPageInfo();
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cambio de pagina o de filas por pagina; al cambiar las filas se vuelve a la primera.
   */
  onPageChange(event: { first?: number; page?: number; rows?: number }): void {
    let page = (event.page ?? 0) + 1;
    if (event.rows && event.rows !== this.pageSize()) {
      this.pageSize.set(event.rows);
      page = 1;
    }
    this.learningObjectsFirst.set((page - 1) * this.pageSize());
    this.viewportScroller.scrollToAnchor("author-learning-objects-title");
    void this.loadLearningObjects(page);
  }

  async loadLearningObjects(page: number): Promise<void> {
    this.learningObjectsLoading.set(true);
    this.learningObjectsError.set(false);

    try {
      const response = await firstValueFrom(
        this.publicProfileService.getAuthorLearningObjects(
          this.userKey,
          page,
          this.pageSize()
        )
      );
      this.learningObjects.set(response?.results ?? []);
      this.learningObjectsTotal.set(response?.count ?? 0);
    } catch {
      this.learningObjects.set([]);
      this.learningObjectsError.set(true);
    } finally {
      this.learningObjectsLoading.set(false);
    }
  }

  /**
   * Solo los docentes pueden tener perfil publico; para el resto no se consulta.
   */
  private async loadOwnUserKey(): Promise<void> {
    try {
      // Tras recargar, la sesion se rehidrata en paralelo; se espera antes de mirar el rol.
      await this.loginService.bootstrapSession();
      if (!this.loginService.validateRole("teacher")) {
        return;
      }
      const profile = await firstValueFrom(this.publicProfileService.getOwnProfile());
      this.ownUserKey.set(profile?.user_key ?? null);
    } catch {
      // Sin el dato solo falta el boton "Editar mi perfil".
    }
  }

  /** Clic en cualquier parte de la fila; el titulo es el enlace accesible por teclado. */
  openLearningObject(oa: AuthorLearningObject): void {
    if (oa.slug) {
      void this.router.navigate(["/object", oa.slug]);
    }
  }

  /** Pestana elegida: lleva a su seccion; las demas siguen visibles. */
  goToTab(tabId: AuthorTabId | string | number | undefined): void {
    const tab = this.tabs().find((item) => item.id === tabId);
    if (!tab) {
      return;
    }
    this.activeTab.set(tab.id);
    this.elementRef.nativeElement
      .querySelector<HTMLElement>(`#${tab.target}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  retryLearningObjects(): void {
    void this.loadLearningObjects(this.learningObjectsFirst() / this.pageSize() + 1);
  }

  /**
   * Marca la pestana de la seccion que se esta leyendo. Se arma despues de
   * dibujar el perfil, porque las secciones dependen de los datos.
   */
  private observeSections(): void {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    afterNextRender(
      () => {
        this.sectionObserver?.disconnect();
        this.sectionObserver = new IntersectionObserver(
          (entries) => {
            const visible = entries.find((entry) => entry.isIntersecting);
            const tabId = (visible?.target as HTMLElement | undefined)?.dataset["authorTab"] as AuthorTabId | undefined;
            if (tabId) {
              this.activeTab.set(tabId);
            }
          },
          // Cuenta como "leyendo" la franja superior de la pantalla.
          { rootMargin: "-20% 0px -70% 0px" }
        );
        this.elementRef.nativeElement
          .querySelectorAll<HTMLElement>("[data-author-tab]")
          .forEach((section) => this.sectionObserver?.observe(section));
      },
      { injector: this.injector }
    );
  }

  /**
   * Breadcrumb y titulo de la pestana; con el nombre del docente si cargo.
   */
  private async publishPageInfo(): Promise<void> {
    const author = this.author();
    const name = author ? `${author.first_name} ${author.last_name}`.trim() : "";
    const label = await firstValueFrom(this.translate.get("authorPage.breadcrumb"));
    const pageTitle = name
      ? await firstValueFrom(this.translate.get("authorPage.pageTitle", { name }))
      : this.previousTitle;
    if (this.destroyed) {
      return;
    }

    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label },
      ...(name ? [{ label: name }] : []),
    ]);
    this.title.setTitle(pageTitle);
  }
}
