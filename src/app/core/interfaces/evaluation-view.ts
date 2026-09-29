/**
 * Modelos de vista derivados de respuestas de evaluacion para consumo de
 * componentes publicos como `card`, `view-evaluacions` y `evaluation-chart`.
 */

export interface ExpertEvaluationQuestionView {
  value?: number;
  questions: string;
  qualification: string;
}

export interface ExpertEvaluationConceptView {
  evaluationConcept: string;
  average: number;
  questionEvaluations: ExpertEvaluationQuestionView[];
}

export interface ExpertEvaluationDetailView {
  id?: number;
  observation: string;
  conceptEvaluations: ExpertEvaluationConceptView[];
}

export interface ExpertEvaluationSummaryConceptView {
  concepto: {
    concept?: string;
  };
  total: number;
}

export interface ExpertEvaluationSummaryView {
  concepts: ExpertEvaluationSummaryConceptView[];
}

export interface AutomaticEvaluationMetadataView {
  value?: number;
  schema: string;
  qualification: string;
  description?: string | null;
}

export interface AutomaticEvaluationConceptView {
  evaluationConcept: string;
  average: number;
  metadata_evaluations: AutomaticEvaluationMetadataView[];
}

export interface AutomaticEvaluationView {
  rating: number;
  metadata_concept_evaluations: AutomaticEvaluationConceptView[];
}

export interface StudentEvaluationQuestionView {
  question: string;
  qualification: string;
  interpreter_st_yes?: string;
  interpreter_st_no?: string;
  interpreter_st_partially?: string;
  interpreter_st_not_apply?: string;
  metadata?: string | null;
}

export interface StudentEvaluationGuidelineView {
  average_guideline: number;
  guideline_pr: string;
  guideline_evaluations: StudentEvaluationQuestionView[];
}

export interface StudentEvaluationPrincipleView {
  average_principle: number;
  evaluation_principle: {
    principle: string;
  };
  principle_gl: StudentEvaluationGuidelineView[];
}

export interface StudentEvaluationView {
  rating_student: number;
  observation: string;
  evaluation_students: StudentEvaluationPrincipleView[];
}
