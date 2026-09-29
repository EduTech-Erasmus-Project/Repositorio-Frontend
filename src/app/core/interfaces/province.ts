/**
 * Provincia asociada a un país.
 */
export interface Province {
    id?:        number;
    created?:   Date;
    modified?:  Date;
    name?:      string;
    is_active?: boolean;
    country?:   number;
}
