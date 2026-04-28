import type { Page } from "@playwright/test";

export const TEST_USER = {
  email: "test@empresa.es",
  password: "SecurePass123",
  fullName: "Maria Garcia",
  companyName: "Test Company S.L.",
};

const MOCK_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJjb21wYW55X2lkIjoidGVzdC1jb21wYW55LWlkIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock";

export async function login(page: Page) {
  await page.goto("/login");
  await page.waitForSelector("#email", { timeout: 5000 });
  await page.fill("#email", TEST_USER.email);
  await page.fill("#password", TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/", { timeout: 15000 });
}

export async function register(
  page: Page,
  overrides?: { email?: string; companyName?: string }
) {
  await page.goto("/register");
  await page.waitForSelector("#full_name", { timeout: 5000 });
  await page.fill("#full_name", TEST_USER.fullName);
  await page.fill("#email", overrides?.email || TEST_USER.email);
  await page.fill("#password", TEST_USER.password);
  await page.click('button[type="submit"]:has-text("Continuar")');

  // Step 2: company data
  await page.waitForSelector("#company_name", { timeout: 5000 });
  await page.fill("#company_name", overrides?.companyName || TEST_USER.companyName);
  await page.fill("#nif", "B12345678");

  // Select sector
  await page.click('[aria-label="Selecciona un sector"]');
  await page.locator('[role="option"]', { hasText: "Servicios profesionales" }).click();

  // Submit step 2
  await page.click('button[type="submit"]:has-text("Crear cuenta")');
  await page.waitForURL("/", { timeout: 15000 });
}

export async function setupAuthContext(page: Page) {
  // Must navigate to a page first so localStorage is accessible
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  await page.evaluate((token) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", "mock-refresh-token");
  }, MOCK_JWT);
}

export async function logout(page: Page) {
  // Open user menu and click logout
  await page.click('[aria-label="Menú de usuario"]');
  await page.locator('[role="menuitem"]', { hasText: "Cerrar sesión" }).click();
}
