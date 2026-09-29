
import { ChangeDetectorRef, Component, EventEmitter, HostBinding, Input, OnInit, Output } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { ConfirmationService, MessageService } from "primeng/api";
import { firstValueFrom, Observable } from 'rxjs';
import { LearningObjectService } from 'src/app/services/learning-object.service';
import { LoginService } from "src/app/services/login.service";
import { LanguageService } from "src/app/services/language.service";
import { UserService } from "src/app/services/user.service";
import { FocusOrigin, captureFocusOrigin, restoreFocusOrigin } from "src/app/core/utils/accessibility-focus";
import {
  ApiMessageResponse,
  AutomaticEvaluationResultResponse,
  ExpertEvaluationResultResponse,
  ExpertPriorityEvaluationResponse,
  LearningObjectLikesTotalResponse,
  OerIntegrationResponse,
  StudentPublicEvaluationResultResponse,
} from "src/app/core/interfaces/api-contracts";
import {
  AutomaticEvaluationView,
  ExpertEvaluationDetailView,
  ExpertEvaluationSummaryView,
  StudentEvaluationView,
} from "src/app/core/interfaces/evaluation-view";
import { translateInstant } from "src/app/core/utils/i18n.utils";
import { openTrustedExternalUrl } from "src/app/core/utils/external-navigation.utils";

/**
 * Renderiza una tarjeta reutilizable de OA para listados publicos y de configuracion.
 *
 * Responsabilidades:
 * - Mostrar metrica resumida, CTA principal y acciones segun el contexto de uso.
 * - Cargar evaluaciones resumidas asociadas a la tarjeta cuando el flujo lo pide.
 * - Encapsular acciones sensibles como eliminar OA, abrir dialogs o disparar OER-ADAP.
 */
@Component({
    selector: "app-card",
    templateUrl: "./card.component.html",
    styleUrls: ["./card.component.scss"],
    standalone: false
})
export class CardComponent implements OnInit {
  @Input() object: ObjectLearning;
  @Input() teacherOptions?: boolean;
  //Opciones de visualizacion para el experto
  @Input() expertOptions?: boolean;
  @Input() expertOptionsView?: boolean;
  //Opciones de visuzalizacion para el estudiante
  @Input() studentOptions?: boolean;
  @Input() studentOptionsView?: boolean;
  @Output() deleteOptions = new EventEmitter<boolean>();

  public show = false;
  public showFla = false;
  public resultsEv: Array<ExpertEvaluationDetailView | ExpertEvaluationSummaryView> | null = null;
  public resultsEvViewExpert: ExpertEvaluationSummaryView[] | null = null;
  public resultEvalCero = false;
  public resultEvalCeroExpert = false;
  public display = false;
  public displayautomatic = false;
  public displaystudent = false;
  public resultsEvAut: AutomaticEvaluationView[] = [];
  public resultsEvStudent: StudentEvaluationView[] | null = null;
  public automaticEvaluationLoaded = false;
  public progressBarSpinner = false;
  public numberLikes: number = 0;
  public ratingPopoverStyle: { [klass: string]: string } = {
    maxWidth: 'min(42rem, calc(100vw - 2rem))'
  };
  private lastDialogFocusOrigin: FocusOrigin | null = null;

  @HostBinding("class.card-host--teacher")
  get isTeacherCard(): boolean {
    return !!this.teacherOptions;
  }

  @HostBinding("style.height")
  get hostHeight(): string {
    return this.teacherOptions ? "auto" : "100%";
  }

  get cardStyle(): { [klass: string]: string } {
    return this.teacherOptions ? { width: "100%" } : { width: "100%", height: "100%" };
  }

  get cardImageStyle(): { [klass: string]: string } {
    return {
      "background-image": this.object?.avatar ? `url(${this.object.avatar})` : "none"
    };
  }

  constructor(
    private router: Router,
    private objectService: LearningObjectService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loginService: LoginService,
    private languageService: LanguageService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.reloadCardData();
  }
  //>>>>>>>>>>>>>>>>>>>>>
  showDialog(event?: Event, triggerId?: string) {
    this.lastDialogFocusOrigin = captureFocusOrigin(event, triggerId);
    this.display = true;
  }
  showDialogstudent(event?: Event, triggerId?: string) {
    this.lastDialogFocusOrigin = captureFocusOrigin(event, triggerId);
    this.displaystudent = true;
  }
  showDialogautomatic(event?: Event, triggerId?: string) {
    this.lastDialogFocusOrigin = captureFocusOrigin(event, triggerId);
    this.displayautomatic = true;
  }

  toggleRatingPopover(popover: { toggle: (event: Event) => void }, event: Event) {
    const trigger = event.currentTarget as HTMLElement | null;
    const triggerWidth = trigger?.getBoundingClientRect().width ?? 0;

    this.ratingPopoverStyle = {
      width: triggerWidth > 0 ? `${Math.round(triggerWidth)}px` : 'min(42rem, calc(100vw - 2rem))',
      maxWidth: 'min(42rem, calc(100vw - 2rem))'
    };

    popover.toggle(event);
  }

  restoreDialogFocus() {
    const origin = this.lastDialogFocusOrigin;
    this.lastDialogFocusOrigin = null;
    restoreFocusOrigin(origin);
  }

  //>>>>>>>>>>>>>>>>>>>>

  /**
   * Funcion que devuelve la puntuacion de likes en un objeto de aprendizaje 
   * @method learning_object_liked_total
   */
  private async learning_object_liked_total(){
    try {
      const res = await firstValueFrom(
        this.objectService.get_liked_learningObject(this.object.id)
      );
      this.numberLikes = this.extractLikesTotal(res);
    } catch {
      this.numberLikes = 0;
    } finally {
      this.cdr.detectChanges();
    }
  }

  navigateTo() {
    this.router.navigate(['/object', this.object.slug])
  }

  async loadData() {
    this.resultsEv = null;
    this.resultsEvViewExpert = null;
    this.resultEvalCero = false;
    this.resultEvalCeroExpert = false;

    try {
      if (this.roleExpert) {
        const res = await firstValueFrom(
          this.objectService.getObjectResultsEvaluation(this.object.id)
        );
        if (res.length > 0) {
          this.resultsEv = res.map((item) => this.mapExpertEvaluationDetail(item));
        } else {
          this.resultEvalCero = true;
        }
      } else {
        const res = await firstValueFrom(
          this.objectService.getResultsEvaluationPriority(this.object.id)
        );
        if (res.length > 0) {
          this.resultsEv = res.map((item) => this.mapPriorityEvaluationSummary(item));
        } else {
          this.resultEvalCero = true;
        }
      }
    } catch {
      this.resultsEv = null;
      this.resultEvalCero = true;
    }

    try {
      if (this.expertOptionsView || this.expertOptions) {
        const res = await firstValueFrom(
          this.objectService.getResultsEvaluationSingle(this.object.id)
        );
        if (res.length > 0) {
          this.resultsEvViewExpert = res.map((item) => this.mapPriorityEvaluationSummary(item));
        } else {
          this.resultEvalCeroExpert = true;
        }
      }
    } catch {
      this.resultsEvViewExpert = null;
      this.resultEvalCeroExpert = true;
    } finally {
      this.cdr.detectChanges();
    }
  }

  get objectId() {
    return this.object.id
  }

  get isObjectApproved(): boolean {
    const value = this.object?.public as unknown;

    if (typeof value === "string") {
      return ["true", "1"].includes(value.toLowerCase());
    }

    if (typeof value === "number") {
      return value === 1;
    }

    return value === true;
  }

  get publicationStatusLabelKey(): string {
    return this.isObjectApproved
      ? "object.publicationApproved"
      : "object.publicationPending";
  }

  get publicationStatusHelpKey(): string {
    return this.isObjectApproved
      ? "object.publicationApprovedHelp"
      : "object.publicationPendingHelp";
  }

  get authorName(): string {
    const firstName = this.object?.user_created?.first_name || "";
    const lastName = this.object?.user_created?.last_name || "";
    return `${firstName} ${lastName}`.trim();
  }



  onclickEdid() {

    this.router.navigateByUrl(`settings/edit-object/${this.object.id}`);
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  get roleTeacher() {
    return this.loginService.validateRole("teacher");
  }


  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  /**
   * Funcion que muestra los resultados de la evaluacion automatica
   * @method loadDataAutomatic
   */
  async loadDataAutomatic() {
    this.resultsEvAut = [];
    this.automaticEvaluationLoaded = false;
    try {
      const res = await firstValueFrom(
        this.objectService.getObjectResultsEvaluationAutomatic(this.object.id)
      );
        this.resultsEvAut = res.map((item) => this.mapAutomaticEvaluation(item));
    } catch {
      this.resultsEvAut = [];
    } finally {
      this.automaticEvaluationLoaded = true;
      this.cdr.detectChanges();
    }
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  async loadstudentSingle() {
    this.loadStudentEvaluationResults(
      this.objectService.getObjectResultsPublicEvaluationStudentSingle(this.object.id)
    );
  }

  async loadstudent() {
    this.loadStudentEvaluationResults(
      this.objectService.getObjectResultsPublicEvaluationStudent(this.object.id)
    );
  }
  navigateToReport(valid: boolean) {
    if (valid) {
      const extras: NavigationExtras = {
        queryParams: { rstudent: true },
      };
      this.router.navigate(['/report', this.object.slug], extras)
    } else {
      this.router.navigate(['/report', this.object.slug])
    }
  }

  getDialogTriggerId(key: string) {
    return `card-${key}-trigger-${this.object?.id ?? "unknown"}`;
  }

  async deleteLearningObject(event: Event) {
    this.confirmationService.confirm({
      target: event.target,
      message: await firstValueFrom(this.languageService.translate.get("object.oaQuestion")),
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        //confirm action
        const result = await firstValueFrom(
          this.objectService.deleteObjestTeacher(this.object.learning_object_file.id)
        );

        if (result.code === 200) {
          this.reloadCardData();
          this.showSuccess(
            await firstValueFrom(this.languageService.translate.get("object.delesteSuccess"))
          );
          this.deleteOptions.emit(true);
        }
      },
      reject: () => {
        //reject action
      }
    });

  }

  showSuccess(message) {
    this.messageService.add({
      severity: 'success',
      summary: translateInstant(this.languageService.translate, "message.titleSuccess", "Success"),
      detail: message
    });
  }

  get is_adapted_oer() {
    return this.object.is_adapted_oer;
  }


  public async set_oa_oeradapt() {
    this.progressBarSpinner = true;
    const data = await this.buildOerAdaptPayload();
    let data_integrate: OerIntegrationResponse | null = null;
    try {
      const setOer = await firstValueFrom(this.objectService.set_learningObject(data));
     
      if (setOer) {
        data_integrate = setOer;
        this.applyOerAdaptResponse(setOer);
        this.showSuccess(
          await firstValueFrom(this.languageService.translate.get("register.objectUploadOer"))
        );
        this.progressBarSpinner = false;
      }
    } catch (err) {
      this.showError(err.message);
      return
    }

    try {
      if (!data_integrate) {
        return;
      }
      const save_data_integrate = await firstValueFrom(this.objectService.save_Integration_With_OerAdap(data_integrate));
      if (save_data_integrate.status === 200) {
        if (this.object.learning_object_file.oa_oer_adap_url) {
          if (!openTrustedExternalUrl(this.object.learning_object_file.oa_oer_adap_url)) {
            await this.showError(
              translateInstant(
                this.languageService.translate,
                "object.invalidExternalUrl",
                "La URL del recurso no es valida o no esta permitida."
              )
            );
          }
        }
      }
    } catch (err) {
      this.showError(err.message);
    }
  }

  private async showError(message) {
    this.messageService.add({
      severity: "error",
      summary: translateInstant(this.languageService.translate, "message.titleError", "Error"),
      detail: message,
    });
  }
  public goToLink(ulr: string) {
    if (!openTrustedExternalUrl(ulr)) {
      void this.showError(
        translateInstant(
          this.languageService.translate,
          "object.invalidExternalUrl",
          "La URL del recurso no es valida o no esta permitida."
        )
      );
    }
  }

  public async get_user_key() {
    const userSub = await firstValueFrom(this.userService.getUserDetail(this.loginService.user.id));
    return typeof userSub.user_key === "string" ? userSub.user_key : undefined;
  }

  private reloadCardData() {
    this.numberLikes = 0;
    this.resultsEvStudent = null;
    this.loadData();
    this.learning_object_liked_total();

    if (this.teacherOptions) {
      this.loadDataAutomatic();
      this.loadstudent();
      return;
    }

    if (this.studentOptions || this.studentOptionsView) {
      this.loadstudentSingle();
    }
  }

  private extractLikesTotal(response: Array<{ total?: number }>): number {
    return response?.[0]?.total ?? 0;
  }

  private mapExpertEvaluationDetail(item: ExpertEvaluationResultResponse): ExpertEvaluationDetailView {
    return {
      conceptEvaluations: (item.concept_evaluations || []).map((conceptEvaluation) => ({
        evaluationConcept: conceptEvaluation.evaluation_concept?.concept || "",
        average: Number(conceptEvaluation.average) || 0,
        questionEvaluations: (conceptEvaluation.question_evaluations || []).map((questionEvaluation) => ({
          value: questionEvaluation.id,
          questions: questionEvaluation.question || "",
          qualification: questionEvaluation.qualification || "",
        })),
      })),
      observation: item.observation || "",
      id: item.id,
    };
  }

  private mapPriorityEvaluationSummary(item: ExpertPriorityEvaluationResponse): ExpertEvaluationSummaryView {
    return {
      concepts: (item.concept_evaluations || []).map((conceptEvaluation) => ({
        concepto: typeof conceptEvaluation.evaluation_concept === "string"
          ? { concept: conceptEvaluation.evaluation_concept }
          : conceptEvaluation.evaluation_concept || {},
        total: Number(conceptEvaluation.average) || 0,
      })),
    };
  }

  private mapAutomaticEvaluation(item: AutomaticEvaluationResultResponse): AutomaticEvaluationView {
    return {
      rating: Number(item.rating_schema) || 0,
      metadata_concept_evaluations: (item.metadata_concept_evaluations || []).map((conceptEvaluation) => ({
        evaluationConcept: conceptEvaluation.evaluation_concept?.concept || "",
        average: Number(conceptEvaluation.average_schema) || 0,
        metadata_evaluations: (conceptEvaluation.metadata_evaluations || []).map((metadataEvaluation) => ({
          value: metadataEvaluation.id,
          schema: metadataEvaluation.schema || "",
          qualification: metadataEvaluation.qualification || "",
          description: metadataEvaluation.description,
        })),
      })),
    };
  }

  private mapStudentEvaluation(item: StudentPublicEvaluationResultResponse): StudentEvaluationView {
    return {
      rating_student: Number(item.rating) || 0,
      observation: item.observation || "",
      evaluation_students: (item.evaluation_students || []).map((evaluation) => ({
        average_principle: Number(evaluation.average_principle) || 0,
        evaluation_principle: {
          principle: evaluation.evaluation_principle?.principle || "",
        },
        principle_gl: (evaluation.principle_gl || []).map((guideline) => ({
          average_guideline: Number(guideline.average_guideline) || 0,
          guideline_pr: guideline.guideline_pr?.guideline || "",
          guideline_evaluations: (guideline.guideline_evaluations || []).map((questionEvaluation) => ({
            question: questionEvaluation.question || "",
            qualification: questionEvaluation.qualification || "",
            interpreter_st_yes: questionEvaluation.interpreter_st_yes,
            interpreter_st_no: questionEvaluation.interpreter_st_no,
            interpreter_st_partially: questionEvaluation.interpreter_st_partially,
            interpreter_st_not_apply: questionEvaluation.interpreter_st_not_apply,
            metadata: questionEvaluation.metadata,
          })),
        })),
      })),
    };
  }

  private async loadStudentEvaluationResults(request$: Observable<StudentPublicEvaluationResultResponse[]>) {
    try {
      const res = await firstValueFrom(request$);
      this.resultsEvStudent = res.length > 0 ? res.map((item) => this.mapStudentEvaluation(item)) : [];
    } catch {
      this.resultsEvStudent = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  private async buildOerAdaptPayload() {
    return {
      id: this.object.learning_object_file.id,
      file: this.object.learning_object_file.file,
      user_key: await this.get_user_key(),
    };
  }

  private applyOerAdaptResponse(response: OerIntegrationResponse) {
    if (!response.data) {
      return;
    }
    this.object.learning_object_file.oa_created_at = response.data.created_at;
    this.object.learning_object_file.oa_expires_at = response.data.expires_at;
    this.object.learning_object_file.oa_oer_adap_url = response.data.oer_adap;
    this.object.learning_object_file.oa_preview_adapted = response.data.preview_adapted;
    this.object.learning_object_file.oa_preview_origin = response.data.preview_origin;
  }
}

