import { expect, Page, test } from "@playwright/test";
import {
  E2ERole,
  getMissingCredentialsMessage,
  hasRoleCredentials,
  loginAs,
} from "./helpers/auth";

type MockCurrentUser = Record<string, unknown>;

async function logoutFromPublicShell(page: Page) {
  await page.locator(".public-profile-toggle").click();
  await page.locator(".public-profile-menu-footer button").click();
  await expect(page).toHaveURL(/\/#\/?$/);
  await expect(page.locator(".menu-end.auth-actions")).toBeVisible();
}

async function logoutFromAdminShell(page: Page) {
  await page.goto("/#/admin/home");
  await expect(page.locator(".layout-dashboard")).toBeVisible();
  await page.locator(".profile-toggle-button").first().click();
  await page.locator(".admin-profile-menu-footer button").first().click();
  await expect(page).toHaveURL(/\/#\/?$/);
  await expect(page.locator(".menu-end.auth-actions")).toBeVisible();
}

async function mockUserRequestSequence(
  page: Page,
  responses: Array<{ status: number; body: MockCurrentUser | Record<string, unknown> }>
) {
  let requestIndex = 0;

  await page.route("**/api/v1/user/", async (route) => {
    const response =
      responses[Math.min(requestIndex, responses.length - 1)] ?? responses[0];
    requestIndex += 1;

    await route.fulfill({
      status: response.status,
      contentType: "application/json",
      body: JSON.stringify(response.body),
    });
  });
}

async function mockTokenRefresh(
  page: Page,
  status: number,
  body: Record<string, unknown> = {}
) {
  await page.route("**/api/v1/token/refresh/", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

async function mockAdminDashboardSummary(page: Page) {
  await page.route(
    "**/api/v1/total-oa-approved-and-disapproved/",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          total_oa_aproved: 1,
          toatal_oa_disapproved: 2,
        }),
      });
    }
  );

  await page.route(
    "**/api/v1/total-expert-teacher-approved-and-disapproved/",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          total_expert_approved: 1,
          total_expert_disapproved: 0,
          total_teacher_approved: 1,
          total_teacher_disapproved: 0,
          total_student: 3,
        }),
      });
    }
  );
}

function publicRoleCases(): E2ERole[] {
  return ["student", "teacher", "expert"];
}

function adminRoleCases(): E2ERole[] {
  return ["admin", "superuser"];
}

test.describe("ROA auth and session flows", () => {
  test("login shows a visible error when backend rejects the credentials", async ({
    page,
  }) => {
    await page.route("**/api/v1/csrf/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "csrf initialized",
          cookie: "csrftoken=test",
        }),
      });
    });

    await page.route("**/api/v1/login/", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "Invalid credentials",
        }),
      });
    });

    await page.goto("/#/login");
    await page.locator("input#email").fill("qa.invalid@example.com");
    await page.locator("input#password").fill("wrong-password");
    await page.locator("form#loginForm button[type='submit']").click();

    await expect(page).toHaveURL(/\/#\/login$/);
    await expect(page.locator(".p-toast-message-error")).toBeVisible();
  });

  test("login shows a visible generic error when backend rejects a blocked-like user", async ({
    page,
  }) => {
    await page.route("**/api/v1/csrf/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "csrf initialized",
          cookie: "csrftoken=test",
        }),
      });
    });

    await page.route("**/api/v1/login/", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "User blocked",
        }),
      });
    });

    await page.goto("/#/login");
    await page.locator("input#email").fill("blocked.user@example.com");
    await page.locator("input#password").fill("wrong-password");
    await page.locator("form#loginForm button[type='submit']").click();

    await expect(page).toHaveURL(/\/#\/login$/);
    await expect(page.locator(".p-toast-message-error")).toBeVisible();
    await expect(page.locator(".inactive-account")).toHaveCount(0);
  });

  test("login exposes inactive account recovery when backend reports inactive user", async ({
    page,
  }) => {
    await page.route("**/api/v1/csrf/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "csrf initialized",
          cookie: "csrftoken=test",
        }),
      });
    });

    await page.route("**/api/v1/login/", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          detail: "Account inactive user",
        }),
      });
    });

    await page.goto("/#/login");
    await page.locator("input#email").fill("inactive.user@example.com");
    await page.locator("input#password").fill("wrong-password");
    await page.locator("form#loginForm button[type='submit']").click();

    await expect(page).toHaveURL(/\/#\/login$/);
    await expect(page.locator(".inactive-account")).toBeVisible();
    await expect(page.locator(".inactive-account button")).toBeVisible();
  });

  for (const role of publicRoleCases()) {
    test(`public shell logout works for ${role}`, async ({ page }) => {
      test.skip(!hasRoleCredentials(role), getMissingCredentialsMessage(role));

      await loginAs(page, role);
      await logoutFromPublicShell(page);
    });
  }

  for (const role of adminRoleCases()) {
    test(`admin shell logout works for ${role}`, async ({ page }) => {
      test.skip(!hasRoleCredentials(role), getMissingCredentialsMessage(role));

      await loginAs(page, role);
      await logoutFromAdminShell(page);
    });
  }

  test("student session persists after reload on protected settings route", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("student"),
      getMissingCredentialsMessage("student")
    );

    await loginAs(page, "student");
    await page.goto("/#/settings/profile");
    await expect(page.locator(".profile-shell")).toBeVisible();

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/#\/settings\/profile(?:$|\?)/);
    await expect(page.locator(".profile-shell")).toBeVisible();
    await expect(page.locator(".public-profile-toggle")).toBeVisible();
  });

  test("student session persists after reload on public recommended route", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("student"),
      getMissingCredentialsMessage("student")
    );

    await loginAs(page, "student");
    await expect(page).toHaveURL(/\/#\/recommended(?:$|\?)/);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/#\/recommended(?:$|\?)/);
    await expect(page.locator(".public-profile-toggle")).toBeVisible();
  });

  test("settings route rehydrates session through refresh before rendering protected content", async ({
    page,
  }) => {
    await mockUserRequestSequence(page, [
      { status: 401, body: { detail: "Unauthorized" } },
      {
        status: 200,
        body: {
          id: 10,
          first_name: "Student",
          last_name: "Recovered",
          email: "student.recovered@example.com",
          roles: ["student"],
          image: null,
          student: {},
          teacher: null,
          collaboratingExpert: null,
          administrator: null,
        },
      },
    ]);
    await mockTokenRefresh(page, 200, { access: "cookie-refresh" });

    await page.goto("/#/settings/security");
    await expect(page).toHaveURL(/\/#\/settings\/security(?:$|\?)/);
    await expect(page.locator(".settings-page")).toBeVisible();
    await expect(page.locator(".security-page")).toBeVisible();
  });

  test("admin session persists after reload on dashboard route", async ({
    page,
  }) => {
    test.skip(!hasRoleCredentials("admin"), getMissingCredentialsMessage("admin"));

    await loginAs(page, "admin");
    await page.goto("/#/admin/home");
    await expect(page.locator(".layout-dashboard")).toBeVisible();

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/#\/admin\/home(?:$|\?)/);
    await expect(page.locator(".layout-dashboard")).toBeVisible();
    await expect(page.locator(".profile-toggle-button").first()).toBeVisible();
  });

  test("admin route rehydrates session through refresh before rendering dashboard", async ({
    page,
  }) => {
    await mockUserRequestSequence(page, [
      { status: 401, body: { detail: "Unauthorized" } },
      {
        status: 200,
        body: {
          id: 20,
          first_name: "Admin",
          last_name: "Recovered",
          email: "admin.recovered@example.com",
          roles: ["administrator"],
          image: null,
          administrator: { id: 1 },
          student: null,
          teacher: null,
          collaboratingExpert: null,
        },
      },
    ]);
    await mockTokenRefresh(page, 200, { access: "cookie-refresh" });
    await mockAdminDashboardSummary(page);

    await page.goto("/#/admin/home");
    await expect(page).toHaveURL(/\/#\/admin\/home(?:$|\?)/);
    await expect(page.locator(".layout-dashboard")).toBeVisible();
  });

  test("protected route redirects to login when the session cannot be recovered", async ({
    page,
  }) => {
    await mockUserRequestSequence(page, [
      { status: 401, body: { detail: "Unauthorized" } },
    ]);
    await mockTokenRefresh(page, 400, { detail: "Refresh invalid" });

    await page.goto("/#/settings/security");
    await expect(page).toHaveURL(/\/#\/login(?:$|\?)/);
    await expect(page.locator("form#loginForm")).toBeVisible();
    await expect(page.locator(".menu-end.auth-actions")).toBeVisible();
  });
});
