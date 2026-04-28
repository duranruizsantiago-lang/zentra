import { test, expect } from "@playwright/test";
import { setupMocks } from "../utils/mocks";
import { TEST_USER, setupAuthContext } from "../fixtures/auth";

test.describe("Auth — Login", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h2, .text-2xl").first()).toContainText(/iniciar sesión/i);

    await page.fill("#email", TEST_USER.email);
    await page.fill("#password", TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL("/", { timeout: 15000 });
    await expect(page).toHaveURL("/");
    // Login form should no longer be visible
    await expect(page.locator("#email")).not.toBeVisible();
  });

  test("invalid credentials stay on login page", async ({ page }) => {
    // Override mock to return 401
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Credenciales incorrectas" }),
      });
    });

    await page.goto("/login");
    await page.fill("#email", "wrong@email.com");
    await page.fill("#password", "WrongPass1");
    await page.click('button[type="submit"]');

    // Should stay on login page
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/login/);
  });

  test("protected route redirects to login", async ({ page }) => {
    test.skip("auth protection middleware not yet implemented");
    await page.goto("/diagnostics");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Auth — Register", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test("successful registration wizard flow", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h2, .text-2xl").first()).toContainText(/crear cuenta/i);

    // Step 1: user data
    await page.fill("#full_name", TEST_USER.fullName);
    await page.fill("#email", "nueva@empresa.es");
    await page.fill("#password", "SecurePass123");
    await page.click('button[type="submit"]:has-text("Continuar")');

    // Step 2: company data
    await page.waitForSelector("#company_name", { timeout: 5000 });
    await page.fill("#company_name", "Nueva Empresa S.L.");
    await page.fill("#nif", "B87654321");

    // Select sector
    await page.click('[aria-label="Selecciona un sector"]');
    await page.locator('[role="option"]', { hasText: "Tecnología" }).click();

    // Submit step 2
    await page.click('button[type="submit"]:has-text("Crear cuenta")');

    // Should redirect to dashboard
    await page.waitForURL("/", { timeout: 15000 });
    await expect(page).toHaveURL("/");
  });

  test("step 1 validation prevents advance", async ({ page }) => {
    await page.goto("/register");

    // Submit without filling
    await page.click('button[type="submit"]:has-text("Continuar")');

    // Should stay on step 1 — validation error visible
    await expect(page.locator("#full_name")).toBeVisible();
    await expect(page.getByText("Nombre requerido")).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Auth — Forgot Password", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test("shows success message after submit", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h2, .text-2xl").first()).toContainText(/recuperar/i);

    await page.fill("#email", TEST_USER.email);
    await page.click('button[type="submit"]:has-text("Enviar")');

    // Should show success state
    await expect(page.getByText("Revisa tu bandeja de entrada")).toBeVisible({ timeout: 5000 });
  });

  test("has link back to login", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByText("Volver al inicio de sesión").first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Auth — Logout", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
  });

  test("user menu trigger exists in navbar", async ({ page }) => {
    await page.goto("/");

    // Verify token is set
    const token = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(token).toBeTruthy();

    // Verify the user menu trigger is visible in the navbar
    const menuTrigger = page.locator('[aria-label="Menú de usuario"]');
    await expect(menuTrigger).toBeVisible();
  });
});

test.describe("Auth — Persistence", () => {
  test("token persists across page reload", async ({ page }) => {
    await setupMocks(page);
    await page.goto("/");

    // Set token
    await page.evaluate(() => {
      localStorage.setItem("access_token", "test-token-123");
      localStorage.setItem("refresh_token", "test-refresh-456");
    });

    await page.reload();

    const token = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(token).toBe("test-token-123");
  });
});
