import { expect, test } from "@playwright/test";

test.describe("ROA public smoke", () => {
  test("home renders the public shell", async ({ page }) => {
    await page.goto("/#/");

    await expect(page.locator("app-menu-public")).toBeVisible();
    await expect(page.locator("section.content-search")).toBeVisible();
    await expect(page.locator("section.home-list-section").first()).toBeVisible();
  });

  test("login renders the authentication form", async ({ page }) => {
    await page.goto("/#/login");

    await expect(page.locator("form#loginForm")).toBeVisible();
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("terms renders the legal content", async ({ page }) => {
    await page.goto("/#/terms-and-conditions");

    await expect(page.locator("section.terms-hero")).toBeVisible();
    await expect(page.locator("section.terms-sections article").first()).toBeVisible();
  });

  test("about us renders the institutional content", async ({ page }) => {
    await page.goto("/#/about-us");

    await expect(page.locator("section.about-hero")).toBeVisible();
    await expect(page.locator("section.about-links-grid article.card-about").first()).toBeVisible();
  });

  test("contact renders the public form", async ({ page }) => {
    await page.goto("/#/contact");

    await expect(page.locator("form#loginForm")).toBeVisible();
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.locator("#contact-email")).toBeVisible();
    await expect(page.locator("#contact-message")).toBeVisible();
  });
});
