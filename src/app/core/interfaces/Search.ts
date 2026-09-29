/**
 * Query params compartidos por la búsqueda pública de objetos de aprendizaje.
 *
 * Conserva nombres alineados a los filtros reales del backend para no perder
 * compatibilidad con rutas, chips activos y paginación remota.
 */
export interface QuerySearch{
    general_title?: string;
    education_levels__description?: string;
    education_levels__name_es?: string;
    knowledge_area__name?: string;
    knowledge_area__name_es?: string;
    created__year?: string;
    expertRated?:string;
    license__description?:string;
    license__name_es?: string;
    recommended?:boolean;
    is_evaluated?:string;
    
    accesibility_features?:string[];
    annotation_modeaccess?:string[];
    accesibility_hazard?:string[];
    key_preferences?:string[];
 
    scored?:string;
    liked?:string;
    recent?:string;
}
