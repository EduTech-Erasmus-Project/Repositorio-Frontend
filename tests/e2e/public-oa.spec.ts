import { expect, Page, test } from "@playwright/test";
import {
  getMissingCredentialsMessage,
  hasRoleCredentials,
  loginAs,
} from "./helpers/auth";

const MOCK_OA_ID = 999;
const MOCK_OA_SLUG = "e2e-public-oa";
const MOCK_IFRAME_URL = "http://localhost:4202/assets/img/noimage.png";

function buildMockLearningObject(slug = MOCK_OA_SLUG) {
  return {
    id: MOCK_OA_ID,
    slug,
    general_title: "OA E2E Publico",
    general_description: "Objeto de aprendizaje de prueba para Playwright.",
    general_keyword: "e2e,playwright,oa",
    general_language: "es",
    general_coverage: "Cobertura E2E",
    technical_location: "https://repositorio.edutech-project.org/",
    technical_installationRremarks: "Ninguno",
    educational_description: "Objetivo de prueba",
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
      url: MOCK_IFRAME_URL,
      file: MOCK_IFRAME_URL,
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

async function waitForCardsOrState(page: Page, rootSelector: string) {
  const root = page.locator(rootSelector).first();
  await expect(root).toBeVisible();

  const cards = root.locator(".card-title-link");
  const emptyState = root.locator(".empty-state, .recommended-state, .search-no-results, .search-empty-column");
  const errorState = root.locator(".state-card--error");

  if ((await cards.count()) > 0) {
    await expect(cards.first()).toBeVisible();
    return "cards";
  }

  if ((await emptyState.count()) > 0) {
    await expect(emptyState.first()).toBeVisible();
    return "empty";
  }

  if ((await errorState.count()) > 0) {
    await expect(errorState.first()).toBeVisible();
    return "error";
  }

  return "unknown";
}

async function installWindowOpenSpy(page: Page) {
  await page.addInitScript(() => {
    const openCalls: Array<[string | undefined, string | undefined, string | undefined]> = [];
    Object.defineProperty(window, "__openCalls", {
      value: openCalls,
      configurable: true,
      writable: false,
    });

    window.open = ((url?: string | URL, target?: string, features?: string) => {
      openCalls.push([
        typeof url === "string" ? url : url?.toString(),
        target,
        features,
      ]);
      return null;
    }) as typeof window.open;
  });
}

async function mockObjectDetailScenario(page: Page, options?: {
  slug?: string;
  comments?: Array<Record<string, unknown>>;
  studentSummary?: Array<Record<string, unknown>>;
  studentReport?: Array<Record<string, unknown>>;
  expertReport?: Array<Record<string, unknown>>;
  liked?: boolean;
  likeResponse?: Record<string, unknown>;
}) {
  const tracker = {
    likeCreates: 0,
    commentCreates: 0,
    downloadCreates: 0,
  };
  const slug = options?.slug ?? MOCK_OA_SLUG;
  const object = buildMockLearningObject(slug);
  const comments = options?.comments ?? [
    {
      description: "Comentario inicial",
      created: "2026-07-15T10:00:00Z",
      user: {
        first_name: "Usuario",
        last_name: "Inicial",
        image_url: null,
      },
    },
  ];

  const studentReport = options?.studentReport ?? [
    {
      rating: 4.4,
      observation: "Buen recurso para adaptar contenidos.",
      evaluation_students: [
        {
          average_principle: 4.4,
          evaluation_principle: { principle: "Comprension" },
          principle_gl: [
            {
              average_guideline: 4.4,
              guideline_pr: { guideline: "Claridad" },
              guideline_evaluations: [
                {
                  question: "La informacion es clara",
                  qualification: "Si",
                  interpreter_st_yes: "La informacion se entiende con facilidad.",
                  interpreter_st_no: "",
                  interpreter_st_partially: "",
                  interpreter_st_not_apply: "",
                  metadata: null,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const expertReport = options?.expertReport ?? [
    {
      id: 1,
      observation: "El OA cumple con criterios clave.",
      concept_evaluations: [
        {
          average: 4.7,
          evaluation_concept: { concept: "Accesibilidad" },
          question_evaluations: [
            {
              id: 11,
              question: "Tiene contraste adecuado",
              qualification: "Si",
              interpreter_yes: "El contraste es correcto.",
              interpreter_partially: "",
              interpreter_no: "",
              interpreter_not_apply: "",
              schema: "accessibilityfeature:highContrastDisplay",
            },
          ],
        },
      ],
    },
  ];

  await page.route(`**/api/v1/learning-object/${slug}/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(object),
    });
  });

  await page.route(`**/api/v1/learning-objects/comments/${MOCK_OA_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(comments),
    });
  });

  await page.route(`**/api/v1/learning-objects/evaluations-result-expert/${MOCK_OA_ID}*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(expertReport),
    });
  });

  await page.route(`**/api/v1/learning-objects/student/result-to-student/${MOCK_OA_ID}/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(`**/api/v1/learning-objects/evaluations-result-to-expert/${MOCK_OA_ID}/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(expertReport),
    });
  });

  await page.route(`**/api/v1/learning-objects/student/result-to-public-student/${MOCK_OA_ID}/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(studentReport),
    });
  });

  await page.route(`**/api/v1/learning-objects/liked/${MOCK_OA_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        options?.likeResponse ?? {
          liked: options?.liked ?? false,
          learning_object: MOCK_OA_ID,
        }
      ),
    });
  });

  await page.route(`**/api/v1/learning-objects/downloaded/${MOCK_OA_ID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        number: 0,
      }),
    });
  });

  await page.route(`**/api/v1/learning-objects/viewed/${MOCK_OA_ID}`, async (route) => {
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
      body: JSON.stringify({
        reference: "e2e-ref",
      }),
    });
  });

  await page.route("**/api/v1/learning-objects/viewed", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        learning_object: MOCK_OA_ID,
        view: 1,
      }),
    });
  });

  await page.route(/\/api\/v1\/object-learning\/interaction\/?.*$/, async (route) => {
    if (route.request().method() === "POST") {
      tracker.likeCreates += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 77,
          liked: true,
          learning_object: MOCK_OA_ID,
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.route("**/api/v1/learning-object/create/commentary/", async (route) => {
    tracker.commentCreates += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        created: "2026-07-15T12:00:00Z",
      }),
    });
  });

  await page.route("**/api/v1/learning-objects/downloaded", async (route) => {
    if (route.request().method() === "POST") {
      tracker.downloadCreates += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 88,
            downloaded: 1,
            learning_object: MOCK_OA_ID,
          },
        ]),
      });
      return;
    }

    await route.continue();
  });

  return tracker;
}

test.describe("ROA public / OA flows", () => {
  test("student can open a detail card from recommended route when cards exist", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("student"),
      getMissingCredentialsMessage("student")
    );

    await loginAs(page, "student");
    await page.goto("/#/recommended");

    const state = await waitForCardsOrState(page, ".recommended-page");
    if (state !== "cards") {
      return;
    }

    await page.locator(".recommended-page .card-title-link").first().click();
    await expect(page).toHaveURL(/\/#\/object\//);
    await expect(page.locator(".object-page")).toBeVisible();
  });

  test("teacher can open a detail card from my objects route when cards exist", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("teacher"),
      getMissingCredentialsMessage("teacher")
    );

    await loginAs(page, "teacher");
    await page.goto("/#/settings/my-objects");

    const state = await waitForCardsOrState(page, "app-my-objects > .content, .content");
    if (state !== "cards") {
      return;
    }

    await page.locator(".my-objects-grid .card-title-link").first().click();
    await expect(page).toHaveURL(/\/#\/object\//);
    await expect(page.locator(".object-page")).toBeVisible();
  });

  test("student can open a detail card from qualified objects route when cards exist", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("student"),
      getMissingCredentialsMessage("student")
    );

    await loginAs(page, "student");
    await page.goto("/#/settings/objects-qualified");

    const state = await waitForCardsOrState(page, "app-my-qualified-oa > .content, .content");
    if (state !== "cards") {
      return;
    }

    await page.locator("app-my-qualified-oa .card-title-link, .content .card-title-link").first().click();
    await expect(page).toHaveURL(/\/#\/object\//);
    await expect(page.locator(".object-page")).toBeVisible();
  });

  test("student can interact with comment, like, download and tabs on a mocked OA detail", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("student"),
      getMissingCredentialsMessage("student")
    );

    await installWindowOpenSpy(page);
    const tracker = await mockObjectDetailScenario(page, {
      likeResponse: {},
    });
    await loginAs(page, "student");

    await page.goto(`/#/object/${MOCK_OA_SLUG}`);
    await expect(page.locator(".object-page")).toBeVisible();
    await expect(page.locator("app-web-view")).toBeVisible();
    await expect(page.locator(".web-view__title")).toContainText("OA E2E Publico");

    const tabs = page.locator(".object-page__tabs-shell [role='tab']");
    await expect(tabs).toHaveCount(4);

    const likeButton = page.locator(".web-view__actions-secondary button").first();
    await likeButton.click();
    await expect.poll(() => tracker.likeCreates).toBe(1);

    const downloadButton = page.locator(".web-view__actions-secondary button").nth(1);
    await downloadButton.click();
    await expect.poll(() => tracker.downloadCreates).toBe(1);
    await expect
      .poll(async () => {
        return page.evaluate(() => (window as unknown as { __openCalls?: unknown[] }).__openCalls?.length ?? 0);
      })
      .toBe(1);

    await tabs.nth(0).click();
    await page.locator(".comments-toolbar button").click();
    await page.locator("textarea#description").fill("Comentario E2E controlado");
    await page.locator(".comment-form-actions button").first().click();
    await expect.poll(() => tracker.commentCreates).toBe(1);
    await expect(page.locator(".comment-item").first()).toContainText("Comentario E2E controlado");

    await tabs.nth(1).click();
    await expect(page.locator(".metadata-toggle")).toBeVisible();
    await page.locator(".metadata-toggle").click();
    await expect(page.locator("pre.pretty")).toBeVisible();

    await tabs.nth(2).click();
    await expect(page.locator("textarea.code")).toBeVisible();
    await expect(page.locator("textarea.code")).toHaveValue(/<iframe/);

    await tabs.nth(3).click();
    await expect(page.locator(".student-evaluation-grid")).toBeVisible();
  });

  test("preview-learning-object route renders the iframe stage for a mocked OA", async ({
    page,
  }) => {
    await mockObjectDetailScenario(page);

    await page.goto(`/#/preview-learning-object/${MOCK_OA_SLUG}`);
    await expect(page.locator(".container-information")).toBeVisible();
    await expect(page.locator(".iframe-stage__frame")).toBeVisible();
  });

  test("student report route renders the report shell for a mocked OA", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("student"),
      getMissingCredentialsMessage("student")
    );

    await mockObjectDetailScenario(page);
    await loginAs(page, "student");

    await page.goto(`/#/report/${MOCK_OA_SLUG}?rstudent=true`);
    await expect(page.locator(".reports-page")).toBeVisible();
    await expect(page.locator(".reports-hero")).toBeVisible();
    await expect(page.locator(".reports-hero__eyebrow")).toContainText(/estudiante/i);
    await expect(page.locator(".reports-section")).toBeVisible();
    await expect(page.locator(".reports-page [role='tab']").first()).toBeVisible();
  });

  test("expert report route renders the report shell for a mocked OA", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("expert"),
      getMissingCredentialsMessage("expert")
    );

    await mockObjectDetailScenario(page);
    await loginAs(page, "expert");

    await page.goto(`/#/report/${MOCK_OA_SLUG}`);
    await expect(page.locator(".reports-page")).toBeVisible();
    await expect(page.locator(".reports-hero")).toBeVisible();
    await expect(page.locator(".reports-hero__eyebrow")).toContainText(/experto/i);
    await expect(page.locator(".reports-section")).toBeVisible();
    await expect(page.locator(".reports-page [role='tab']").first()).toBeVisible();
  });

  test("object detail redirects to notfound when the OA does not exist", async ({
    page,
  }) => {
    await page.route(`**/api/v1/learning-object/${MOCK_OA_SLUG}/`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Not found" }),
      });
    });

    await page.goto(`/#/object/${MOCK_OA_SLUG}`);
    await expect(page).toHaveURL(/\/#\/notfound$/);
  });

  test("object detail redirects to error when the OA detail endpoint fails", async ({
    page,
  }) => {
    await page.route(`**/api/v1/learning-object/${MOCK_OA_SLUG}/`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Server error" }),
      });
    });

    await page.goto(`/#/object/${MOCK_OA_SLUG}`);
    await expect(page).toHaveURL(/\/#\/error$/);
  });
});
