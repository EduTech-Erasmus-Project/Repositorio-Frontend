import { expect, test } from "@playwright/test";
import {
  getMissingCredentialsMessage,
  hasRoleCredentials,
  loginAs,
} from "./helpers/auth";

async function expectCardsOrEmptyState(
  page: import("@playwright/test").Page,
  rootSelector: string
) {
  const root = page.locator(rootSelector);
  await expect(root).toBeVisible();

  const finalState = root
    .locator(".state-card--error, .empty-state, .card-content:not(.card-content--skeleton)")
    .first();

  await expect(finalState).toBeVisible({ timeout: 10000 });
}

test.describe("ROA authenticated settings flows", () => {
  test("student can open recommended, profile and security", async ({ page }) => {
    test.skip(!hasRoleCredentials("student"), getMissingCredentialsMessage("student"));

    await loginAs(page, "student");
    await expect(page).toHaveURL(/\/#\/recommended(?:$|\?)/);

    await page.goto("/#/settings/profile");
    await expect(page.locator(".profile-shell")).toBeVisible();

    await page.goto("/#/settings/security");
    await expect(page.locator(".security-page")).toBeVisible();
    await page.locator(".security-page__toggle").click();
    await expect(page.locator("#passwordOldInput")).toBeVisible();
    await expect(page.locator("#passwordNew")).toBeVisible();
  });

  test("student can open viewed and qualified OA routes", async ({ page }) => {
    test.skip(!hasRoleCredentials("student"), getMissingCredentialsMessage("student"));

    await loginAs(page, "student");
    await expect(page).toHaveURL(/\/#\/recommended(?:$|\?)/);

    await page.goto("/#/settings/my-views");
    await expectCardsOrEmptyState(page, "app-student-viewed > .content");

    await page.goto("/#/settings/objects-qualified");
    await expectCardsOrEmptyState(page, "app-my-qualified-oa > .content");
  });

  test("teacher can open my objects, upload OA and edit OA routes", async ({ page }) => {
    test.skip(!hasRoleCredentials("teacher"), getMissingCredentialsMessage("teacher"));

    await loginAs(page, "teacher");
    await expect(page).toHaveURL(/\/#\/settings\/my-objects(?:$|\?)/);

    await page.goto("/#/settings/my-objects");
    await expect(page.locator(".my-objects-grid, .empty-state")).toBeVisible();

    await page.goto("/#/settings/new-object");
    await expect(page.locator(".load-oa-main-upload")).toBeVisible();

    await page.goto("/#/settings/my-objects");
    await expect(page.locator(".my-objects-grid, .empty-state")).toBeVisible();

    const editButtons = page.locator(".my-objects-grid .button-edit");
    const editButtonsCount = await editButtons.count();

    if (editButtonsCount === 0) {
      await expect(page.locator(".empty-state")).toBeVisible();
      return;
    }

    await editButtons.first().click();
    await expect(page).toHaveURL(/\/#\/settings\/edit-object\/\d+(?:$|\?)/);
    await expect(page.locator("iframe.frame-object")).toBeVisible();
    await expect(page.locator("input#title")).toBeVisible();
  });

  test("expert can open qualified OA view", async ({ page }) => {
    test.skip(!hasRoleCredentials("expert"), getMissingCredentialsMessage("expert"));

    await loginAs(page, "expert");
    await expect(page).toHaveURL(/\/#\/search(?:$|\?)/);

    await page.goto("/#/settings/objects-qualified");
    await expectCardsOrEmptyState(page, "app-my-qualified-oa > .content");
  });
});
