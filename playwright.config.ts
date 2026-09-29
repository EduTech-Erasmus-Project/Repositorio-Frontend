import { mkdirSync } from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env["CI"];
const workspaceTempDir = path.join(__dirname, ".tmp");
const localNgCli = path.join(__dirname, "node_modules", ".bin", "ng.cmd");
const externalBaseUrl = process.env["PLAYWRIGHT_BASE_URL"];

mkdirSync(workspaceTempDir, { recursive: true });

process.env["TEMP"] = workspaceTempDir;
process.env["TMP"] = workspaceTempDir;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,
  reporter: "line",
  use: {
    // Cookie auth requiere que el origen de pruebas sea consistente con el
    // host del backend local (`localhost`) para evitar diferencias de sitio.
    baseURL: externalBaseUrl || "http://localhost:4202",
    browserName: "chromium",
    channel: "msedge",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "public-smoke",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `"${ localNgCli }" serve --host localhost --port 4202`,
        url: "http://localhost:4202",
        reuseExistingServer: !isCI,
        timeout: 180_000,
      },
});
