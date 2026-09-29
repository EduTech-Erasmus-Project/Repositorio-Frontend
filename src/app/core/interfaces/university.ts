/**
 * Universidad disponible para formularios y configuración institucional.
 */
export interface University {
    id?:        number;
    created?:   Date;
    modified?:  Date;
    name?:      string;
    is_active?: boolean;
    country?:   number;
}
