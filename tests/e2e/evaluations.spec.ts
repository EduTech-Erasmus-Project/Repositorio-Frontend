import { expect, Page, test } from "@playwright/test";
import {
  getMissingCredentialsMessage,
  hasRoleCredentials,
  loginAs,
} from "./helpers/auth";

const EVALUATION_OA_ID = 1999;
const EVALUATION_OA_SLUG = "e2e-evaluations-oa";
const EVALUATION_IFRAME_URL = "http://localhost:4202/assets/img/noimage.png";

type PersistedAnswers = Record<number, string>;

type StudentState = {
  id: number;
  observation: string;
  answers: PersistedAnswers;
};

type ExpertState = {
  id: number;
  observation: string;
  answers: PersistedAnswers;
};

type EvaluationScenarioState = {
  studentEvaluation: StudentState | null;
  expertEvaluation: ExpertState | null;
  studentCreateCount: number;
  studentUpdateCount: number;
  expertCreateCount: number;
  expertUpdateCount: number;
};

function buildMockLearningObject(slug = EVALUATION_OA_SLUG) {
  return {
    id: EVALUATION_OA_ID,
    slug,
    general_title: "OA E2E Evaluaciones",
    general_description: "Objeto de aprendizaje controlado para flujos de evaluacion.",
    general_keyword: "evaluacion,e2e",
    general_language: "es",
    general_coverage: "Cobertura evaluaciones",
    technical_location: "https://repositorio.edutech-project.org/",
    technical_installationRremarks: "Ninguno",
    educational_description: "Objetivo de evaluacion",
    educational_difficulty: "Media",
    relation_catalog: "Repositorio",
    created: "2026-07-15T00:00:00Z",
    avatar: "assets/img/noimage.png",
    rating: 4.5,
    public: true,
    is_adapted_oer: false,
    source_file: null,
    observation: "",
    knowledge_area: {
      id: 1,
      name: "Tecnologia",
    },
    license: {
      id: 1,
      description: "Creative Commons",
    },
    education_levels: [
      {
        id: 1,
        description: "Universitario",
      },
    ],
    user_created: {
      id: 50,
      first_name: "Autor",
      last_name: "Demo",
      image_url: null,
    },
    learning_object_file: {
      id: 321,
      url: EVALUATION_IFRAME_URL,
      file: EVALUATION_IFRAME_URL,
      oa_oer_adap_url: null,
      oa_preview_adapted: null,
      oa_preview_origin: null,
    },
    preview: {
      base_url: "http://localhost:4202/",
      entrypoint: "assets/img/noimage.png",
    },
  };
}

function createScenarioState(overrides?: Partial<EvaluationScenarioState>): EvaluationScenarioState {
  return {
    studentEvaluation: null,
    expertEvaluation: null,
    studentCreateCount: 0,
    studentUpdateCount: 0,
    expertCreateCount: 0,
    expertUpdateCount: 0,
    ...overrides,
  };
}

function buildStudentQuestionCatalog() {
  return [
    {
      id: 11,
      principle: "Comprension",
      guidelines: [
        {
          id: 21,
          guideline: "Claridad",
          questions: [
            {
              id: 101,
              question: "La informacion es clara",
              description: "Evalua claridad del contenido.",
            },
            {
              id: 102,
              question: "La navegacion es comprensible",
              description: "Evalua orientacion general del OA.",
            },
          ],
        },
      ],
    },
  ];
}

function buildExpertQuestionCatalog() {
  return [
    {
      id: 31,
      concept: "Accesibilidad",
      questions: [
        {
          id: 201,
          question: "Existe contraste suficiente",
          description: "Verifica contraste visual.",
          schema: "accessibilityfeature:highContrastDisplay",
        },
        {
          id: 202,
          question: "El recurso evita barreras de lectura",
          description: "Verifica legibilidad general.",
          schema: "accessibilityhazard:flashing",
        },
      ],
    },
  ];
}

function buildStudentEvaluationResponse(state: StudentState | null) {
  if (!state) {
    return [];
  }

  return [
    {
      id: state.id,
      observation: state.observation,
      evaluation_students: [
        {
          id: 301,
          average_principle: 4.2,
          evaluation_principle: {
            principle: "Comprension",
          },
          principle_gl: [
            {
              guideline_pr: {
                id: 21,
                guideline: "Claridad",
              },
              guideline_evaluations: [
                {
                  question_id: 101,
                  question: "La informacion es clara",
                  qualification: state.answers[101] ?? "Si",
                  interpreter_st_yes: "La informacion se entiende con facilidad.",
                  interpreter_st_no: "La informacion no se entiende con facilidad.",
                  interpreter_st_partially: "La informacion se entiende parcialmente.",
                  interpreter_st_not_apply: "No aplica",
                  metadata: null,
                },
                {
                  question_id: 102,
                  question: "La navegacion es comprensible",
                  qualification: state.answers[102] ?? "Si",
                  interpreter_st_yes: "La navegacion se entiende con facilidad.",
                  interpreter_st_no: "La navegacion no se entiende con facilidad.",
                  interpreter_st_partially: "La navegacion se entiende parcialmente.",
                  interpreter_st_not_apply: "No aplica",
                  metadata: null,
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

function buildExpertEvaluationResponse(state: ExpertState | null) {
  if (!state) {
    return [];
  }

  return [
    {
      id: state.id,
      observation: state.observation,
      concept_evaluations: [
        {
          id: 401,
          average: 4.6,
          evaluation_concept: {
            id: 31,
            concept: "Accesibilidad",
          },
          question_evaluations: [
            {
              id: 501,
              question_id: 201,
              question: "Existe contraste suficiente",
              qualification: state.answers[201] ?? "Si",
              interpreter_yes: "El contraste es correcto.",
              interpreter_partially: "El contraste necesita ajustes.",
              interpreter_no: "El contraste es insuficiente.",
              interpreter_not_apply: "No aplica",
              schema: "accessibilityfeature:highContrastDisplay",
            },
            {
              id: 502,
              question_id: 202,
              question: "El recurso evita barreras de lectura",
              qualification: state.answers[202] ?? "Si",
              interpreter_yes: "No se detectan barreras criticas.",
              interpreter_partially: "Se detectan barreras parciales.",
              interpreter_no: "Se detectan barreras criticas.",
              interpreter_not_apply: "No aplica",
              schema: "accessibilityhazard:flashing",
            },
          ],
        },
      ],
    },
  ];
}

function buildStudentPublicReport(state: StudentState | null) {
  if (!state) {
    return [];
  }

  return [
    {
      id: state.id,
      rating: 4.3,
      observation: state.observation,
      evaluation_students: [
        {
          average_principle: 4.3,
          evaluation_principle: {
            principle: "Comprension",
          },
          principle_gl: [
            {
              average_guideline: 4.3,
              guideline_pr: {
                guideline: "Claridad",
              },
              guideline_evaluations: [
                {
                  question: "La informacion es clara",
                  qualification: state.answers[101] ?? "Si",
                  interpreter_st_yes: "La informacion se entiende con facilidad.",
                  interpreter_st_no: "La informacion no se entiende con facilidad.",
                  interpreter_st_partially: "La informacion se entiende parcialmente.",
                  interpreter_st_not_apply: "No aplica",
                  metadata: null,
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

function buildQualifiedListResponse(hasEvaluation: boolean) {
  return {
    count: hasEvaluation ? 1 : 0,
    next: null,
    previous: null,
    results: hasEvaluation ? [buildMockLearningObject()] : [],
  };
}

async function installEvaluationScenario(page: Page, state: EvaluationScenarioState) {
  const object = buildMockLearningObject();

  await page.route(`**/api/v1/learning-object/${EVALUATION_OA_SLUG}/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(object),
    });
  });

  await page.route(`**/api/v1/learning-objects/comments/${EVALUATION_OA_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(`**/api/v1/learning-objects/liked/${EVALUATION_OA_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  await page.route(`**/api/v1/learning-objects/downloaded/${EVALUATION_OA_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ number: 0 }),
    });
  });

  await page.route(`**/api/v1/learning-objects/viewed/${EVALUATION_OA_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/v1/interaction-ref/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ reference: "e2e-ref" }),
    });
  });

  await page.route("**/api/v1/learning-objects/viewed", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ learning_object: EVALUATION_OA_ID, view: 1 }),
    });
  });

  await page.route("**/api/v1/learning-objects/recommended/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/v1/learning-objects/populars/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/v1/learning-objects-questions/student/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildStudentQuestionCatalog()),
    });
  });

  await page.route("**/api/v1/learning-objects-questions/expert/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildExpertQuestionCatalog()),
    });
  });

  await page.route(`**/api/v1/learning-objects/student/result-to-student/${EVALUATION_OA_ID}/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildStudentEvaluationResponse(state.studentEvaluation)),
    });
  });

  await page.route(`**/api/v1/learning-objects/evaluations-result-to-expert/${EVALUATION_OA_ID}/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildExpertEvaluationResponse(state.expertEvaluation)),
    });
  });

  await page.route(`**/api/v1/learning-objects/evaluations-result-expert/${EVALUATION_OA_ID}*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildExpertEvaluationResponse(state.expertEvaluation)),
    });
  });

  await page.route(`**/api/v1/learning-objects/student/result-to-public-student/${EVALUATION_OA_ID}/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildStudentPublicReport(state.studentEvaluation)),
    });
  });

  await page.route("**/api/v1/learning-objects/student-evaluation/", async (route) => {
    const body = route.request().postDataJSON() as {
      observation?: string;
      results?: Array<{ id: number; value: string }>;
    };

    state.studentEvaluation = {
      id: 9001,
      observation: body.observation ?? "",
      answers: Object.fromEntries((body.results ?? []).map((item) => [item.id, item.value])),
    };
    state.studentCreateCount += 1;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "ok" }),
    });
  });

  await page.route(/\/api\/v1\/learning-objects\/student-evaluation\/\d+\/$/, async (route) => {
    const body = route.request().postDataJSON() as {
      observation?: string;
      results?: Array<{ id: number; value: string }>;
    };

    state.studentEvaluation = {
      id: state.studentEvaluation?.id ?? 9001,
      observation: body.observation ?? "",
      answers: Object.fromEntries((body.results ?? []).map((item) => [item.id, item.value])),
    };
    state.studentUpdateCount += 1;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "ok" }),
    });
  });

  await page.route("**/api/v1/learning-objects/register-evaluation-expert/", async (route) => {
    const body = route.request().postDataJSON() as {
      observation?: string;
      results?: Array<{ id: number; value: string }>;
    };

    state.expertEvaluation = {
      id: 9101,
      observation: body.observation ?? "",
      answers: Object.fromEntries((body.results ?? []).map((item) => [item.id, item.value])),
    };
    state.expertCreateCount += 1;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "ok" }),
    });
  });

  await page.route(/\/api\/v1\/learning-objects\/register-evaluation-expert\/\d+\/$/, async (route) => {
    const body = route.request().postDataJSON() as {
      observation?: string;
      results?: Array<{ id: number; value: string }>;
    };

    state.expertEvaluation = {
      id: state.expertEvaluation?.id ?? 9101,
      observation: body.observation ?? "",
      answers: Object.fromEntries((body.results ?? []).map((item) => [item.id, item.value])),
    };
    state.expertUpdateCount += 1;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "ok" }),
    });
  });

  await page.route("**/api/v1/learning-objects/my-qualification/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildQualifiedListResponse(!!state.studentEvaluation)),
    });
  });

  await page.route(/\/api\/v1\/learning-objects\/search\/expert\/?.*$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildQualifiedListResponse(!!state.expertEvaluation)),
    });
  });
}

async function fillStudentEvaluationForm(page: Page, values: {
  first: string;
  second: string;
  observation: string;
}) {
  await expect(page.locator(".student-questions")).toBeVisible();
  const questions = page.locator(".student-questions__question");
  await questions.nth(0).getByRole("radio", { name: values.first, exact: true }).click();
  await questions.nth(1).getByRole("radio", { name: values.second, exact: true }).click();
  await page.locator(".student-questions textarea[formcontrolname='observation']").fill(values.observation);
}

async function assertStudentEvaluationForm(page: Page, values: {
  first: string;
  second: string;
  observation: string;
}) {
  const questions = page.locator(".student-questions__question");
  await expect(questions.nth(0).getByRole("radio", { name: values.first, exact: true })).toBeChecked();
  await expect(questions.nth(1).getByRole("radio", { name: values.second, exact: true })).toBeChecked();
  await expect(page.locator(".student-questions textarea[formcontrolname='observation']")).toHaveValue(values.observation);
}

async function fillExpertEvaluationForm(page: Page, values: {
  first: string;
  second: string;
  observation: string;
}) {
  await expect(page.locator(".expert-questions")).toBeVisible();
  const questions = page.locator(".expert-questions__question");
  await questions.nth(0).getByRole("radio", { name: values.first, exact: true }).click();
  await questions.nth(1).getByRole("radio", { name: values.second, exact: true }).click();
  await page.locator(".expert-questions textarea[formcontrolname='observation']").fill(values.observation);
}

async function assertExpertEvaluationForm(page: Page, values: {
  first: string;
  second: string;
  observation: string;
}) {
  const questions = page.locator(".expert-questions__question");
  await expect(questions.nth(0).getByRole("radio", { name: values.first, exact: true })).toBeChecked();
  await expect(questions.nth(1).getByRole("radio", { name: values.second, exact: true })).toBeChecked();
  await expect(page.locator(".expert-questions textarea[formcontrolname='observation']")).toHaveValue(values.observation);
}

test.describe("ROA evaluation flows", () => {
  test("student can create evaluation and the state is reflected in detail, report and qualified list", async ({
    page,
  }) => {
    test.skip(!hasRoleCredentials("student"), getMissingCredentialsMessage("student"));

    const state = createScenarioState();
    await installEvaluationScenario(page, state);
    await loginAs(page, "student");

    await page.goto(`/#/object/${EVALUATION_OA_SLUG}`);
    await expect(page.locator("#web-view-student-create-trigger")).toBeVisible();

    await page.locator("#web-view-student-create-trigger").click();
    await fillStudentEvaluationForm(page, {
      first: "Si",
      second: "Parcialmente",
      observation: "Observacion estudiante inicial",
    });
    await page.locator(".student-questions__actions button[type='submit']").click();

    await expect.poll(() => state.studentCreateCount).toBe(1);
    await expect(page.locator("#web-view-student-update-trigger")).toBeVisible();

    await page.locator("#web-view-student-update-trigger").click();
    await assertStudentEvaluationForm(page, {
      first: "Si",
      second: "Parcialmente",
      observation: "Observacion estudiante inicial",
    });
    await page.locator(".student-questions__actions button[type='button']").click();

    await page.goto("/#/settings/objects-qualified");
    await expect(page.locator("app-my-qualified-oa .card-title-link").first()).toBeVisible();

    await page.goto(`/#/report/${EVALUATION_OA_SLUG}?rstudent=true`);
    await expect(page.locator(".reports-page")).toBeVisible();
    await expect(page.locator(".reports-observation__value")).toContainText("Observacion estudiante inicial");
  });

  test("student can cancel edit without losing persisted data and then update it", async ({
    page,
  }) => {
    test.skip(!hasRoleCredentials("student"), getMissingCredentialsMessage("student"));

    const state = createScenarioState({
      studentEvaluation: {
        id: 9001,
        observation: "Observacion estudiante guardada",
        answers: {
          101: "No",
          102: "Si",
        },
      },
    });
    await installEvaluationScenario(page, state);
    await loginAs(page, "student");

    await page.goto(`/#/object/${EVALUATION_OA_SLUG}`);
    await expect(page.locator("#web-view-student-update-trigger")).toBeVisible();

    await page.locator("#web-view-student-update-trigger").click();
    await assertStudentEvaluationForm(page, {
      first: "No",
      second: "Si",
      observation: "Observacion estudiante guardada",
    });

    await fillStudentEvaluationForm(page, {
      first: "Si",
      second: "No aplica",
      observation: "Cambio temporal no guardado",
    });
    await page.locator(".student-questions__actions button[type='button']").click();

    await page.locator("#web-view-student-update-trigger").click();
    await assertStudentEvaluationForm(page, {
      first: "No",
      second: "Si",
      observation: "Observacion estudiante guardada",
    });

    await fillStudentEvaluationForm(page, {
      first: "Parcialmente",
      second: "No",
      observation: "Observacion estudiante actualizada",
    });
    await page.locator(".student-questions__actions button[type='submit']").click();

    await expect.poll(() => state.studentUpdateCount).toBe(1);
    await page.locator("#web-view-student-update-trigger").click();
    await assertStudentEvaluationForm(page, {
      first: "Parcialmente",
      second: "No",
      observation: "Observacion estudiante actualizada",
    });
  });

  test("expert can create evaluation and the state is reflected in detail, report and qualified list", async ({
    page,
  }) => {
    test.skip(!hasRoleCredentials("expert"), getMissingCredentialsMessage("expert"));

    const state = createScenarioState();
    await installEvaluationScenario(page, state);
    await loginAs(page, "expert");

    await page.goto(`/#/object/${EVALUATION_OA_SLUG}`);
    await expect(page.locator("#web-view-expert-create-trigger")).toBeVisible();

    await page.locator("#web-view-expert-create-trigger").click();
    await fillExpertEvaluationForm(page, {
      first: "Si",
      second: "Parcialmente",
      observation: "Observacion experta inicial",
    });
    await page.locator(".expert-questions__actions button[type='submit']").click();

    await expect.poll(() => state.expertCreateCount).toBe(1);
    await expect(page.locator("#web-view-expert-update-trigger")).toBeVisible();

    await page.locator("#web-view-expert-update-trigger").click();
    await assertExpertEvaluationForm(page, {
      first: "Si",
      second: "Parcialmente",
      observation: "Observacion experta inicial",
    });
    await page.locator(".expert-questions__actions button[type='button']").click();

    await page.goto("/#/settings/objects-qualified");
    await expect(page.locator("app-my-qualified-oa .card-title-link").first()).toBeVisible();

    await page.goto(`/#/report/${EVALUATION_OA_SLUG}`);
    await expect(page.locator(".reports-page")).toBeVisible();
    await expect(page.locator(".reports-observation__value")).toContainText("Observacion experta inicial");
  });

  test("expert can cancel edit without losing persisted data and then update it", async ({
    page,
  }) => {
    test.skip(!hasRoleCredentials("expert"), getMissingCredentialsMessage("expert"));

    const state = createScenarioState({
      expertEvaluation: {
        id: 9101,
        observation: "Observacion experta guardada",
        answers: {
          201: "No",
          202: "Si",
        },
      },
    });
    await installEvaluationScenario(page, state);
    await loginAs(page, "expert");

    await page.goto(`/#/object/${EVALUATION_OA_SLUG}`);
    await expect(page.locator("#web-view-expert-update-trigger")).toBeVisible();

    await page.locator("#web-view-expert-update-trigger").click();
    await assertExpertEvaluationForm(page, {
      first: "No",
      second: "Si",
      observation: "Observacion experta guardada",
    });

    await fillExpertEvaluationForm(page, {
      first: "Si",
      second: "No aplica",
      observation: "Cambio experto temporal",
    });
    await page.locator(".expert-questions__actions button[type='button']").click();

    await page.locator("#web-view-expert-update-trigger").click();
    await assertExpertEvaluationForm(page, {
      first: "No",
      second: "Si",
      observation: "Observacion experta guardada",
    });

    await fillExpertEvaluationForm(page, {
      first: "Parcialmente",
      second: "No",
      observation: "Observacion experta actualizada",
    });
    await page.locator(".expert-questions__actions button[type='submit']").click();

    await expect.poll(() => state.expertUpdateCount).toBe(1);
    await page.locator("#web-view-expert-update-trigger").click();
    await assertExpertEvaluationForm(page, {
      first: "Parcialmente",
      second: "No",
      observation: "Observacion experta actualizada",
    });
  });
});
