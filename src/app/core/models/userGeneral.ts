import { EducationLevel } from "../interfaces/EducationLevel";
import { KnowledgeArea } from "../interfaces/KnowledgeArea";
import { Preference } from "../interfaces/Preference";

type RelationReference = number | { id?: number; name?: string } | null;

interface UserStudentSummary {
    birthday?: string;
    has_disability?: boolean | string;
    disability_description?: string | null;
    education_levels?: EducationLevel[];
    knowledge_areas?: KnowledgeArea[];
    preferences?: Preference[];
}

interface UserTeacherSummary {
    is_active?: boolean;
    professions?: Array<number | { id?: number; description?: string; name?: string }>;
}

interface UserCollaboratingExpertSummary {
    is_active?: boolean;
    expert_level?: string;
    web?: string | null;
    academic_profile?: string | null;
}

export class UserGeneral{
    id?:number;
    first_name?:string;
    last_name?:string;
    image?: string;
    email?: string;
    password?: string;
    birthday?: string;
    has_disability?: boolean | string;
    disability_description?: string | null;
    education_levels?: Array<number | EducationLevel>;
    knowledge_areas?: Array<number | KnowledgeArea>;
    preferences?: Array<number | Preference>;
    roles?: string[];
    professions?: Array<number | { id?: number; description?: string; name?: string }>;
    expert_level?: string;
    web?: string | null;
    academic_profile?: string | null;
    student?: UserStudentSummary;
    teacher?: UserTeacherSummary;
    collaboratingExpert?: UserCollaboratingExpertSummary;
    country?: RelationReference;
    province?: RelationReference;
    city?: RelationReference;
    university?: RelationReference;
    campus?: RelationReference;
    
}