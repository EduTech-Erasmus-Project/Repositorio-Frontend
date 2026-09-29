/**
 * Dominio de correo permitido por backend para un tipo de registro.
 */
 export interface EmailExtension{
    domain? : string;
    type? : string;
    is_active? : boolean;
 }