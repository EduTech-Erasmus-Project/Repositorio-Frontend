export class Concept{
    id?: number;
    concept?:string;
}
////////////////estudiante/////////////
export class Principle{
    id?: number;
    principle?:string;
}
export class Guideline{
    id?: number;
    guideline?:string;
    principle?:number;
}

export class GuidelineUpdate{
    id?: number;
    guideline?:string;
}
export class QuestionStudent{
    id?:number;
    question:string;
    code:string;
    description:string;
    metadata: string;
    interpreter_st_yes:string;
    interpreter_st_no:string;
    interpreter_st_partially:string;
    value_st_importance:number;
    guideline:number;
    weight: number;
    relevance:string;
}
export class QuestionStudentUpdate{
    id?:number;
    question:string;
    code:string;
    description:string;
    metadata: string;
    interpreter_st_yes:string;
    interpreter_st_no:string;
    interpreter_st_partially:string;
    value_st_importance:number;
    weight: number;
    relevance:string;
}
//////////////////////////////////////
///nuevos datos
export class Question{
    id?:number;
    question:string;
    code:string;
    description:string;
    schema: string;
    interpreter_yes:string;
    interpreter_no:string;
    interpreter_partially:string;
    value_importance:number;
    evaluation_concept:number;
    weight: number;
    relevance:string;
}
export class QuestionUpdate{
    id?:number;
    question:string;
    code:string;
    description:string;
    schema: string;
    interpreter_yes:string;
    interpreter_no:string;
    interpreter_partially:string;
    value_importance:number;
    weight: number;
    relevance:string;
}
//////////////Nuevo modelo metadata
export class Metadata{
    id?:number;
    schema:string;
    code:string;
    description:string;
    value_importance_schema:number;
    evaluation_concept:number;
}
export class MetadataUpdate{
    id?:number;
    schema:string;
    code:string;
    description:string;
    value_importance_schema:number;
}

export class administrator{
    phone:string;
    country:string;
    city:string;

}
export class User{
    id?:number;
    first_name:string;
    last_name:string;
    administrator:administrator;
}
export class ChangePasswordForm{
    password:string;
    password2:string;
    old_password:administrator;
}
export class LearningObjects{
    id?:number;
    general_title?:string;
    // learning_object?:LearningObjectDetail;
}
export class LearningObjectDetail{
}