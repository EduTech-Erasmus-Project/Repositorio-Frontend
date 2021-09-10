export interface QuerySearch{
    general_title?: string;
    education_levels__description?: string;
    knowledge_area__name?: string;
    created__year?: string;
    expertRated?:string;
    license__description?:string;
    recommended?:boolean;
    is_evaluated?:string;
    
    accesibility_features?:string[];
    annotation_modeaccess?:string[];
    accesibility_hazard?:string[];
    key_preferences?:string[];
 
}