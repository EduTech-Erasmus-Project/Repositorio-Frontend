/**
 * Plantillas de los mensajes que administracion envia al docente al notificar
 * hallazgos o al eliminar un OA.
 *
 * El correo ya pone el saludo con el nombre del docente, el titulo del OA y
 * la firma; aqui va solo el cuerpo. Los textos salen de los correos que el
 * equipo ROA enviaba a mano.
 */

/** Limite del backend para el mensaje (`max_length=3000`). */
export const LEARNING_OBJECT_MESSAGE_MAX_LENGTH = 3000;

/** Observacion que el admin marca con una casilla. */
export interface LearningObjectFinding {
  id: string;
  /** Texto corto junto a la casilla. */
  label: string;
  /** Texto que entra al mensaje. */
  text: string;
  /** Sublista, como las partes de la estructura instruccional. */
  items?: string[];
}

/** Situacion del mensaje: define la frase inicial y la final. */
export interface LearningObjectMessageOutcome {
  id: string;
  label: string;
  intro: string;
  /** Frase antes de la lista; solo se agrega si hay observaciones marcadas. */
  listIntro?: string;
  closing: string;
}

export interface LearningObjectMessageTemplate {
  outcomes: LearningObjectMessageOutcome[];
  findings: LearningObjectFinding[];
}

export const LEARNING_OBJECT_FINDINGS: LearningObjectFinding[] = [
  {
    id: "instructional-structure",
    label: "Estructura instruccional",
    text: "Cumplir con la estructura instruccional:",
    items: [
      "Introducción.",
      "Contenido (es recomendable que dentro de esta sección se desarrolle el contenido de la unidad planteada, haciendo uso de elementos multimedia y herramientas accesibles).",
      "Actividades.",
      "Autoevaluación.",
    ],
  },
  {
    id: "multimedia",
    label: "Recursos multimedia",
    text: "Incluir recursos multimedia como imágenes, audios, videos, animaciones, recursos interactivos, etc.",
  },
  {
    id: "text-only",
    label: "Información solo textual",
    text: "La información es únicamente textual. Incluir diferentes maneras de presentarla: infografías, videos relacionados, etc.",
  },
  {
    id: "navigation",
    label: "Navegación entre páginas",
    text: "Activar la navegación entre las páginas del OA para facilitar el acceso al contenido (botones \"Siguiente\" y \"Atrás\").",
  },
  {
    id: "accessibility",
    label: "Accesibilidad",
    text: "Implementar elementos de accesibilidad para el contenido.",
  },
  {
    id: "placeholder-text",
    label: "Textos de la plantilla sin reemplazar",
    text: "Corregir textos sin referencia y títulos (existen secciones con la palabra \"Text\", que debe ser reemplazada por texto relacionado con la sección).",
  },
  {
    id: "empty-sections",
    label: "Secciones sin contenido",
    text: "Existen secciones sin contenido. Sintetizar el texto en un resumen de lo tratado u organizar mejor la información.",
  },
  {
    id: "dua",
    label: "Contenido DUA",
    text: "El contenido DUA debe presentar la información principal desde el comienzo; las opciones de lectura facilitada, audio y video deben estar relacionadas con la información principal.",
  },
  {
    id: "interactive-assessment",
    label: "Evaluación interactiva",
    text: "Implementar actividades de evaluación interactivas.",
  },
  {
    id: "links",
    label: "Enlaces de archivos adjuntos",
    text: "Comprobar que los enlaces de los archivos adjuntos funcionen adecuadamente.",
  },
  {
    id: "duplicate",
    label: "OA duplicado",
    text: "El objeto de aprendizaje está cargado más de una vez (en esta u otra cuenta). Eliminar las versiones antiguas y conservar solo una.",
  },
];

const QUALITY_REVIEW =
  "Tras una revisión detallada por parte del equipo de calidad, se determinó que";

const NOT_COMPLIANT =
  `${QUALITY_REVIEW} el recurso no cumple con los parámetros técnicos obligatorios ni con los estándares de diseño instruccional establecidos para nuestra plataforma.`;

export const FINDINGS_MESSAGE_TEMPLATE: LearningObjectMessageTemplate = {
  outcomes: [
    {
      id: "approved",
      label: "Aprobado, puede mejorar",
      intro: `¡Felicidades! Su OA ha sido aprobado y cumple con los parámetros técnicos obligatorios. ${QUALITY_REVIEW} el recurso puede ser mejorado.`,
      listIntro: "Se sugiere implementar:",
      closing: "Quedamos a su disposición para brindarle orientación en la actualización de su recurso.",
    },
    {
      id: "not-approved",
      label: "No aprobado, debe mejorar",
      intro: NOT_COMPLIANT,
      listIntro: "Para que pueda ser aprobado, se sugiere implementar:",
      closing: "Quedamos a su disposición para brindarle orientación en la actualización de su recurso.",
    },
  ],
  findings: LEARNING_OBJECT_FINDINGS,
};

export const DELETE_MESSAGE_TEMPLATE: LearningObjectMessageTemplate = {
  outcomes: [
    {
      id: "deleted",
      label: "Eliminado",
      intro: NOT_COMPLIANT,
      listIntro: "Para que el material pueda ser publicado nuevamente, le sugerimos revisar los siguientes puntos:",
      closing: "Quedamos a su disposición para brindarle orientación para futuras publicaciones.",
    },
  ],
  findings: LEARNING_OBJECT_FINDINGS,
};

/**
 * Arma el mensaje: frase inicial, observaciones marcadas en el orden del
 * catalogo (no en el del clic) y frase final.
 *
 * Las observaciones van numeradas (1., 2.) y su sublista con letras (a), b)),
 * para que en el correo no se confundan los dos niveles.
 */
export function composeLearningObjectMessage(
  template: LearningObjectMessageTemplate,
  outcomeId: string,
  findingIds: readonly string[]
): string {
  const outcome =
    template.outcomes.find((item) => item.id === outcomeId) ?? template.outcomes[0];
  const findings = template.findings.filter((finding) => findingIds.includes(finding.id));

  const paragraphs = [outcome.intro];
  if (findings.length) {
    const list = findings
      .map((finding, index) =>
        [
          `${index + 1}. ${finding.text}`,
          ...(finding.items ?? []).map(
            (item, itemIndex) => `     ${String.fromCharCode(97 + itemIndex)}) ${item}`
          ),
        ].join("\n")
      )
      .join("\n");
    paragraphs.push(outcome.listIntro ? `${outcome.listIntro}\n${list}` : list);
  }
  paragraphs.push(outcome.closing);

  return paragraphs.join("\n\n");
}
