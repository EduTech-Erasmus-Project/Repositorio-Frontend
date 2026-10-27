import { locationEntryNames, normalizeLocationName } from "./location-name.utils";

describe("normalizeLocationName", () => {
  it("quita tildes, mayusculas y espacios repetidos", () => {
    expect(normalizeLocationName("  Sangolquí ")).toBe("sangolqui");
    expect(normalizeLocationName("Santo  Domingo de los Tsáchilas")).toBe(
      "santo domingo de los tsachilas"
    );
    expect(normalizeLocationName("ESPAÑA")).toBe("espana");
  });

  it("devuelve cadena vacia para valores nulos", () => {
    expect(normalizeLocationName(null)).toBe("");
    expect(normalizeLocationName(undefined)).toBe("");
  });
});

describe("locationEntryNames", () => {
  it("incluye nombre, nombre nativo y traducciones sin vacios", () => {
    const names = locationEntryNames({
      name: "Germany",
      native: "Deutschland",
      translations: { es: "Alemania", fr: "Allemagne" },
    });

    expect([...names].sort()).toEqual(["alemania", "allemagne", "deutschland", "germany"]);
  });

  it("tolera campos ausentes", () => {
    expect([...locationEntryNames({ name: "Quito", native: null })]).toEqual(["quito"]);
  });
});
