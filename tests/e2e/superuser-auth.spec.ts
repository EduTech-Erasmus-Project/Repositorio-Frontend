import { expect, test } from "@playwright/test";
import {
  getMissingCredentialsMessage,
  hasRoleCredentials,
  loginAs,
} from "./helpers/auth";

test.describe("ROA superuser exclusive flows", () => {
  test("superuser can open exclusive administrator and configuration routes", async ({
    page,
  }) => {
    test.skip(
      !hasRoleCredentials("superuser"),
      getMissingCredentialsMessage("superuser")
    );

    await loginAs(page, "superuser");

    await page.goto("/#/admin/home");
    await expect(page.locator(".layout-dashboard")).toBeVisible();

    await page.goto("/#/admin/administrator/register");
    await expect(page.locator("form#crearUsuario")).toBeVisible();
    await expect(page.locator("input#nombre")).toBeVisible();
    await expect(page.locator("input#correo")).toBeVisible();

    await page.goto("/#/admin/administrator/list");
    await expect(page.locator(".table-title")).toContainText(/usuario administrador/i);
    await expect(page.locator("p-table")).toBeVisible();

    await page.goto("/#/admin/expert/question");
    await expect(page.locator(".expert-question-page")).toBeVisible();
    await expect(page.locator(".expert-question-toolbar .p-button-success")).toBeVisible();

    await page.goto("/#/admin/expert/automatic");
    await expect(page.locator(".metadata-navigation")).toBeVisible();
    await expect(page.locator(".metadata-toolbar")).toBeVisible();

    await page.goto("/#/admin/config/domain");
    await expect(page.locator(".email-domains-page")).toBeVisible();
    await expect(page.locator("#domain-teacher")).toBeVisible();
    await expect(page.locator("#relation-option")).toBeVisible();

    await page.goto("/#/admin/config/server");
    await expect(page.locator(".email-server-page")).toBeVisible();
    await expect(page.locator("input#host")).toBeVisible();
    await expect(page.locator("input#email_from")).toBeVisible();
  });
});
