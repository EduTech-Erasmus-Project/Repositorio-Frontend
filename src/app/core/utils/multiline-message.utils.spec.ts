import { normalizeMultilineMessage } from "./multiline-message.utils";

describe("normalizeMultilineMessage", () => {
  it("debe conservar saltos de linea, espacios y tabulaciones del mensaje", () => {
    const message = "HOLA MUNDO,\r\n\r\n\tQuiero presentar algo.\r\n\r\nAdios";

    expect(normalizeMultilineMessage(message)).toBe(
      "HOLA MUNDO,\n\n\tQuiero presentar algo.\n\nAdios"
    );
  });

  it("no debe recortar espacios escritos por el usuario", () => {
    expect(normalizeMultilineMessage("  texto  ")).toBe("  texto  ");
  });

  it("debe convertir valores nulos en cadena vacia", () => {
    expect(normalizeMultilineMessage(null)).toBe("");
    expect(normalizeMultilineMessage(undefined)).toBe("");
  });
});

