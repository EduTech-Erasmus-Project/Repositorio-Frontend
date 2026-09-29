import { expect, Page, test } from "@playwright/test";
import {
  getMissingCredentialsMessage,
  hasRoleCredentials,
  loginAs,
} from "./helpers/auth";

const PROFILE_IMAGE_FIXTURE = "src/assets/img/noimage.png";
const MOCK_IFRAME_URL = "http://localhost:4202/assets/img/noimage.png";
const MOCK_EDIT_OBJECT_ID = 4242;

function buildStudentProfileResponse() {
  return {
    id: 701,
    first_name: "Estudiante",
    last_name: "Demo",
    email: "student.e2e@example.com",
    image: "assets/img/noimage.png",
    roles: ["student"],
    student: {
      birthday: "2000-01-01",
      education_levels: [{ id: 1, name: "Universitario" }],
      knowledge_areas: [{ id: 100, name: "Tecnologia" }],
      preferences: [{ id: 10, description: "Didactica" }],
      has_disability: false,
      disability_description: "Ninguna",
    },
    teacher: null,
    collaboratingExpert: null,
    city: null,
    university: null,
    campus: null,
  };
}

function buildTeacherObject(id: number, title: string) {
  return {
    id,
    slug: `teacher-oa-${id}`,
    general_title: title,
    general_description: `Descripcion ${title}`,
    general_keyword: "e2e,settings",
    general_language: "es",
    educational_typicalAgeRange: "18-35",
    adaptation: "yes",
    avatar: "assets/img/noimage.png",
    public: true,
    user_created: {
      id: 51,
      first_name: "Docente",
      last_name: "E2E",
      image_url: null,
    },
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
    learning_object_file: {
      id: id + 1000,
      url: MOCK_IFRAME_URL,
      file: MOCK_IFRAME_URL,
      oa_oer_adap_url: null,
      oa_preview_adapted: null,
      oa_preview_origin: null,
    },
  };
}

async function expectBreadcrumbContains(page: Page, expected: RegExp) {
  const breadcrumb = page.locator(".shared-breadcrumb");
  await expect(breadcrumb).toBeVisible();
  await expect
    .poll(async () => (await breadcrumb.textContent()) ?? "", { timeout: 10000 })
    .toMatch(expected);
}

async function installProfileMocks(page: Page) {
  const currentProfile = buildStudentProfileResponse();

  await page.route("**/api/v1/user-management/*", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(currentProfile),
      });
      return;
    }

    if (method === "PUT") {
      const payload = route.request().postDataJSON() as Record<string, unknown>;
      currentProfile.first_name = String(payload.first_name ?? currentProfile.first_name);
      currentProfile.last_name = String(payload.last_name ?? currentProfile.last_name);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(currentProfile),
      });
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/v1/user/photo/*/", async (route) => {
    currentProfile.image = "https://cdn.example.com/avatar-e2e-updated.png";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ image: currentProfile.image }),
    });
  });

  await page.route("**/api/v1/profession/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/v1/education-level/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        values: [{ id: 1, name: "Universitario" }],
      }),
    });
  });

  await page.route("**/api/v1/preferences-area/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 1,
          preferences_are: "Metodologia",
          preferences: [{ id: 10, description: "Didactica" }],
        },
      ]),
    });
  });

  await page.route("**/api/v1/knowledge-area/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        values: [{ id: 100, name: "Tecnologia" }],
      }),
    });
  });

  await page.route("**/api/v1/address/cities/active", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}

async function installTeacherObjectsMocks(page: Page) {
  const pageOneObjects = [
    buildTeacherObject(9001, "OA docente pagina 1 - A"),
    buildTeacherObject(9002, "OA docente pagina 1 - B"),
  ];
  const pageTwoObjects = [
    buildTeacherObject(9003, "OA docente pagina 2 - A"),
    buildTeacherObject(9004, "OA docente pagina 2 - B"),
  ];

  await page.route(/\/api\/v1\/learning-objects\/observation\/(\?.*)?$/, async (route) => {
    const requestUrl = new URL(route.request().url());
    const pageParam = requestUrl.searchParams.get("page") ?? "1";
    const results = pageParam === "2" ? pageTwoObjects : pageOneObjects;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 4,
        next: pageParam === "1" ? "next" : null,
        previous: pageParam === "2" ? "prev" : null,
        results,
      }),
    });
  });

  await page.route("**/api/v1/learning-objects/evaluations-result-expert-priority/*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/v1/learning-objects/evaluations-result-to-expert-automatic/*/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/v1/learning-objects/student/result-to-public-student/*/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/v1/learning-objects/liked-count/*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ total: 0 }]),
    });
  });
}

async function installEditObjectMocks(page: Page) {
  const object = buildTeacherObject(MOCK_EDIT_OBJECT_ID, "OA editable E2E");

  await page.route(`**/api/v1/learning-object-metadata/${MOCK_EDIT_OBJECT_ID}/`, async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(object),
      });
      return;
    }

    if (method === "PATCH") {
      object.general_title = "OA editable guardado";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(object),
      });
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/v1/user-preferences/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/v1/education-level/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        values: [{ id: 1, name: "Universitario" }],
      }),
    });
  });

  await page.route("**/api/v1/knowledge-area/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        values: [{ id: 1, name: "Tecnologia" }],
      }),
    });
  });

  await page.route("**/api/v1/license/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        values: [{ id: 1, description: "Creative Commons" }],
      }),
    });
  });
}

test.describe("ROA settings flows", () => {
  test("student can save profile changes with controlled response and breadcrumb", async ({ page }) => {
    test.skip(!hasRoleCredentials("student"), getMissingCredentialsMessage("student"));

    await loginAs(page, "student");
    await installProfileMocks(page);

    await page.goto("/#/settings/profile");
    await expect(page.locator(".profile-shell")).toBeVisible();
    await expectBreadcrumbContains(page, /mi perfil|my profile/i);

    await page.locator("#firstnamelabel").fill("Ana");
    const updateResponse = page.waitForResponse((response) => {
      return response.request().method() === "PUT"
        && /\/api\/v1\/user-management\/\d+\/?$/.test(response.url());
    });
    await page.locator("form#loginForm button[type='submit']").click();

    await updateResponse;
    await expect(page.locator("#firstnamelabel")).toHaveValue("Ana");
  });

  test("student can preview and upload a profile image with controlled response", async ({ page }) => {
    test.skip(!hasRoleCredentials("student"), getMissingCredentialsMessage("student"));

    await loginAs(page, "student");
    await installProfileMocks(page);

    await page.goto("/#/settings/profile");
    const profileImage = page.locator(".profile-picture img");
    await expect(profileImage).toBeVisible();

    await page.setInputFiles("input.image-select", PROFILE_IMAGE_FIXTURE);
    await expect(page.locator(".profile-picture__actions")).toBeVisible();
    await expect
      .poll(async () => await profileImage.getAttribute("src"), { timeout: 10000 })
      .toContain("data:image");

    await page.locator(".profile-picture__actions button").last().click();

    await expect(page.locator(".p-toast-message-success")).toBeVisible();
    await expect
      .poll(async () => await profileImage.getAttribute("src"), { timeout: 10000 })
      .toContain("avatar-e2e-updated.png");
  });

  test("student can change password with controlled success response", async ({ page }) => {
    test.skip(!hasRoleCredentials("student"), getMissingCredentialsMessage("student"));

    await loginAs(page, "student");

    await page.route("**/api/v1/user/change_password/*/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "Ok" }),
      });
    });

    await page.route("**/api/v1/logout/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "logout ok" }),
      });
    });

    await page.goto("/#/settings/security");
    await expect(page.locator(".security-page")).toBeVisible();
    await expectBreadcrumbContains(page, /seguridad|security/i);

    await page.locator(".security-page__toggle").click();
    await page.locator("#passwordOldInput").fill("Anterior1A");
    await page.locator("#passwordNew").fill("NuevaSegura1A");
    await page.locator("#passwordNewAgain").fill("NuevaSegura1A");
    await page.locator(".security-form button[type='submit']").click();

    await expect(page).toHaveURL(/\/#\/login(?:$|\?)/);
    await expect(page.locator("form#loginForm")).toBeVisible();
  });

  test("student can see controlled empty states in viewed and qualified routes", async ({ page }) => {
    test.skip(!hasRoleCredentials("student"), getMissingCredentialsMessage("student"));

    await loginAs(page, "student");

    await page.route("**/api/v1/learning-objects/viewed/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/v1/learning-objects/my-qualification/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 0,
          next: null,
          previous: null,
          results: [],
        }),
      });
    });

    await page.goto("/#/settings/my-views");
    await expect(page.locator("app-student-viewed .empty-state")).toBeVisible();
    await expectBreadcrumbContains(page, /vistos por m[ií]|viewed/i);

    await page.goto("/#/settings/objects-qualified");
    await expect(page.locator("app-my-qualified-oa .empty-state")).toBeVisible();
    await expectBreadcrumbContains(page, /calificados por m[ií]|rated/i);
  });

  test("teacher can paginate my objects with controlled data", async ({ page }) => {
    test.skip(!hasRoleCredentials("teacher"), getMissingCredentialsMessage("teacher"));

    await loginAs(page, "teacher");
    await installTeacherObjectsMocks(page);

    await page.reload();
    await page.goto("/#/settings/my-objects");
    await expect(page.locator(".my-objects-grid")).toBeVisible();
    await expectBreadcrumbContains(page, /mis objetos de aprendizaje|my learning objects/i);
    await expect(
      page.locator(".card-title-link").filter({ hasText: "OA docente pagina 1 - A" }).first()
    ).toBeVisible();
    await expect(page.locator(".my-objects-paginator")).toBeVisible();

    await page.locator(".my-objects-paginator .p-paginator-next").click();
    await expect(
      page.locator(".card-title-link").filter({ hasText: "OA docente pagina 2 - A" }).first()
    ).toBeVisible();
  });

  test("teacher can save edit-object with controlled metadata response", async ({ page }) => {
    test.skip(!hasRoleCredentials("teacher"), getMissingCredentialsMessage("teacher"));

    await loginAs(page, "teacher");
    await installEditObjectMocks(page);

    await page.goto(`/#/settings/edit-object/${MOCK_EDIT_OBJECT_ID}`);
    await expect(page.locator("iframe.frame-object")).toBeVisible();
    await expectBreadcrumbContains(page, /editar objeto|edit/i);

    await page.locator("#title").fill("OA editable guardado desde E2E");
    const saveResponse = page.waitForResponse((response) => {
      return response.request().method() === "PATCH"
        && response.url().includes(`/api/v1/learning-object-metadata/${MOCK_EDIT_OBJECT_ID}/`);
    });
    await page.locator("form button[type='submit']").click();

    await saveResponse;
    await expect(page.locator(".p-toast-message-success")).toBeVisible();
    await expect(page.locator("#title")).toHaveValue("OA editable guardado desde E2E");
  });
});
