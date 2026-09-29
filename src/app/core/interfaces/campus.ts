/**
 * Sede universitaria usada por formularios y catálogos institucionales.
 */
export interface Campus {
    id?:         number;
    created?:    Date;
    modified?:   Date;
    name?:       string;
    address?:    string;
    is_active?:  boolean;
    university?: number;
}
