import {
  DELETE_MESSAGE_TEMPLATE,
  FINDINGS_MESSAGE_TEMPLATE,
  LEARNING_OBJECT_FINDINGS,
  LEARNING_OBJECT_MESSAGE_MAX_LENGTH,
  composeLearningObjectMessage,
} from "./learning-object-message-templates";

describe("learning-object-message-templates", () => {
  it("debe armar el mensaje de aprobado con observaciones en el orden del catalogo", () => {
    const message = composeLearningObjectMessage(FINDINGS_MESSAGE_TEMPLATE, "approved", [
      "accessibility",
      "navigation",
    ]);

    expect(message.startsWith("¡Felicidades! Su OA ha sido aprobado")).toBeTrue();
    expect(message).toContain(
      "Se sugiere implementar:\n1. Activar la navegación entre las páginas del OA"
    );
    expect(message).toContain("\n2. Implementar elementos de accesibilidad");
    expect(message.indexOf("navegación")).toBeLessThan(message.indexOf("accesibilidad"));
    expect(message.endsWith("orientación en la actualización de su recurso.")).toBeTrue();
  });

  it("debe incluir la sublista de la estructura instruccional", () => {
    const message = composeLearningObjectMessage(FINDINGS_MESSAGE_TEMPLATE, "not-approved", [
      "instructional-structure",
    ]);

    expect(message).toContain("Para que pueda ser aprobado, se sugiere implementar:");
    expect(message).toContain(
      "1. Cumplir con la estructura instruccional:\n     a) Introducción.\n     b) Contenido"
    );
    expect(message).toContain("     d) Autoevaluación.");
  });

  it("debe omitir la frase de la lista si no hay observaciones al eliminar", () => {
    const message = composeLearningObjectMessage(DELETE_MESSAGE_TEMPLATE, "deleted", []);

    expect(message).not.toContain("le sugerimos revisar");
    expect(message.split("\n\n").length).toBe(2);
    expect(message.endsWith("orientación para futuras publicaciones.")).toBeTrue();
  });

  it("debe usar la primera situacion si el id no existe", () => {
    expect(composeLearningObjectMessage(FINDINGS_MESSAGE_TEMPLATE, "otro", [])).toBe(
      composeLearningObjectMessage(FINDINGS_MESSAGE_TEMPLATE, "approved", [])
    );
  });

  it("debe caber en el limite del backend aun con todas las observaciones", () => {
    const allIds = LEARNING_OBJECT_FINDINGS.map((finding) => finding.id);

    for (const template of [FINDINGS_MESSAGE_TEMPLATE, DELETE_MESSAGE_TEMPLATE]) {
      for (const outcome of template.outcomes) {
        expect(composeLearningObjectMessage(template, outcome.id, allIds).length).toBeLessThanOrEqual(
          LEARNING_OBJECT_MESSAGE_MAX_LENGTH
        );
      }
    }
  });
});
