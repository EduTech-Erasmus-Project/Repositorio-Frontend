import { getLocationErrorMessage } from "./location-errors.utils";

describe("getLocationErrorMessage", () => {
  const translator = {
    instant: (key: string) => ({ "location.city": "Ciudad", "location.country": "País" })[key] ?? key,
  };

  it("junta los errores de ubicacion con el nombre de cada campo", () => {
    expect(
      getLocationErrorMessage(translator, {
        country_code: ["Debe ser un codigo de pais ISO de 2 letras."],
        city_name: ["Este campo es obligatorio."],
      })
    ).toBe("País: Debe ser un codigo de pais ISO de 2 letras. Ciudad: Este campo es obligatorio.");
  });

  it("devuelve vacio si no hay errores de ubicacion", () => {
    expect(getLocationErrorMessage(translator, null)).toBe("");
    expect(getLocationErrorMessage(translator, { email: ["x"] } as any)).toBe("");
  });

  it("usa el nombre del campo si falta la traduccion", () => {
    expect(getLocationErrorMessage(translator, { university_name: ["Muy largo."] })).toBe(
      "university_name: Muy largo."
    );
  });
});
