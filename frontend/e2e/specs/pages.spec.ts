import { test, expect } from "@playwright/test";
import { setupMocks } from "../utils/mocks";
import { setupAuthContext } from "../fixtures/auth";

test.describe("Feature Pages — Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
  });

  test("diagnostics page loads", async ({ page }) => {
    await page.goto("/diagnostics");
    await expect(page.locator("h1").first()).toContainText(/Autodiagnóstico/i, { timeout: 5000 });
  });

  test("carbon page loads", async ({ page }) => {
    await page.goto("/carbon");
    await expect(page.locator("h1").first()).toContainText(/Huella de Carbono/i, { timeout: 5000 });
  });

  test("invoices page loads", async ({ page }) => {
    await page.goto("/invoices");
    await expect(page.locator("h1").first()).toContainText(/Facturas/i, { timeout: 5000 });
  });

  test("reports page loads", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.locator("h1").first()).toContainText(/Informes/i, { timeout: 5000 });
  });

  test("marketplace page loads", async ({ page }) => {
    await page.goto("/marketplace");
    await expect(page.locator("h1").first()).toContainText(/Marketplace/i, { timeout: 5000 });
  });

  test("ai-chat page loads", async ({ page }) => {
    await page.goto("/ai-chat");
    await expect(page.locator("h1").first()).toContainText(/Asistente IA/i, { timeout: 5000 });
  });
});

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
    await page.goto("/");
  });

  const navRoutes = [
    { path: "/diagnostics" },
    { path: "/carbon" },
    { path: "/invoices" },
    { path: "/reports" },
    { path: "/benchmarks" },
    { path: "/marketplace" },
    { path: "/ai-chat" },
  ];

  for (const route of navRoutes) {
    test(`navigates to ${route.path} via sidebar`, async ({ page }) => {
      const link = page.locator(`a[href="${route.path}"]`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();
      await expect(page).toHaveURL(route.path, { timeout: 10000 });
    });
  }
});
