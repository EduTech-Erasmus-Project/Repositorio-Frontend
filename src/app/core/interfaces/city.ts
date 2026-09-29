import { Province } from "./province";

/**
 * Ciudad asociada a una provincia.
 */
export interface City {
    id?:        number;
    province?:  Province;
    created?:   Date;
    modified?:  Date;
    name?:      string;
    is_active?: boolean;
}
