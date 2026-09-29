import { expect, Page, test } from "@playwright/test";

async function waitForSearchLikeContent(page: Page, rootSelector: string) {
  await page.waitForFunction(
    (root) => {
      const rootElement = document.querySelector(root);

      if (!rootElement) {
        return false;
      }

      const resultLinks = rootElement.querySelectorAll(".card-title-link").length;
      const emptyState = rootElement.querySelector(
        ".search-no-results, .search-empty-column"
      );
      const skeletons = rootElement.querySelectorAll(".p-skeleton").length;

      return resultLinks > 0 || !!emptyState || skeletons === 0;
    },
    rootSelector,
    { timeout: 10_000 }
  );
}

async function getFirstHomeCard(page: Page) {
  await page.goto("/#/");
  await expect(page.locator("section.home-list-section").first()).toBeVisible();
  await waitForSearchLikeContent(page, "section.home-list-section");

  const links = page.locator("section.home-list-section .card-title-link");
  const count = await links.count();

  return {
    count,
    firstLink: links.first(),
  };
}

test.describe("ROA search and detail flows", () => {
  test("a public OA card from home opens the detail view", async ({ page }) => {
    const { count, firstLink } = await getFirstHomeCard(page);
    test.skip(count === 0, "No hay OAs publicos visibles en home para este entorno.");

    const href = await firstLink.getAttribute("href");
    expect(href).toContain("/object/");

    await firstLink.click();

    await expect(page).toHaveURL(/\/#\/object\//);
    await expect(page.locator(".object-page")).toBeVisible();
    await expect(page.locator("app-web-view")).toBeVisible();
    await expect(page.locator("app-side-object")).toBeVisible();
    await expect(page.locator(".object-page__tabs-shell")).toBeVisible();
    await expect(page.locator(".object-page__tabs-shell p-tab").nth(0)).toBeVisible();
    await expect(page.locator(".object-page__tabs-shell p-tab").nth(1)).toBeVisible();
    await expect(page.locator(".object-page__tabs-shell p-tab").nth(2)).toBeVisible();
    await expect(page.locator(".object-page__tabs-shell p-tab").nth(3)).toBeVisible();
  });

  test("search route can render recent results and open a detail when data exists", async ({ page }) => {
    await page.goto("/#/search?recent=True");

    await expect(page.locator(".search-layout")).toBeVisible();
    await waitForSearchLikeContent(page, ".search-layout");

    const resultLinks = page.locator(".search-results-grid .card-title-link");
    const resultCount = await resultLinks.count();

    if (resultCount === 0) {
      await expect(page.locator(".search-no-results, .search-empty-column")).toBeVisible();
      return;
    }

    await resultLinks.first().click();

    await expect(page).toHaveURL(/\/#\/object\//);
    await expect(page.locator(".object-page")).toBeVisible();
    await expect(page.locator("app-web-view")).toBeVisible();
    await expect(page.locator("app-side-object")).toBeVisible();
    await expect(page.locator(".object-page__tabs-shell")).toBeVisible();
  });
});
