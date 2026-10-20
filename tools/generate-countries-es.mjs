/**
 * Genera `src/assets/location/countries-es.json` desde `@countrystatecity/countries-browser`.
 *
 * `countries.json` de la libreria no trae traducciones: el nombre en espanol
 * solo esta en `country/{ISO}.json`. Para mostrar la lista de paises en
 * espanol sin descargar 250 archivos en el navegador, este script los resuelve
 * una vez con la misma regla que `normalize_user_location` del backend:
 * `translations.es` del detalle o, si no hay detalle o traduccion, `name`.
 *
 * Se ejecuta antes de `npm start` y `npm run build`. El archivo generado se
 * versiona para que un `ng build` directo tambien lo incluya.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = join(rootDir, "node_modules", "@countrystatecity", "countries-browser");
const dataDir = join(packageDir, "dist", "data");
const outputFile = join(rootDir, "src", "assets", "location", "countries-es.json");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

if (!existsSync(dataDir)) {
  console.error(`[countries-es] No se encontro ${dataDir}. Ejecuta npm install.`);
  process.exit(1);
}

const { version } = readJson(join(packageDir, "package.json"));
const countries = readJson(join(dataDir, "countries.json")).map((country) => {
  const detailPath = join(dataDir, "country", `${country.iso2}.json`);
  const detail = existsSync(detailPath) ? readJson(detailPath) : null;

  return {
    iso2: country.iso2,
    name: country.name,
    name_es: detail?.translations?.es || country.name,
    emoji: country.emoji,
  };
});

const content = `${JSON.stringify({ version, countries }, null, 2)}\n`;
const current = existsSync(outputFile) ? readFileSync(outputFile, "utf8") : "";

if (current === content) {
  console.log(`[countries-es] Sin cambios (libreria ${version}, ${countries.length} paises).`);
} else {
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, content, "utf8");
  console.log(`[countries-es] Generado con la libreria ${version} (${countries.length} paises).`);
}
