import { expect, test } from "@playwright/test";

test.describe("ROA public navigation", () => {
  test("guest actions navigate to login and register", async ({ page }) => {
    await page.goto("/#/", { waitUntil: "domcontentloaded" });

    const authActions = page.locator(".menu-end.auth-actions");
    await expect(authActions).toBeVisible();

    await authActions.getByRole("link", { name: /iniciar sesi[oó]n|login/i }).click();
    await expect(page).toHaveURL(/\/#\/login$/);
    await expect(page.locator("form#loginForm")).toBeVisible();

    await page.goto("/#/");
    await page.locator(".menu-end.auth-actions").getByRole("link", { name: /registrarme|register/i }).click();
    await expect(page).toHaveURL(/\/#\/register$/);
    await expect(page.locator("form#loginForm")).toBeVisible();
  });

  test("mobile menu can navigate to about us", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/");

    await page.locator(".menu-mobile-toggle").click();
    await expect(page.locator("#public-mobile-panel")).toBeVisible();
    await page.locator("#public-mobile-panel .menu-link").filter({ hasText: /Nosotros|About us/i }).click();

    await expect(page).toHaveURL(/\/#\/about-us$/);
    await expect(page.locator("section.about-hero")).toBeVisible();
  });

  test("register route renders the membership form", async ({ page }) => {
    await page.goto("/#/register");

    await expect(page.locator("form#loginForm")).toBeVisible();
    await expect(page.locator("input#firstname4")).toBeVisible();
    await expect(page.locator("input#lastname4")).toBeVisible();
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();

    const termsButton = page.locator("form#loginForm .terms .terms-link-button");
    await expect(termsButton).toBeVisible();
    await termsButton.click();
    await expect(page.locator(".terms-dialog")).toBeVisible();
  });

  test("restart password route renders and validates email input", async ({ page }) => {
    await page.goto("/#/restart-password");

    await expect(page.locator("form#loginForm")).toBeVisible();
    await page.locator("input#email").fill("correo-invalido");
    await page.locator("input#email").blur();

    await expect(page.locator("#recover-email-error .p-error")).toBeVisible();
    await expect(page.locator("form#loginForm button[type='submit']")).toBeDisabled();
  });

  test("guide route renders the stepper shell", async ({ page }) => {
    await page.goto("/#/guide");

    await expect(page.locator("section.guide-shell")).toBeVisible();
    await expect(page.locator(".guide-shell__stepper")).toBeVisible();
    await expect(page.locator(".guide-shell__step.is-active")).toBeVisible();
  });

  test("guide breadcrumb updates through steps and profile selection without extra clicks", async ({ page }) => {
    await page.goto("/#/guide");

    const breadcrumb = page.locator(".shared-breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(page).toHaveURL(/\/#\/guide(?:\/eXeLearning)?$/);

    const initialBreadcrumbText = (await breadcrumb.textContent())?.trim() ?? "";
    expect(initialBreadcrumbText.length).toBeGreaterThan(0);

    const nextButton = page.getByRole("button", { name: /siguiente|next/i });
    await nextButton.click();
    await nextButton.click();
    await nextButton.click();

    await expect(page).toHaveURL(/\/#\/guide\/registration-profile$/);
    await expect(page.locator(".registration-guide")).toBeVisible();

    await expect
      .poll(async () => ((await breadcrumb.textContent()) || "").trim(), { timeout: 10000 })
      .not.toBe(initialBreadcrumbText);

    const registrationBreadcrumbText = (await breadcrumb.textContent())?.trim() ?? "";

    await page.locator(".registration-guide__profile-body .p-button").first().click();

    await expect(page).toHaveURL(/\/#\/guideStudent\/qualifications$/);
    await expect(page.locator("section.guide-student-shell")).toBeVisible();

    await expect
      .poll(async () => ((await breadcrumb.textContent()) || "").trim(), { timeout: 10000 })
      .not.toBe(registrationBreadcrumbText);
  });
});
