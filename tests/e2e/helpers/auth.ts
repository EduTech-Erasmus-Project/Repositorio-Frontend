import { Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type E2ERole =
  | "student"
  | "teacher"
  | "expert"
  | "admin"
  | "superuser";

type Credentials = {
  email: string;
  password: string;
};

type CredentialsFile = Partial<Record<E2ERole, Partial<Credentials>>>;

const ROLE_ENV_KEYS: Record<E2ERole, { email: string; password: string }> = {
  student: {
    email: "ROA_E2E_STUDENT_EMAIL",
    password: "ROA_E2E_STUDENT_PASSWORD",
  },
  teacher: {
    email: "ROA_E2E_TEACHER_EMAIL",
    password: "ROA_E2E_TEACHER_PASSWORD",
  },
  expert: {
    email: "ROA_E2E_EXPERT_EMAIL",
    password: "ROA_E2E_EXPERT_PASSWORD",
  },
  admin: {
    email: "ROA_E2E_ADMIN_EMAIL",
    password: "ROA_E2E_ADMIN_PASSWORD",
  },
  superuser: {
    email: "ROA_E2E_SUPERUSER_EMAIL",
    password: "ROA_E2E_SUPERUSER_PASSWORD",
  },
};

const ROLE_REDIRECTS: Record<E2ERole, RegExp> = {
  student: /\/#\/recommended(?:$|\?)/,
  teacher: /\/#\/settings\/my-objects(?:$|\?)/,
  expert: /\/#\/search(?:$|\?)/,
  admin: /\/#\/admin(?:\/home)?(?:$|\?)/,
  superuser: /\/#\/admin(?:\/home)?(?:$|\?)/,
};

const credentialsFilePath = resolve(
  process.cwd(),
  "tests/e2e/credentials.local.json"
);

let cachedCredentialsFile: CredentialsFile | null | undefined;

function loadCredentialsFile(): CredentialsFile | null {
  if (cachedCredentialsFile !== undefined) {
    return cachedCredentialsFile;
  }

  if (!existsSync(credentialsFilePath)) {
    cachedCredentialsFile = null;
    return cachedCredentialsFile;
  }

  try {
    const rawContent = readFileSync(credentialsFilePath, "utf-8").replace(
      /^\uFEFF/,
      ""
    );

    cachedCredentialsFile = JSON.parse(rawContent) as CredentialsFile;
    return cachedCredentialsFile;
  } catch {
    cachedCredentialsFile = null;
    return cachedCredentialsFile;
  }
}

export function getRoleCredentials(role: E2ERole): Credentials | null {
  const fileCredentials = loadCredentialsFile()?.[role];
  const fileEmail = fileCredentials?.email?.trim();
  const filePassword = fileCredentials?.password?.trim();

  if (fileEmail && filePassword) {
    return {
      email: fileEmail,
      password: filePassword,
    };
  }

  const keys = ROLE_ENV_KEYS[role];
  const email = process.env[keys.email]?.trim();
  const password = process.env[keys.password]?.trim();

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export function hasRoleCredentials(role: E2ERole): boolean {
  return !!getRoleCredentials(role);
}

export function getMissingCredentialsMessage(role: E2ERole): string {
  const keys = ROLE_ENV_KEYS[role];
  return `Se requieren credenciales para ${role}. Puedes definir ${keys.email}/${keys.password} o crear tests/e2e/credentials.local.json.`;
}

export async function loginAs(page: Page, role: E2ERole): Promise<void> {
  const credentials = getRoleCredentials(role);

  if (!credentials) {
    throw new Error(getMissingCredentialsMessage(role));
  }

  await page.goto("/#/login");
  await page.locator("input#email").fill(credentials.email);
  await page.locator("input#password").fill(credentials.password);
  await page.locator("form#loginForm button[type='submit']").click();
  await page.waitForURL(ROLE_REDIRECTS[role], { timeout: 30_000 });
}
