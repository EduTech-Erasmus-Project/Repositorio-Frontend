import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { ObjectLearning } from 'src/app/core/interfaces/ObjectLearning';
import {
  ExpertConceptEvaluationResponse,
  ExpertEvaluationResultResponse,
  ExpertQuestionEvaluationResponse,
  StudentPublicEvaluationResultResponse,
  StudentPublicGuidelineEvaluationResponse,
  StudentPublicGuidelineGroupResponse,
  StudentPublicPrincipleEvaluationResponse,
} from 'src/app/core/interfaces/api-contracts';
import { LearningObjectService } from 'src/app/services/learning-object.service';

type ReportQualification = 'Si' | 'Parcialmente' | 'No' | 'No aplica';

interface ExpertQuestionEvaluation {
  question: string;
  schema: string | null;
  qualification: string;
  interpreter_yes: string;
  interpreter_partially: string;
  interpreter_no: string;
  interpreter_not_apply: string;
}

interface ExpertConceptEvaluation {
  average: number;
  evaluation_concept: string;
  question_evaluations: ExpertQuestionEvaluation[];
}

interface ExpertEvaluationResult {
  observation: string;
  concept_evaluations: ExpertConceptEvaluation[];
}

interface StudentGuidelineEvaluation {
  question: string;
  qualification: string;
  interpreter_st_yes: string;
  interpreter_st_no: string;
  interpreter_st_partially: string;
  interpreter_st_not_apply: string;
  metadata: string | null;
}

interface StudentGuidelineGroup {
  average_guideline: number;
  guideline_pr: string;
  guideline_evaluations: StudentGuidelineEvaluation[];
}

interface StudentPrincipleEvaluation {
  average_principle: number;
  evaluation_principle: {
    principle: string;
  };
  principle_gl: StudentGuidelineGroup[];
}

interface StudentEvaluationResult {
  rating_student: number;
  observation: string;
  evaluation_students: StudentPrincipleEvaluation[];
}

interface ReportGroup {
  title: string;
  items: string[];
}

interface ReportTab {
  label: string;
  count: number;
  description: string;
  groups: ReportGroup[];
}

interface MetadataComparisonRow {
  id: string;
  matches: string;
  suggestedAction: string;
}

interface SummaryRow {
  label: string;
  value: string;
}

interface AverageRow {
  label: string;
  value: number;
}

/**
 * Construye el reporte publico de evaluacion experta o estudiantil para un OA.
 *
 * Responsabilidades:
 * - Cargar el detalle del objeto y ambas fuentes de evaluacion.
 * - Transformar respuestas del backend a estructuras listas para la UI.
 * - Resolver estados de carga, vacio, error y recarga manual.
 *
 * Notas:
 * - Esta pagina concentra bastante transformacion de dominio; por eso el valor
 *   del saneamiento aqui esta en helpers bien nombrados y documentacion de flujo.
 */
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  standalone: false
})
export class ReportsComponent implements OnInit, OnDestroy {
  public objectData?: ObjectLearning;
  public isStudentReport = false;
  public loading = true;
  public currentSlug = '';

  public expertTabs: ReportTab[] = [];
  public studentTabs: ReportTab[] = [];
  public expertConceptAverages: AverageRow[] = [];
  public metadataHazards: string[] = [];
  public metadataRows: MetadataComparisonRow[] = [];
  public observationExpert = '';
  public observationStudent = '';
  public expertLoadError = false;
  public studentLoadError = false;

  private destroy$ = new Subject<void>();
  private pendingRequests = 0;

  constructor(
    private objectService: LearningObjectService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.isStudentReport = this.parseBoolean(params['rstudent']);
    });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.loadReport(slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get reportHeading(): string {
    return this.isStudentReport
    ? 'Informe de evaluación de adaptabilidad'
    : 'Informe de evaluación de accesibilidad';
  }

  get reportModeLabel(): string {
    return this.isStudentReport ? 'Reporte de estudiante' : 'Reporte de experto';
  }

  get reportModeDescription(): string {
    return this.isStudentReport
      ? 'Resumen de la evaluación realizada por estudiantes.'
      : 'Resumen de la evaluación realizada por expertos.';
  }

  get objectTitle(): string {
    return this.objectData?.general_title || this.objectData?.slug || 'Objeto de aprendizaje';
  }

  get authorName(): string {
    const firstName = this.objectData?.user_created?.first_name || '';
    const lastName = this.objectData?.user_created?.last_name || '';
    return `${firstName} ${lastName}`.trim();
  }

  get currentObservation(): string {
    return this.isStudentReport ? this.observationStudent : this.observationExpert;
  }

  get activeReportLoadError(): boolean {
    return this.isStudentReport ? this.studentLoadError : this.expertLoadError;
  }

  get showEmptyReportState(): boolean {
    if (this.loading || this.activeReportLoadError || !this.objectData) {
      return false;
    }

    return this.isStudentReport ? !this.hasStudentContent() : !this.hasExpertContent();
  }

  get ratingLabel(): string {
    if (this.objectData?.rating == null) {
      return '--';
    }

    return Number(this.objectData.rating).toFixed(1);
  }

  get objectInfoRows(): SummaryRow[] {
    return this.buildSummaryRows([
      ['Area de conocimiento', this.objectData?.knowledge_area?.name],
      ['Desarrollado por', this.authorName],
      ['Fecha de publicacion', this.objectData?.created],
      ['Cobertura', this.objectData?.general_coverage],
      ['Requerimientos', this.objectData?.technical_installationRremarks]
    ]);
  }

  get objectSummaryRows(): SummaryRow[] {
    return this.buildSummaryRows([
      ['Descripcion', this.objectData?.general_description],
      ['Objetivo', this.objectData?.educational_description],
      ['Palabras clave', this.objectData?.general_keyword],
      ['Ubicacion tecnica', this.objectData?.technical_location],
      ['Catalogo', this.objectData?.relation_catalog],
      ['Dificultad', this.objectData?.educational_difficulty],
      ['Idioma', this.objectData?.general_language]
    ]);
  }

  get expertStats(): SummaryRow[] {
    return this.expertTabs.map((tab) => ({
      label: tab.label,
      value: String(tab.count)
    }));
  }

  get studentStats(): SummaryRow[] {
    return this.studentTabs.map((tab) => ({
      label: tab.label,
      value: String(tab.count)
    }));
  }

  /**
   * Inicializa o recarga el reporte completo para el slug activo.
   */
  private loadReport(slug: string): void {
    this.loading = true;
    this.currentSlug = slug;
    this.resetState();
    this.cdr.detectChanges();

    this.objectService.getObjectDetail(slug).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: ObjectLearning) => {
        this.objectData = res;

        if (!this.objectData?.id) {
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const metadataReferences = this.extractMetadataReferences(this.objectData);

        this.pendingRequests = 2;
        this.loadStudentReport(this.objectData.id);
        this.loadExpertReport(this.objectData.id, metadataReferences);
      },
      error: (err: HttpErrorResponse) => {
        this.handleDetailError(err);
      }
    });
  }

  private handleDetailError(err: HttpErrorResponse): void {
    this.router.navigate([err?.status === 404 ? '/notfound' : '/error']);
  }

  /**
   * Carga y normaliza la evaluacion experta, incluyendo comparacion de metadatos.
   */
  private loadExpertReport(id: number, metadataReferences: string[]): void {
    this.objectService.getResultsEvaluation(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.finishPendingRequest())
    ).subscribe({
      next: (res: ExpertEvaluationResultResponse[]) => {
        const results = (res || []).map((item) => ({
          observation: item.observation || '',
          concept_evaluations: (item.concept_evaluations || []).map((concept: ExpertConceptEvaluationResponse) => ({
            average: Number(concept.average) || 0,
            evaluation_concept: concept.evaluation_concept?.concept || 'Concepto',
            question_evaluations: (concept.question_evaluations || []).map((question: ExpertQuestionEvaluationResponse) => ({
              question: question.question || '',
              schema: question.schema || null,
              qualification: question.qualification || '',
              interpreter_yes: question.interpreter_yes || '',
              interpreter_partially: question.interpreter_partially || '',
              interpreter_no: question.interpreter_no || '',
              interpreter_not_apply: question.interpreter_not_apply || ''
            }))
          }))
        })) as ExpertEvaluationResult[];

        this.observationExpert = results[0]?.observation || '';
        this.expertConceptAverages = this.buildExpertConceptAverages(results);
        this.metadataHazards = this.extractAccessibilityHazards(results);
        this.metadataRows = this.buildMetadataRows(results, metadataReferences);
        this.expertTabs = [
          {
            label: 'Excelente',
            count: this.countExpertQuestions(results, 'Si'),
            description: 'Aspectos positivos identificados por la evaluacion del experto.',
            groups: this.buildExpertGroups(results, 'Si', 'interpreter_yes')
          },
          {
            label: 'Regular',
            count: this.countExpertQuestions(results, 'Parcialmente'),
            description: 'Aspectos parcialmente logrados que necesitan ajustes.',
            groups: this.buildExpertGroups(results, 'Parcialmente', 'interpreter_partially')
          },
          {
            label: 'Por alcanzar',
            count: this.countExpertQuestions(results, 'No'),
            description: 'Aspectos que requieren trabajo prioritario.',
            groups: this.buildExpertGroups(results, 'No', 'interpreter_no')
          },
          {
            label: 'No aplica',
            count: this.countExpertQuestions(results, 'No aplica'),
            description: 'Aspectos que no corresponden al tipo de contenido evaluado.',
            groups: this.buildExpertGroups(results, 'No aplica', 'interpreter_not_apply')
          }
        ];
        this.cdr.detectChanges();
      },
      error: () => {
        this.expertLoadError = true;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Carga y normaliza la evaluacion estudiantil agrupada por principios y pautas.
   */
  private loadStudentReport(id: number): void {
    this.objectService.getObjectResultsPublicEvaluationStudent(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.finishPendingRequest())
    ).subscribe({
      next: (res: StudentPublicEvaluationResultResponse[]) => {
        const results = (res || []).map((item) => ({
          rating_student: Number(item.rating) || 0,
          observation: item.observation || '',
          evaluation_students: (item.evaluation_students || []).map((principle: StudentPublicPrincipleEvaluationResponse) => ({
            average_principle: Number(principle.average_principle) || 0,
            evaluation_principle: {
              principle: principle.evaluation_principle?.principle || 'Principio'
            },
            principle_gl: (principle.principle_gl || []).map((guideline: StudentPublicGuidelineGroupResponse) => ({
              average_guideline: Number(guideline.average_guideline) || 0,
              guideline_pr: guideline.guideline_pr?.guideline || 'Pauta',
              guideline_evaluations: (guideline.guideline_evaluations || []).map((evaluation: StudentPublicGuidelineEvaluationResponse) => ({
                question: evaluation.question || '',
                qualification: evaluation.qualification || '',
                interpreter_st_yes: evaluation.interpreter_st_yes || '',
                interpreter_st_no: evaluation.interpreter_st_no || '',
                interpreter_st_partially: evaluation.interpreter_st_partially || '',
                interpreter_st_not_apply: evaluation.interpreter_st_not_apply || '',
                metadata: evaluation.metadata || null
              }))
            }))
          }))
        })) as StudentEvaluationResult[];

        this.observationStudent = results[0]?.observation || '';
        this.studentTabs = [
          {
            label: 'Excelente',
            count: this.countStudentQuestions(results, 'Si'),
            description: 'Aspectos positivos identificados por los estudiantes.',
            groups: this.buildStudentGroups(results, 'Si', 'interpreter_st_yes')
          },
          {
            label: 'Regular',
            count: this.countStudentQuestions(results, 'Parcialmente'),
            description: 'Aspectos parcialmente logrados desde la evaluacion estudiantil.',
            groups: this.buildStudentGroups(results, 'Parcialmente', 'interpreter_st_partially')
          },
          {
            label: 'Por alcanzar',
            count: this.countStudentQuestions(results, 'No'),
            description: 'Aspectos negativos o pendientes identificados por los estudiantes.',
            groups: this.buildStudentGroups(results, 'No', 'interpreter_st_no')
          },
          {
            label: 'No aplica',
            count: this.countStudentQuestions(results, 'No aplica'),
            description: 'Aspectos que no aplican al recurso evaluado.',
            groups: this.buildStudentGroups(results, 'No aplica', 'interpreter_st_not_apply')
          }
        ];
        this.cdr.detectChanges();
      },
      error: () => {
        this.studentLoadError = true;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Reintenta la carga del reporte usando el ultimo slug visitado.
   */
  public reloadCurrentReport(): void {
    if (this.currentSlug) {
      this.loadReport(this.currentSlug);
    }
  }

  private buildExpertGroups(
    results: ExpertEvaluationResult[],
    qualification: ReportQualification,
    field: 'interpreter_yes' | 'interpreter_partially' | 'interpreter_no' | 'interpreter_not_apply'
  ): ReportGroup[] {
    const groupMap = new Map<string, string[]>();

    results.forEach((result) => {
      result.concept_evaluations.forEach((concept) => {
        const items = concept.question_evaluations
          .filter((question) => question.qualification === qualification)
          .map((question) => this.resolveExpertQuestionText(question, field))
          .filter(Boolean);

        if (!items.length) {
          return;
        }

        const currentItems = groupMap.get(concept.evaluation_concept) || [];
        groupMap.set(concept.evaluation_concept, [...currentItems, ...items]);
      });
    });

    return Array.from(groupMap.entries()).map(([title, items]) => ({ title, items }));
  }

  private buildStudentGroups(
    results: StudentEvaluationResult[],
    qualification: ReportQualification,
    field: 'interpreter_st_yes' | 'interpreter_st_partially' | 'interpreter_st_no' | 'interpreter_st_not_apply'
  ): ReportGroup[] {
    const groupMap = new Map<string, string[]>();

    results.forEach((result) => {
      result.evaluation_students.forEach((principle) => {
        const principleName = principle.evaluation_principle?.principle || 'Principio';

        principle.principle_gl.forEach((guideline) => {
          guideline.guideline_evaluations
            .filter((evaluation) => evaluation.qualification === qualification)
            .forEach((evaluation) => {
              const text = this.resolveStudentQuestionText(evaluation, field);
              const currentItems = groupMap.get(principleName) || [];

              if (text) {
                currentItems.push(`${guideline.guideline_pr}: ${text}`);
              }

              groupMap.set(principleName, currentItems);
            });
        });
      });
    });

    return Array.from(groupMap.entries())
      .map(([title, items]) => ({ title, items }))
      .filter((group) => group.items.length > 0);
  }

  /**
   * Compara referencias observadas por el experto contra metadatos presentes en el OA.
   */
  private buildMetadataRows(
    results: ExpertEvaluationResult[],
    metadataReferences: string[]
  ): MetadataComparisonRow[] {
    const rowMap = new Map<string, MetadataComparisonRow>();

    results.forEach((result) => {
      result.concept_evaluations.forEach((concept) => {
        concept.question_evaluations.forEach((question) => {
          const schema = question.schema?.trim();

          if (!schema) {
            return;
          }

          const normalizedSchema = schema.toLowerCase();
          const isPositiveQualification =
            question.qualification === 'Si' || question.qualification === 'Parcialmente';
          const isPresentInMetadata = metadataReferences.includes(normalizedSchema);
          const matches = isPresentInMetadata === isPositiveQualification ? 'Si' : 'No';
          const suggestedAction =
            !isPresentInMetadata && isPositiveQualification
              ? 'Incluir'
              : isPresentInMetadata && question.qualification === 'No'
                ? 'Quitar'
                : '-';

          const existingRow = rowMap.get(schema);

          if (!existingRow) {
            rowMap.set(schema, { id: schema, matches, suggestedAction });
            return;
          }

          if (existingRow.matches !== 'No' && matches === 'No') {
            existingRow.matches = 'No';
          }

          if (existingRow.suggestedAction === '-' && suggestedAction !== '-') {
            existingRow.suggestedAction = suggestedAction;
          }
        });
      });
    });

    return Array.from(rowMap.values());
  }

  private buildExpertConceptAverages(results: ExpertEvaluationResult[]): AverageRow[] {
    const conceptMap = new Map<string, { total: number; count: number }>();

    results.forEach((result) => {
      result.concept_evaluations.forEach((concept) => {
        const current = conceptMap.get(concept.evaluation_concept) || { total: 0, count: 0 };
        current.total += concept.average;
        current.count += 1;
        conceptMap.set(concept.evaluation_concept, current);
      });
    });

    return Array.from(conceptMap.entries()).map(([label, value]) => ({
      label,
      value: value.count ? value.total / value.count : 0
    }));
  }

  private extractAccessibilityHazards(results: ExpertEvaluationResult[]): string[] {
    const hazards = new Set<string>();

    results.forEach((result) => {
      result.concept_evaluations.forEach((concept) => {
        concept.question_evaluations.forEach((question) => {
          const schema = question.schema?.trim();
          if (schema && schema.toLowerCase().includes('accessibilityhazard:')) {
            hazards.add(schema);
          }
        });
      });
    });

    return Array.from(hazards);
  }

  /**
   * Extrae referencias de metadatos de accesibilidad desde el detalle del OA.
   */
  private extractMetadataReferences(objectData: ObjectLearning): string[] {
    const references: string[] = [];

    Object.keys(objectData || {}).forEach((key) => {
      const rawValue = (objectData as unknown as Record<string, unknown>)[key];

      if (typeof rawValue !== 'string' || !rawValue.trim()) {
        return;
      }

      if (!key.includes('accesibility') && !key.includes('annotation_mode')) {
        return;
      }

      const normalizedSourceKey = key.replace(/_/g, '');
      const normalizedKey = normalizedSourceKey
        .replace('accesibilityfeatures', 'accessibilityfeature')
        .replace('accesibilitycontrol', 'accessibilitycontrol')
        .replace('accesibilityhazard', 'accessibilityhazard')
        .replace('annotationmodeaccess', 'accesmode')
        .replace('accesibilityapi', 'accessibilityapi')
        .replace('accesibilitysummary', 'accessibilitysummary')
        .toLowerCase();

      rawValue.split(',').forEach((value) => {
        const normalizedValue = value.trim().toLowerCase();
        if (normalizedValue) {
          references.push(`${normalizedKey}:${normalizedValue}`);
        }
      });
    });

    return references;
  }

  private countExpertQuestions(results: ExpertEvaluationResult[], qualification: ReportQualification): number {
    return results.reduce((total, result) => {
      return total + result.concept_evaluations.reduce((conceptTotal, concept) => {
        return conceptTotal + concept.question_evaluations.filter((question) => question.qualification === qualification).length;
      }, 0);
    }, 0);
  }

  private countStudentQuestions(results: StudentEvaluationResult[], qualification: ReportQualification): number {
    return results.reduce((total, result) => {
      return total + result.evaluation_students.reduce((principleTotal, principle) => {
        return principleTotal + principle.principle_gl.reduce((guidelineTotal, guideline) => {
          return guidelineTotal + guideline.guideline_evaluations.filter((evaluation) => evaluation.qualification === qualification).length;
        }, 0);
      }, 0);
    }, 0);
  }

  private buildSummaryRows(entries: Array<[string, unknown]>): SummaryRow[] {
    return entries
      .map(([label, value]) => ({
        label,
        value: this.formatValue(value)
      }))
      .filter((entry) => !!entry.value);
  }

  private formatValue(value: unknown): string {
    if (value == null) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return String(value).trim();
  }

  private cleanSentence(value: string): string {
    return String(value || '').replace(/\s+/g, ' ').trim().replace(/\.+$/, '');
  }

  private resolveExpertQuestionText(
    question: ExpertQuestionEvaluation,
    field: 'interpreter_yes' | 'interpreter_partially' | 'interpreter_no' | 'interpreter_not_apply'
  ): string {
    const interpreterText = this.cleanSentence(question[field] || '');

    if (field === 'interpreter_not_apply' && this.isGenericNotApply(interpreterText)) {
      return this.cleanSentence(question.question);
    }

    return interpreterText || this.cleanSentence(question.question);
  }

  private resolveStudentQuestionText(
    evaluation: StudentGuidelineEvaluation,
    field: 'interpreter_st_yes' | 'interpreter_st_partially' | 'interpreter_st_no' | 'interpreter_st_not_apply'
  ): string {
    const interpreterText = this.cleanSentence(evaluation[field] || '');

    if (field === 'interpreter_st_not_apply' && this.isGenericNotApply(interpreterText)) {
      return this.cleanSentence(evaluation.question);
    }

    return interpreterText || this.cleanSentence(evaluation.question);
  }

  private isGenericNotApply(value: string): boolean {
    return value.toLowerCase() === 'no aplica';
  }

  private parseBoolean(value: unknown): boolean {
    return value === true || value === 'true' || value === '1';
  }

  /**
   * Limpia el estado derivado antes de cargar un nuevo reporte.
   */
  private resetState(): void {
    this.objectData = undefined;
    this.expertTabs = [];
    this.studentTabs = [];
    this.expertConceptAverages = [];
    this.metadataHazards = [];
    this.metadataRows = [];
    this.observationExpert = '';
    this.observationStudent = '';
    this.expertLoadError = false;
    this.studentLoadError = false;
    this.pendingRequests = 0;
    this.cdr.detectChanges();
  }

  private hasExpertContent(): boolean {
    return (
      this.expertTabs.some((tab) => tab.count > 0 || tab.groups.length > 0) ||
      this.expertConceptAverages.length > 0 ||
      this.metadataHazards.length > 0 ||
      this.metadataRows.length > 0 ||
      !!this.observationExpert.trim()
    );
  }

  private hasStudentContent(): boolean {
    return (
      this.studentTabs.some((tab) => tab.count > 0 || tab.groups.length > 0) ||
      !!this.observationStudent.trim()
    );
  }

  /**
   * Lleva el conteo de requests pendientes para cerrar el loading principal.
   */
  private finishPendingRequest(): void {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);
    if (this.pendingRequests === 0) {
      this.loading = false;
    }
    this.cdr.detectChanges();
  }
}
