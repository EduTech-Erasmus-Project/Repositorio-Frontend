import { upgradeToHttpsIfPageIsSecure } from "./secure-url.utils";

describe("upgradeToHttpsIfPageIsSecure", () => {
  const oaUrl =
    "http://repositorio.edutech-project.org/media/catalog/OA/website_index.html";

  it("cambia http por https cuando la pagina se sirve por https", () => {
    expect(upgradeToHttpsIfPageIsSecure(oaUrl, "https:")).toBe(
      "https://repositorio.edutech-project.org/media/catalog/OA/website_index.html"
    );
  });

  it("no modifica la url cuando la pagina se sirve por http", () => {
    expect(upgradeToHttpsIfPageIsSecure(oaUrl, "http:")).toBe(oaUrl);
  });

  it("respeta urls https, relativas y vacias", () => {
    expect(upgradeToHttpsIfPageIsSecure("https://example.com/a.html", "https:")).toBe(
      "https://example.com/a.html"
    );
    expect(upgradeToHttpsIfPageIsSecure("/media/catalog/OA/index.html", "https:")).toBe(
      "/media/catalog/OA/index.html"
    );
    expect(upgradeToHttpsIfPageIsSecure("", "https:")).toBe("");
    expect(upgradeToHttpsIfPageIsSecure(undefined, "https:")).toBe("");
  });

  it("acepta el esquema en mayusculas", () => {
    expect(upgradeToHttpsIfPageIsSecure("HTTP://example.com/a.html", "https:")).toBe(
      "https://example.com/a.html"
    );
  });
});
