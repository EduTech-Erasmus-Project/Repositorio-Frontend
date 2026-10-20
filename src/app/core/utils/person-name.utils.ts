/**
 * Nombres y apellidos en cualquier idioma (tildes, eñe, diéresis, etc.), con
 * espacios, apóstrofos y guiones: "Lucía", "O'Brien", "Jean-Pierre".
 */
export const PERSON_NAME_PATTERN = /^[\p{L}\p{M}' -]+$/u;

/** Largo maximo de nombres y apellidos en el registro y el perfil. */
export const PERSON_NAME_MAX_LENGTH = 50;
