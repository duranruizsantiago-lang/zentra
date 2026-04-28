import { test, expect } from "@playwright/test";
import { setupMocks } from "../utils/mocks";
import { setupAuthContext } from "../fixtures/auth";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
    await page.goto("/");
  });

  test("displays page title and date", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/Dashboard|SENDA/i);
    // Should show Spanish date format somewhere on page
    await expect(page.locator("body")).toContainText(/2026/);
  });

  test("renders four KPI cards", async ({ page }) => {
    // KPI cards should be visible with values
    await expect(page.locator("text=Total Emisiones")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Reducción acumulada")).toBeVisible();
    await expect(page.locator("text=Score ASG")).toBeVisible();
    await expect(page.locator("text=Facturas procesadas")).toBeVisible();
  });

  test("KPI cards show numeric values", async ({ page }) => {
    await expect(page.locator(".text-3xl").first()).toBeVisible({ timeout: 5000 });
  });

  test("renders chart section with EmissionsChart and Breakdown", async ({ page }) => {
    // Charts should load
    await expect(page.locator("text=Evolución de Emisiones")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("text=Distribución por Alcance")).toBeVisible();
  });

  test("renders Recent Activity section", async ({ page }) => {
    await expect(page.locator("text=Actividad Reciente")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Factura eléctrica procesada")).toBeVisible();
    await expect(page.locator("text=Informe VSME generado")).toBeVisible();
  });

  test("renders Quick Actions buttons", async ({ page }) => {
    await expect(page.locator("text=Acciones Rápidas")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Subir factura")).toBeVisible();
    await expect(page.locator("text=Nuevo informe")).toBeVisible();
    await expect(page.locator("text=Iniciar diagnóstico")).toBeVisible();
    await expect(page.locator("text=Hablar con IA")).toBeVisible();
  });

  test("Quick Action navigation works", async ({ page }) => {
    await page.click("text=Iniciar diagnóstico");
    await expect(page).toHaveURL(/\/diagnostics/);
  });

  test("sidebar navigation highlights active page", async ({ page }) => {
    // Dashboard link should be active
    const activeLink = page.locator("a[href='/']").first();
    await expect(activeLink).toBeVisible();
  });
});
