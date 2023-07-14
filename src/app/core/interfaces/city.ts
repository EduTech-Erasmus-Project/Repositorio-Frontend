import { Province } from "./province";

export interface City {
    id?:        number;
    province?:  Province;
    created?:   Date;
    modified?:  Date;
    name?:      string;
    is_active?: boolean;
}
