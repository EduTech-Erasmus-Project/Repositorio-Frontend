import { expect, test } from "@playwright/test";

function encodeBase64(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64");
}

test.describe("ROA recovery and verification flows", () => {
  test("recover password can redirect to email message with mocked backend", async ({ page }) => {
    await page.route("**/api/v1/request-reset-email/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "We have send you a link to reset your password",
        }),
      });
    });

    await page.goto("/#/restart-password");
    await page.locator("input#email").fill("qa@example.com");
    await page.locator("form#loginForm button[type='submit']").click();

    await expect(page).toHaveURL(/\/#\/emailMessage$/);
    await expect(page.locator(".email-message-panel")).toBeVisible();
  });

  test("email message route renders the confirmation state", async ({ page }) => {
    await page.goto("/#/emailMessage");

    await expect(page.locator(".email-message-panel")).toBeVisible();
    await expect(page.locator(".email-message-login-button")).toBeVisible();
  });

  test("verify email route can show a mocked success state", async ({ page }) => {
    await page.route("**/api/v1/email-verify/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    const encodedEmail = encodeBase64("qa@example.com");
    await page.goto(`/#/emailVerify/token-ok/${encodedEmail}`);

    await expect(page.locator(".confirm-message")).toBeVisible();
    await page.locator(".confirm-message button").click();
    await expect(page).toHaveURL(/\/#\/login$/);
  });

  test("verify email route can request a new link when token is expired", async ({ page }) => {
    await page.route("**/api/v1/email-verify/**", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Activacion expirada" }),
      });
    });

    await page.route("**/api/v1/set-verify/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: 200 }),
      });
    });

    const encodedEmail = encodeBase64("qa@example.com");
    await page.goto(`/#/emailVerify/token-expired/${encodedEmail}`);

    await expect(page.locator(".error-message")).toBeVisible();
    await page.locator(".error-message button").click();
    await expect(page.locator("p-message")).toBeVisible();
  });
});
