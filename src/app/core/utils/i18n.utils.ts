type InstantTranslator = {
  instant(key: string): string;
};

/**
 * Devuelve una traduccion inmediata y aplica un fallback cuando la clave
 * todavia no existe o el traductor responde la misma clave.
 */
export function translateInstant(
  translator: InstantTranslator,
  key: string,
  fallback: string
): string {
  const translated = translator.instant(key);
  return translated && translated !== key ? translated : fallback;
}
