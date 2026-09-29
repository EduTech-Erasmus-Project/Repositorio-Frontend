import { ObjectLearning } from "./ObjectLearning";

export interface ApiValuesResponse<T> {
  values: T[];
}

export interface ApiPaginationLinks {
  next: string;
  previous: string;
}

/**
 * Paginación clásica basada en `count/pages/links/results`.
 */
export interface ApiPaginatedResponse<T> {
  count: number;
  pages: number;
  links: ApiPaginationLinks;
  results: T[];
}

/**
 * Paginación usada por endpoints más recientes del backend.
 */
export interface ApiCursorPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UserCountSummary {
  total_student?: number;
  total_teacher?: number;
  total_users?: number;
}

export interface LearningObjectApprovedCountSummary {
  total_oa_aproved?: number;
  total?: number;
}

export interface ApiMessageResponse {
  code?: number;
  status?: number | string;
  message?: string;
  detail?: string;
  [key: string]: unknown;
}

export interface ApiReferenceResponse {
  reference: string;
}

export interface CommentCreateResponse {
  id?: number;
  created?: string | Date;
}

export interface CreatedYearResponse {
  created?: string | number | null;
}

export interface AuthTokenResponse {
  id?: number;
  token?: string;
  access?: string;
  refresh?: string;
}

export interface ReportFilterParams {
  [key: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
}

export interface AdminDashboardLearningObjectSummary {
  total_oa_aproved?: number;
  toatal_oa_disapproved?: number;
}

export interface AdminDashboardUserSummary {
  total_expert_approved?: number;
  total_expert_disapproved?: number;
  total_teacher_approved?: number;
  total_teacher_disapproved?: number;
  total_student?: number;
}

export interface OptionRegisterResponse {
  id?: number;
  description?: string;
  type_option?: string;
}

export type DomainBackendType = "TEACHER" | "EXPERT" | "STUDENT";

export interface EmailDomainPayload {
  domain: string;
  type: DomainBackendType;
  is_active: boolean;
  option_register_email: number | null;
}

export interface EmailDomainResponse {
  id?: number;
  type?: DomainBackendType;
  domain?: string;
  is_active?: boolean;
  option_register?: OptionRegisterResponse | number | null;
  option_register_email?: OptionRegisterResponse | number | null;
}

export interface EmailDomainListResponse extends ApiMessageResponse {
  data?: EmailDomainResponse[];
}

export interface EmailServerConfigResponse {
  id?: number;
  email?: string;
  host?: string;
  port?: number | string;
  username?: string;
  password?: string;
  ssl?: boolean;
  tls?: boolean;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface EmailServerConfigPayload {
  host: string;
  username: string;
  password: string | null;
  port: number | string | null;
  tls: boolean;
  email_from: string;
  emailtest?: string | null;
}

export interface TypeUserOptionRegisterResponse {
  id?: number;
  description?: string;
  option_register?: OptionRegisterResponse | null;
}

export interface AdministratorProfileSummary {
  id?: number;
  country?: number | string | null;
  city?: number | string | null;
  phone?: string | null;
  administrator_is_active?: boolean;
}

export interface ManagedUserProfessionSummary {
  id?: number;
  description?: string;
}

export interface ManagedTeacherSummary {
  id?: number;
  is_active?: boolean;
  teacher_is_active?: boolean;
  professions?: ManagedUserProfessionSummary[];
}

export interface ManagedExpertSummary {
  id?: number;
  is_active?: boolean;
  expert_is_active?: boolean;
  expert_level?: string;
  web?: string | null;
  academic_profile?: string | null;
}

/**
 * Resumen administrativo del usuario gestionado por listados de admin.
 *
 * Mantiene nombres legacy como `rol_aprovados` y `rol_aprobados` porque ambos
 * shapes han aparecido en respuestas históricas del backend.
 */
export interface ManagedUserSummary {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  image?: string;
  image_url?: string;
  roles?: string[];
  rol_aprovados?: string[];
  rol_aprobados?: string[];
  rol_solicitados?: string[];
  teacher?: ManagedTeacherSummary | null;
  collaboratingExpert?: ManagedExpertSummary | null;
  student?: {
    id?: number;
    disability_description?: string | null;
    preferences?: Array<{
      id?: number;
      description?: string;
    }>;
  } | null;
  administrator?: AdministratorProfileSummary | null;
  country?: { id?: number; name?: string } | null;
  province?: { id?: number; name?: string } | null;
  city?: { id?: number; name?: string } | number | null;
  university?: { id?: number; name?: string } | number | null;
  campus?: { id?: number; name?: string } | number | null;
  learning_objects?: Array<{
    general_title?: string;
    learning_object_file?: { url?: string };
  }>;
  [key: string]: unknown;
}

export interface LearningObjectInteractionResponse {
  id?: number;
  liked?: boolean;
  downloaded?: number;
  learning_object?: number;
  [key: string]: unknown;
}

export interface LearningObjectLikesTotalResponse {
  total: number;
}

export interface LearningObjectViewCountResponse {
  view: number;
  learning_object?: number;
}

export interface LearningObjectDownloadCountResponse {
  number: number;
}

export interface OerIntegrationPayloadResponse {
  created_at?: string;
  expires_at?: string;
  oer_adap?: string;
  preview_adapted?: boolean;
  preview_origin?: string;
}

export interface OerIntegrationResponse extends ApiMessageResponse {
  data?: OerIntegrationPayloadResponse;
}

export interface PreferenceAreaOptionResponse {
  id: number;
  description: string;
}

export interface PreferenceAreaGroupResponse {
  id: number;
  preferences_are: string;
  preferences: PreferenceAreaOptionResponse[];
}

export interface SearchFilterPreferenceResponse {
  id?: number;
  preferences?: string;
  search_value?: string;
}

export interface SearchFilterAreaGroupResponse {
  filters_area?: string;
  preferences_filter?: SearchFilterPreferenceResponse[];
}

export interface StudentQuestionResponse {
  id: number;
  question: string;
  description?: string;
}

export interface StudentGuidelineResponse {
  id: number;
  guideline: string;
  questions: StudentQuestionResponse[];
}

export interface StudentPrincipleResponse {
  id: number;
  principle: string;
  guidelines: StudentGuidelineResponse[];
}

export interface ExpertQuestionResponse {
  id: number;
  question: string;
  description?: string;
  schema?: string;
}

export interface ExpertConceptResponse {
  id: number;
  concept: string;
  questions: ExpertQuestionResponse[];
}

export interface StudentEvaluationQuestionResponse {
  id?: number;
  question_id: number;
  question: string;
  qualification: string;
}

export interface StudentEvaluationGuidelineResponse {
  guideline_pr: {
    id?: number;
    guideline: string;
  };
  guideline_evaluations: StudentEvaluationQuestionResponse[];
}

export interface StudentEvaluationPrincipleResponse {
  id: number;
  evaluation_principle: {
    principle: string;
  };
  principle_gl: StudentEvaluationGuidelineResponse[];
}

export interface StudentEvaluationResultResponse {
  id: number;
  observation?: string;
  evaluation_students: StudentEvaluationPrincipleResponse[];
}

export interface EvaluationLearningObjectSummary {
  id: number;
  avatar?: string;
  general_title?: string;
  general_description?: string;
  created?: string;
  public?: boolean;
}

export interface EvaluationParticipantSummary {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface StudentEvaluationAdminListItemResponse {
  id: number;
  rating: number;
  observation?: string;
  learning_object: EvaluationLearningObjectSummary;
  student: EvaluationParticipantSummary;
}

export interface ExpertQuestionEvaluationResponse {
  id?: number;
  question_id?: number;
  question?: string;
  qualification?: string;
  schema?: string | null;
  interpreter_yes?: string;
  interpreter_partially?: string;
  interpreter_no?: string;
  interpreter_not_apply?: string;
}

export interface ExpertConceptEvaluationResponse {
  id?: number;
  average?: number;
  evaluation_concept?: {
    id?: number;
    concept?: string;
  };
  question_evaluations: ExpertQuestionEvaluationResponse[];
}

export interface ExpertEvaluationResultResponse {
  id?: number;
  observation?: string;
  concept_evaluations: ExpertConceptEvaluationResponse[];
}

export interface ExpertEvaluationAdminListItemResponse {
  id: number;
  rating: number;
  observation?: string;
  is_priority?: boolean;
  learning_object: EvaluationLearningObjectSummary;
  collaborating_expert: EvaluationParticipantSummary;
}

export interface ExpertPriorityConceptEvaluationResponse {
  evaluation_concept?: string | { concept?: string };
  average?: number;
}

export interface ExpertPriorityEvaluationResponse {
  concept_evaluations: ExpertPriorityConceptEvaluationResponse[];
}

export interface MetadataAutomaticEvaluationResponse {
  id?: number;
  schema?: string;
  qualification?: string;
  description?: string;
}

export interface MetadataAutomaticConceptEvaluationResponse {
  evaluation_concept?: {
    id?: number;
    concept?: string;
  };
  average_schema?: number;
  metadata_evaluations: MetadataAutomaticEvaluationResponse[];
}

export interface AutomaticEvaluationResultResponse {
  rating_schema?: number;
  metadata_concept_evaluations: MetadataAutomaticConceptEvaluationResponse[];
}

export interface StudentPublicGuidelineEvaluationResponse {
  question?: string;
  qualification?: string;
  interpreter_st_yes?: string;
  interpreter_st_no?: string;
  interpreter_st_partially?: string;
  interpreter_st_not_apply?: string;
  metadata?: string | null;
}

export interface StudentPublicGuidelineGroupResponse {
  average_guideline?: number;
  guideline_pr?: {
    id?: number;
    guideline?: string;
  };
  guideline_evaluations: StudentPublicGuidelineEvaluationResponse[];
}

export interface StudentPublicPrincipleEvaluationResponse {
  average_principle?: number;
  evaluation_principle?: {
    id?: number;
    principle?: string;
  };
  principle_gl: StudentPublicGuidelineGroupResponse[];
}

/**
 * Resultado público de evaluación estudiantil mostrado en detalle del OA.
 */
export interface StudentPublicEvaluationResultResponse {
  id?: number;
  rating?: number;
  observation?: string;
  evaluation_students: StudentPublicPrincipleEvaluationResponse[];
}

/**
 * Fila de historial de objetos vistos por estudiante.
 */
export interface ViewedLearningObjectItemResponse {
  learning_object?: ObjectLearning | null;
  rating?: number;
}
