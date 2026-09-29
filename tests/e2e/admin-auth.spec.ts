import { expect, test } from "@playwright/test";
import {
  getMissingCredentialsMessage,
  hasRoleCredentials,
  loginAs,
} from "./helpers/auth";

async function openPendingDetailIfExists(
  page: import("@playwright/test").Page
) {
  await page.goto("/#/admin/learning-object/pending");
  await expect(page.locator("#created_init")).toBeVisible();
  await expect(page.locator("#general_title")).toBeVisible();

  const detailButtons = page.getByRole("button", { name: /detalle/i });
  const detailCount = await detailButtons.count();

  if (detailCount === 0) {
    await expect(page.locator("p-table")).toBeVisible();
    return false;
  }

  await detailButtons.first().click();
  await expect(page).toHaveURL(/\/#\/admin\/learning-object\/pending\/detail\//);
  await expect(page.locator(".div-container")).toBeVisible();
  return true;
}

test.describe("ROA admin minimum functional flow", () => {
  test("admin can open dashboard, pending OA list and report", async ({ page }) => {
    test.skip(!hasRoleCredentials("admin"), getMissingCredentialsMessage("admin"));

    await loginAs(page, "admin");
    await page.goto("/#/admin/home");
    await expect(page.locator(".layout-dashboard")).toBeVisible();

    const preferencesToggle = page.locator(".flc-slidingPanel-toggleButton").first();
    if (await preferencesToggle.isVisible()) {
      await preferencesToggle.click();
      await expect(page.locator(".layout-topbar")).toBeVisible();
      await expect(page.locator(".layout-sidebar")).toBeVisible();
    }

    await page.goto("/#/admin/learning-object/pending");
    await expect(page.locator("#created_init")).toBeVisible();
    await expect(page.locator("#general_title")).toBeVisible();

    await page.goto("/#/admin/report");
    await expect(page.locator(".report-page")).toBeVisible();
    await expect(page.locator("#query")).toBeVisible();
  });

  test("admin can open pending OA detail and student list", async ({ page }) => {
    test.skip(!hasRoleCredentials("admin"), getMissingCredentialsMessage("admin"));

    await loginAs(page, "admin");
    const detailOpened = await openPendingDetailIfExists(page);

    if (detailOpened) {
      await expect(
        page.locator("app-iframe-integrated-menu, .div-spinner")
      ).toBeVisible();
    }

    await page.goto("/#/admin/student");
    await expect(page.locator("p-table")).toBeVisible();
    await expect(page.locator(".table-title")).toContainText(/estudiante|students/i);
  });
});
