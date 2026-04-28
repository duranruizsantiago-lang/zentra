import { test, expect } from "@playwright/test";
import { setupMocks } from "../utils/mocks";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test("hero section renders with CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/sostenibilidad/i, { timeout: 5000 });

    // Multiple "Empieza gratis" buttons — use first
    await expect(page.locator('text=Empieza gratis').first()).toBeVisible({ timeout: 5000 });
  });

  test("pricing section renders three tiers", async ({ page }) => {
    await page.goto("/");
    await page.locator("#pricing").scrollIntoViewIfNeeded();
    await expect(page.getByText("Inicio", { exact: true }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Pro", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Enterprise", { exact: true }).first()).toBeVisible();
  });

  test("features section renders feature cards", async ({ page }) => {
    await page.goto("/");
    await page.locator("#features").scrollIntoViewIfNeeded();
    await expect(page.getByText("Autodiagnóstico ASG").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Huella de Carbono").first()).toBeVisible();
    await expect(page.getByText("Informes VSME").first()).toBeVisible();
  });

  test("how it works section renders steps", async ({ page }) => {
    await page.goto("/");
    await page.locator("#how-it-works").scrollIntoViewIfNeeded();
    await expect(page.getByText("Evalúa").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Mide").first()).toBeVisible();
    await expect(page.getByText("Informa").first()).toBeVisible();
  });

  test("navigation links go to login and register", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.locator('header a:has-text("Iniciar sesión")');
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("register CTA goes to register page", async ({ page }) => {
    await page.goto("/");
    await page.locator('a:has-text("Empieza gratis")').first().click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("footer renders with copyright", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(page.locator("footer")).toContainText("SENDA");
    await expect(page.locator("footer")).toContainText("AGPL-3.0");
  });
});
