import { License } from './License';
import { LearningObjectFile } from './LearningObjectFile';
import { EducationLevel } from './EducationLevel';
import { KnowledgeArea } from './KnowledgeArea';
import { Preference } from './Preference';
import { UserCreated } from './UserCreated';

/**
 * Nodo del árbol de navegación que arma el menú lateral del OA.
 */
export interface LearningObjectPreviewItem {
    title: string;
    resource_path: string;
    children: LearningObjectPreviewItem[];
}

/**
 * Preview técnico resuelto desde backend para incrustar y navegar el OA.
 */
export interface LearningObjectPreview {
    mode: 'scorm' | 'html' | string;
    base_url: string;
    entrypoint: string;
    toc: LearningObjectPreviewItem[];
}

/**
 * Contrato principal de un objeto de aprendizaje.
 *
 * Mantiene nombres heredados del backend y del perfil LOM usado por el
 * sistema. Por eso conviven claves modernas con otras históricas o con typos
 * legacy que hoy siguen siendo parte del contrato consumido por la UI.
 */
export interface ObjectLearning {
    source_file: LearningObjectFile | string | null;
    id?: number;
    license?: License | null;
    learning_object_file?: LearningObjectFile;
    education_levels?: EducationLevel[];
    knowledge_area?: KnowledgeArea | null;
    preferences?: Preference[];
    user_created?: UserCreated | null;
    created?: string | Date | null;
    modified?: string | Date | null;
    adaptation?: string;
    is_adapted_oer:boolean;
    avatar?: string | null;
    general_catalog?: string;
    general_entry?: string;
    general_title?: string;
    general_language?: string;
    general_description?: string;
    general_keyword?: string;
    general_coverage?: string;
    general_structure?: string;
    general_aggregation_Level?: string;
    life_cycle_version?: string;
    life_cycle_status?: string;
    life_cycle_role?: string;
    life_cycle_entity?: string;
    life_cycle_dateTime?: Date | string | null;
    life_cycle_description?: string;
    meta_metadata_catalog?: string;
    meta_metadata_entry?: string;
    meta_metadata_role?: string;
    meta_metadata_entity?: string;
    meta_metadata_dateTime?: Date | string | null;
    meta_metadata_description?: string;
    technical_format?: string;
    technical_size?: string;
    technical_location?: string;
    technical_requirement_type?: string;
    technical_requirement_name?: string;
    technical_requirement_minimumVersion?: string;
    technical_installationRremarks?: string;
    technical_otherPlatformRequirements?: string;
    technical_dateTime?: string;
    technical_description?: string;
    educational_interactivityType?: string;
    educational_learningResourceType?: string;
    educational_interactivityLevel?: string;
    educational_semanticDensity?: string;
    educational_intendedEndUserRole?: string;
    educational_context?: string;
    educational_typicalAgeRange?: string;
    educational_difficulty?: string;
    educational_typicalLearningTime_dateTime?: string;
    educational_typicalLearningTime_description?: string;
    educational_description?: string;
    educational_language?: string;
    educational_procces_cognitve?: string;
    rights_cost?: string;
    rights_copyrightAndOtherRestrictions?: string;
    rights_description?: string;
    relation_kind?: string;
    relation_catalog?: string;
    relation_entry?: string;
    relation_description?: string;
    annotation_entity?: string;
    annotation_date_dateTime?: Date | string | null;
    annotation_date_description?: string;
    annotation_description?: string;
    annotation_modeaccess?: string;
    annotation_modeaccesssufficient?: string;
    annotation_rol?: string;
    classification_purpose?: string;
    classification_taxonPath_source?: string;
    classification_taxonPath_taxon?: string;
    classification_description?: string;
    classification_keyword?: string;
    accesibility_summary?: string;
    accesibility_features?: string;
    accesibility_hazard?: string;
    accesibility_control?: string;
    accesibility_api?: string;
    slug?: string;
    public?: boolean;
    rating?: number;
    observation?:string;
    preview?: LearningObjectPreview;
}

