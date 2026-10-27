import { expect, Locator, Page, Request, test } from "@playwright/test";
import {
  getMissingCredentialsMessage,
  hasRoleCredentials,
  loginAs,
} from "./helpers/auth";

/**
 * Ubicacion de docentes y expertos con `@countrystatecity/countries-browser`:
 * registro, perfil y reporte de administracion. Los POST/PUT y el reporte se
 * responden con datos simulados para no crear ni modificar usuarios.
 */

const MX_LOCATION = {
  country_code: "MX",
  country_name: "México",
  province_code: "JAL",
  province_name: "Jalisco",
  city_name: "Guadalajara",
  university_name: "Universidad de Guadalajara",
};

/** Elige una opcion de un `p-select` escribiendo en su buscador, como un usuario. */
async function chooseOption(page: Page, combobox: Locator, search: string, option: RegExp) {
  await combobox.click();
  const filter = page.locator(".p-select-overlay .p-select-filter");
  await expect(filter).toBeVisible();
  await filter.pressSequentially(search);
  await page.locator(".p-select-overlay .p-select-option", { hasText: option }).first().click();
  await expect(page.locator(".p-select-overlay")).toHaveCount(0);
}

function trackLocationDataRequests(page: Page) {
  const requests: string[] = [];
  page.on("request", (request: Request) => {
    const url = request.url();
    if (url.includes("/csc/") || url.includes("countries-es.json") || url.includes("countrystatecity")) {
      requests.push(url);
    }
  });
  return requests;
}

function buildTeacherProfile() {
  return {
    id: 167,
    first_name: "Lucía",
    last_name: "Hernández",
    email: "docente.e2e@example.com",
    image: "assets/img/noimage.png",
    roles: ["teacher"],
    student: null,
    teacher: { is_active: true, professions: [{ id: 2, description: "Matemático" }] },
    collaboratingExpert: null,
    ...MX_LOCATION,
  };
}

/**
 * Responde `GET /user-management/{id}` con `profile` y guarda el cuerpo del
 * `PUT /user-management/{id}/` (con barra final) sin llegar al backend.
 */
async function mockProfile(page: Page, profile: Record<string, unknown>) {
  const state: { updatePayload: Record<string, unknown> | null } = { updatePayload: null };
  await page.route(/\/api\/v1\/user-management\/\d+\/?$/, async (route) => {
    const method = route.request().method();
    if (method === "PUT") {
      state.updatePayload = route.request().postDataJSON() as Record<string, unknown>;
      Object.assign(profile, state.updatePayload);
    } else if (method !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(profile) });
  });
  return state;
}

test.describe("Ubicacion de docentes y expertos", () => {
  test("registro de docente exige provincia y envia los seis campos de ubicacion", async ({ page }) => {
    const locationRequests = trackLocationDataRequests(page);
    let registerPayload: Record<string, unknown> | null = null;

    await page.route("**/api/v1/user-management/", async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }
      registerPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: 9999, email: registerPayload["email"] }),
      });
    });

    await page.goto("/#/register?register=teacher");
    const location = page.locator("app-user-location-fields");
    await expect(location).toBeVisible();

    await page.locator("input#firstname4").fill("Zoë");
    await page.locator("input#lastname4").fill("O'Connor-Müller");
    await page.locator("input#email").fill("docente.e2e@example.com");
    await page.locator("input#password").fill("ClaveE2e2026");
    await page.locator("select#Profesion").selectOption({ index: 1 });

    await chooseOption(page, page.locator("#register-location-country"), "mexi", /^México$/);

    // Con pais elegido, la provincia es obligatoria y la ciudad espera la provincia.
    await page.locator("form#loginForm button[type='submit']").click();
    await expect(page.locator("#register-location-province-error")).toBeVisible();
    await expect(page.locator("#register-location-city")).toHaveAttribute("aria-disabled", "true");
    expect(registerPayload).toBeNull();

    await chooseOption(page, page.locator("#register-location-province"), "jalis", /^Jalisco$/);
    await chooseOption(page, page.locator("#register-location-city"), "guadala", /^Guadalajara$/);
    await page.locator("#register-location-university").fill("Universidad de Guadalajara");
    await page.locator("label[for='Terms']").evaluate((label) => (label as HTMLLabelElement).click());

    await page.locator("form#loginForm button[type='submit']").click();

    await expect.poll(() => registerPayload).not.toBeNull();
    expect(registerPayload).toEqual(expect.objectContaining({ roles: ["teacher"], ...MX_LOCATION }));
    for (const legacyField of ["city", "university", "campus"]) {
      expect(registerPayload).not.toHaveProperty(legacyField);
    }

    // Los datos de la libreria salen de `assets`, no de jsDelivr.
    expect(locationRequests.some((url) => url.includes("/assets/csc/data/states/MX.json"))).toBeTruthy();
    expect(locationRequests.filter((url) => !url.startsWith(new URL(page.url()).origin))).toEqual([]);
  });

  test("perfil de docente precarga la ubicacion y al cambiar de pais vacia la provincia", async ({ page }) => {
    test.skip(!hasRoleCredentials("teacher"), getMissingCredentialsMessage("teacher"));

    await loginAs(page, "teacher");
    const profileMock = await mockProfile(page, buildTeacherProfile());

    await page.goto("/#/settings/profile");
    await expect(page.locator(".profile-shell")).toBeVisible();
    await expect(page.locator("#profile-location-country")).toHaveText("México");
    await expect(page.locator("#profile-location-province")).toHaveText("Jalisco");
    await expect(page.locator("#profile-location-city")).toHaveText("Guadalajara");
    await expect(page.locator("#profile-location-university")).toHaveValue("Universidad de Guadalajara");

    // Macao no tiene provincias: el selector desaparece y la ciudad es texto libre.
    await chooseOption(page, page.locator("#profile-location-country"), "maca", /Macau/);
    await expect(page.locator("#profile-location-province")).toHaveCount(0);
    await page.locator("#profile-location-other-city").fill("Macao");

    await page.locator("form#loginForm button[type='submit']").click();

    await expect.poll(() => profileMock.updatePayload).not.toBeNull();
    expect(profileMock.updatePayload).toEqual(
      expect.objectContaining({
        country_code: "MO",
        province_code: "",
        province_name: "",
        city_name: "Macao",
        university_name: "Universidad de Guadalajara",
      })
    );
  });

  test("perfil de un docente migrado completa la provincia y conserva su ciudad", async ({ page }) => {
    test.skip(!hasRoleCredentials("teacher"), getMissingCredentialsMessage("teacher"));

    // Como queda un usuario tras la migracion `0006_user_location_text`: sin
    // `province_code` y con los nombres como estaban en la base anterior.
    await loginAs(page, "teacher");
    const profileMock = await mockProfile(page, {
      ...buildTeacherProfile(),
      country_code: "EC",
      country_name: "Ecuador",
      province_code: "",
      province_name: "AZUAY",
      city_name: "Santa Isabel de Chaguarurco",
      university_name: "UNIVERSIDAD POLITÉCNICA SALESIANA",
    });

    await page.goto("/#/settings/profile");
    await expect(page.locator("#profile-location-country")).toHaveText("Ecuador");
    await expect(page.locator("#profile-location-province")).toHaveText("Azuay");
    // La ciudad no esta en la libreria: se muestra en "Otra ciudad" sin perderla.
    await expect(page.locator("#profile-location-city")).toHaveText(/Otra ciudad/);
    await expect(page.locator("#profile-location-other-city")).toHaveValue("Santa Isabel de Chaguarurco");

    await page.locator("form#loginForm button[type='submit']").click();

    await expect.poll(() => profileMock.updatePayload).not.toBeNull();
    expect(profileMock.updatePayload).toEqual(
      expect.objectContaining({
        country_code: "EC",
        province_code: "A",
        province_name: "Azuay",
        city_name: "Santa Isabel de Chaguarurco",
        university_name: "UNIVERSIDAD POLITÉCNICA SALESIANA",
      })
    );
  });

  test("reporte filtra por pais y por texto de ciudad y universidad", async ({ page }) => {
    test.skip(!hasRoleCredentials("admin"), getMissingCredentialsMessage("admin"));

    await loginAs(page, "admin");

    const reportRequests: URL[] = [];
    await page.route(/\/api\/v1\/report(\?.*)?$/, async (route) => {
      reportRequests.push(new URL(route.request().url()));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 1,
          results: [{ id: 167, first_name: "Lucía", last_name: "Hernández", email: "docente.e2e@example.com", learning_objects: [], ...MX_LOCATION }],
        }),
      });
    });

    await page.goto("/#/admin/report");
    await expect(page.locator("form.report-filter-grid")).toBeVisible();

    await chooseOption(page, page.locator("#country_code"), "mexi", /^México$/);
    await page.locator("#city_name").fill(" guadala ");
    await page.locator("#university_name").fill("Guadalajara");
    await page.locator("form.report-filter-grid button[type='submit']").click();

    await expect.poll(() => reportRequests.length).toBeGreaterThan(0);
    const params = reportRequests[reportRequests.length - 1].searchParams;
    expect(params.get("country")).toBe("MX");
    expect(params.get("city")).toBe("guadala");
    expect(params.get("university")).toBe("Guadalajara");
    expect(params.has("province")).toBeFalsy();
    expect(params.has("campus")).toBeFalsy();

    await expect(page.locator(".report-table tbody")).toContainText("Guadalajara, Jalisco, México");
  });
});
