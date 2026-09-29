import { ViewportScroller } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { MessageService, ToastMessageOptions } from "primeng/api";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LearningObjectService } from "../../../services/learning-object.service";
import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import {
  ExpertEvaluationResultResponse,
} from "src/app/core/interfaces/api-contracts";
import { LoginService } from "src/app/services/login.service";
import { LanguageService } from "src/app/services/language.service";
import { BreadcrumbService } from "src/app/services/breadcrumb.service";

interface EvaluationSummaryView {
  concepto: {
    concept?: string;
  };
  total?: number;
}

interface EvaluationSummaryBatchView {
  concepts: EvaluationSummaryView[];
}

interface ExpertQuestionView {
  value: number;
  questions: string;
  qualification: string;
}

interface ExpertConceptView {
  evaluationConcept: string;
  average?: number;
  questionEvaluations: ExpertQuestionView[];
}

interface ExpertEvaluationBatchView {
  conceptEvaluations: ExpertConceptView[];
  observation: string;
  id: number;
}

/**
 * Orquesta la pagina publica de detalle del OA.
 *
 * Responsabilidades:
 * - Cargar detalle, comentarios y resultados de evaluacion segun el rol.
 * - Preparar el codigo embebible del recurso y sincronizar el OA seleccionado.
 * - Gestionar accesibilidad del shell de tabs para teclado en Angular 21.
 */
@Component({
    selector: "app-object",
    templateUrl: "./object.component.html",
    styleUrls: ["./object.component.scss"],
    standalone: false
})
export class ObjectComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("objectTabsShell") objectTabsShell?: ElementRef<HTMLElement>;
  public objectData: ObjectLearning | null = null;
  private readonly destroyRef = inject(DestroyRef);
  private tabHeaderObserver?: MutationObserver;
  private readonly tabKeydownHandler = (event: KeyboardEvent) => this.handleTabShellKeydown(event);
  public commentsData: { count?: number; [key: string]: unknown } | null = null;
  public metadata: unknown;
  public showMetadata = false;
  public embedCode = "";
  public msgsCopy: ToastMessageOptions[] = [];
  public changeView = false;
  public disabled?: boolean;
  public flagConfirm = false;
  public groupedQuestionsEx: ExpertEvaluationBatchView[] = [];
  public groupedQuestionsTeacher: ExpertEvaluationBatchView[] = [];
  public resultsEva: EvaluationSummaryBatchView[] = [];
  public ObjectID = 0;

  constructor(
    private route: ActivatedRoute,
    private objectService: LearningObjectService,
    private router: Router,
    private messageService: MessageService,
    private loginService: LoginService,
    private breadcrumbService: BreadcrumbService,
    private languageService: LanguageService,
    private viewportScroller: ViewportScroller,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: ParamMap) => {
        const slug = params.get("slug");
        if (!slug) {
          this.router.navigateByUrl("/notfound");
          return;
        }

        this.resetViewportScroll();
        this.resetObjectViewState();
        void this.getObjectDetail(slug);
        void this.addBreadcrumb(slug);
      });
  }

  ngAfterViewInit(): void {
    this.setupTabHeaderTabOrder();
  }

  ngOnDestroy(): void {
    this.tabHeaderObserver?.disconnect();
    this.objectTabsShell?.nativeElement.removeEventListener("keydown", this.tabKeydownHandler, true);
  }

  /**
   * Publica el breadcrumb del detalle usando el slug actual como ultimo nivel.
   */
  private async addBreadcrumb(slug: string) {
    this.breadcrumbService.setItems([
      { label: "ROA" },
      { label: await firstValueFrom(this.languageService.translate.get("menu.learningObject")) },
      { label: slug, routerLink: ["/object/" + slug] },
    ]);
  }

  /**
   * Carga el detalle del OA y encadena comentarios, evaluaciones y contexto compartido.
   */
  async getObjectDetail(slug: string) {
    try {
      const res = await firstValueFrom(this.objectService.getObjectDetail(slug));
      this.objectData = res;
      this.embedCode = `<iframe id='roa_iframe' src='${res.learning_object_file.url}' style='border:0; width:100%; height:100%' iframeborder='0' frameborder='0' referrerpolicy='strict-origin-when-cross-origin' iframeElement.frameBorder = 0; webkitallowfullscreen mozallowfullscreen allowfullscreen ></iframe>`;
      this.cdr.detectChanges();
      await this.loadData();
      await this.loadComments(res.id);
      this.objectService.setSelectedLearningObject(res);
      this.cdr.detectChanges();
    } catch (err) {
      this.handleDetailError(err as HttpErrorResponse);
    }
  }

  private handleDetailError(err: HttpErrorResponse): void {
    this.router.navigate([err?.status === 404 ? "/notfound" : "/error"]);
  }

  /**
   * Fuerza la entrada del detalle desde la parte superior para no heredar la
   * posicion de scroll del listado previo.
   */
  private resetViewportScroll(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  /**
   * Normaliza la respuesta de comentarios para que el template pueda leer `count` y `results`.
   */
  async loadComments(id: number) {
    const res = await firstValueFrom(this.objectService.getComments(id));
    this.commentsData = Array.isArray(res)
      ? { count: res.length, results: res }
      : (res as { count?: number; [key: string]: unknown });
    this.cdr.detectChanges();
  }

  coutComment(evt: number) {
    this.commentsData = {
      ...(this.commentsData || {}),
      count: ((this.commentsData?.count as number | undefined) || 0) + Number(evt || 0),
    };
    this.cdr.detectChanges();
  }

  /**
   * Copia el iframe embebible del OA y publica feedback de exito o error.
   */
  async copyText() {
    navigator.clipboard.writeText(this.embedCode).then(
      async () => {
        this.messageService.add({
          severity: "success",
          summary: await firstValueFrom(this.languageService.translate.get("message.copy")),
          detail: await firstValueFrom(this.languageService.translate.get("buttons.copyWebSuccess")),
        });
      },
      async () => {
        this.messageService.add({
          severity: "error",
          summary: await firstValueFrom(this.languageService.translate.get("message.titleError")),
          detail: await firstValueFrom(this.languageService.translate.get("buttons.resetOther")),
        });
      }
    );
  }

  coutComment1(evt: boolean) {
    if (evt === true) {
      void this.loadData();
    }
  }

  /**
   * Carga el bloque de evaluaciones visible para el rol actual del visitante.
   */
  async loadData() {
    if (!this.objectData) {
      return;
    }

    this.flagConfirm = false;
    this.groupedQuestionsEx = [];
    this.groupedQuestionsTeacher = [];
    this.resultsEva = [];

    if (this.roleStudent && !this.roleExpert && !this.roleTeacher) {
      const res = await firstValueFrom(this.objectService.getResultsEvaluation(this.objectData.id));
      this.resultsEva = res.map((item) => ({
        concepts: (item.concept_evaluations || []).map((conceptEvaluation) => ({
          concepto: conceptEvaluation.evaluation_concept || {},
          total: conceptEvaluation.average,
        })),
      }));
      this.cdr.detectChanges();
      return;
    }

    if (this.roleExpert) {
      const res = await firstValueFrom(this.objectService.getObjectResultsEvaluation(this.objectData.id));
      this.groupedQuestionsEx = res.map((item) => this.mapExpertEvaluation(item));
      this.flagConfirm = this.groupedQuestionsEx.length > 0;
      this.cdr.detectChanges();
      return;
    }

    if (this.roleTeacher) {
      const res = await firstValueFrom(this.objectService.getResultsEvaluation(this.objectData.id));
      this.groupedQuestionsTeacher = res.map((item) => this.mapExpertEvaluation(item));
      this.cdr.detectChanges();
    }
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  get roleStudent() {
    return this.loginService.validateRole("student");
  }

  get roleTeacher() {
    return this.loginService.validateRole("teacher");
  }

  get hasStudentEvaluation(): boolean {
    return !!this.resultsEva?.some((item) => item?.concepts?.length > 0);
  }

  get hasTeacherEvaluation(): boolean {
    return !!this.groupedQuestionsTeacher?.length;
  }

  get shouldShowEvaluationEmptyState(): boolean {
    if (this.roleStudent && !this.roleExpert && !this.roleTeacher) {
      return !this.hasStudentEvaluation;
    }

    if (this.roleTeacher && !this.roleStudent && !this.roleExpert) {
      return !this.hasTeacherEvaluation;
    }

    if (this.roleExpert) {
      return !this.flagConfirm;
    }

    return false;
  }

  private mapExpertEvaluation(item: ExpertEvaluationResultResponse): ExpertEvaluationBatchView {
    return {
      conceptEvaluations: (item.concept_evaluations || []).map((conceptEvaluation) => ({
        evaluationConcept:
          typeof conceptEvaluation.evaluation_concept === "string"
            ? conceptEvaluation.evaluation_concept
            : conceptEvaluation.evaluation_concept?.concept || "",
        average: conceptEvaluation.average,
        questionEvaluations: (conceptEvaluation.question_evaluations || []).map((questionEvaluation) => ({
          value: questionEvaluation.id || questionEvaluation.question_id || 0,
          questions: questionEvaluation.question || "",
          qualification: questionEvaluation.qualification || "",
        })),
      })),
      observation: item.observation || "",
      id: item.id || 0,
    };
  }

  /**
   * Limpia el estado derivado del OA anterior antes de procesar un nuevo slug.
   */
  private resetObjectViewState(): void {
    this.objectData = null;
    this.commentsData = null;
    this.embedCode = "";
    this.showMetadata = false;
    this.flagConfirm = false;
    this.groupedQuestionsEx = [];
    this.groupedQuestionsTeacher = [];
    this.resultsEva = [];
    this.cdr.detectChanges();
  }

  /**
   * Fuerza navegacion por teclado consistente sobre el encabezado del tabview legacy.
   */
  private setupTabHeaderTabOrder(): void {
    this.normalizeTabHeaderTabIndexes();

    this.objectTabsShell?.nativeElement.addEventListener("keydown", this.tabKeydownHandler, true);

    const tabNavigation = this.objectTabsShell?.nativeElement.querySelector(".p-tabview-nav");
    if (!tabNavigation) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.tabHeaderObserver = new MutationObserver(() => {
        requestAnimationFrame(() => this.normalizeTabHeaderTabIndexes());
      });

      this.tabHeaderObserver.observe(tabNavigation, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["tabindex", "class", "aria-selected"],
      });
    });
  }

  private normalizeTabHeaderTabIndexes(): void {
    const tabHeaders = this.objectTabsShell?.nativeElement.querySelectorAll<HTMLElement>(
      ".p-tabview-nav .p-tabview-nav-link"
    );

    tabHeaders?.forEach((tabHeader) => {
      tabHeader.setAttribute("tabindex", "0");
    });
  }

  private handleTabShellKeydown(event: KeyboardEvent): void {
    if (event.key !== "Tab") {
      return;
    }

    const activeHeader = this.getActiveTabHeader();
    const activePanel = this.getActiveTabPanel();
    const focusTarget = event.target as HTMLElement | null;
    const currentHeader = focusTarget?.closest(".p-tabview-nav-link") as HTMLElement | null;
    const currentFocusable = this.getCurrentFocusableElement(focusTarget);

    if (!activeHeader || !activePanel || !focusTarget) {
      return;
    }

    const focusableElements = this.getFocusableElements(activePanel);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (currentHeader) {
      if (!event.shiftKey) {
        const nextFocus =
          currentHeader === activeHeader ? firstFocusable ?? this.getNextTabHeader(currentHeader) : this.getNextTabHeader(currentHeader);

        if (nextFocus) {
          event.preventDefault();
          nextFocus.focus();
        }
        return;
      }

      const previousHeader = this.getPreviousTabHeader(currentHeader);
      if (previousHeader) {
        event.preventDefault();
        previousHeader.focus();
      }
      return;
    }

    if (event.shiftKey && firstFocusable && currentFocusable === firstFocusable) {
      event.preventDefault();
      activeHeader.focus();
      return;
    }

    if (!event.shiftKey && lastFocusable && currentFocusable === lastFocusable) {
      const nextHeader = this.getNextTabHeader(activeHeader);
      if (nextHeader) {
        event.preventDefault();
        nextHeader.focus();
      }
    }
  }

  private getActiveTabHeader(): HTMLElement | null {
    return this.objectTabsShell?.nativeElement.querySelector<HTMLElement>(
      ".p-tabview-nav li.p-highlight .p-tabview-nav-link, .p-tabview-nav .p-tabview-selected .p-tabview-nav-link"
    ) ?? null;
  }

  private getNextTabHeader(currentHeader: HTMLElement): HTMLElement | null {
    const tabHeaders = Array.from(
      this.objectTabsShell?.nativeElement.querySelectorAll<HTMLElement>(".p-tabview-nav .p-tabview-nav-link") ?? []
    );
    const currentIndex = tabHeaders.indexOf(currentHeader);

    if (currentIndex === -1 || currentIndex === tabHeaders.length - 1) {
      return null;
    }

    return tabHeaders[currentIndex + 1];
  }

  private getPreviousTabHeader(currentHeader: HTMLElement): HTMLElement | null {
    const tabHeaders = Array.from(
      this.objectTabsShell?.nativeElement.querySelectorAll<HTMLElement>(".p-tabview-nav .p-tabview-nav-link") ?? []
    );
    const currentIndex = tabHeaders.indexOf(currentHeader);

    if (currentIndex <= 0) {
      return null;
    }

    return tabHeaders[currentIndex - 1];
  }

  private getActiveTabPanel(): HTMLElement | null {
    const tabPanels = Array.from(
      this.objectTabsShell?.nativeElement.querySelectorAll<HTMLElement>(".p-tabview-panels .p-tabview-panel") ?? []
    );

    return (
      tabPanels.find(
        (panel) =>
          panel.getAttribute("aria-hidden") !== "true" &&
          !panel.hasAttribute("hidden") &&
          panel.offsetParent !== null
      ) ?? null
    );
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      const ariaHidden = element.getAttribute("aria-hidden") === "true";
      const hiddenByStyle = element.offsetParent === null;
      const isTabPanelHeader = element.classList.contains("p-tabview-nav-link");

      return !ariaHidden && !hiddenByStyle && !isTabPanelHeader;
    });
  }

  private getCurrentFocusableElement(target: HTMLElement | null): HTMLElement | null {
    return (
      target?.closest(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement | null
    ) ?? null;
  }
}
