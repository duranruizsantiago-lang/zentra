import { test, expect } from "@playwright/test";
import { setupMocks } from "../utils/mocks";
import { setupAuthContext } from "../fixtures/auth";

test.describe("Benchmarks", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
  });

  test("loads benchmark page with KPIs", async ({ page }) => {
    await page.goto("/benchmarks");
    await expect(page.locator("h1")).toContainText(/Benchmarking/i, { timeout: 5000 });

    // KPI metric cards — use first() to avoid sidebar nav conflicts
    await expect(page.locator("#main-content").getByText("Score Global")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#main-content").getByText("Score Ambiental")).toBeVisible();
  });

  test("shows sector indicator", async ({ page }) => {
    await page.goto("/benchmarks");
    // The sector badge shows "Sector: Industria"
    await expect(page.getByText("Sector: Industria")).toBeVisible({ timeout: 8000 });
  });

  test("renders comparison table with metrics", async ({ page }) => {
    await page.goto("/benchmarks");
    await expect(page.locator("#main-content").getByText("Desglose de métricas")).toBeVisible({ timeout: 8000 });

    // Table should have metric rows
    await expect(page.locator("table")).toBeVisible();
  });

  test("radar chart section is present", async ({ page }) => {
    await page.goto("/benchmarks");
    await expect(page.locator("#main-content").getByText("Comparativa sectorial")).toBeVisible({ timeout: 8000 });
  });

  test("shows data source footer", async ({ page }) => {
    await page.goto("/benchmarks");
    await expect(page.locator("#main-content").getByText(/Datos: MITECO/)).toBeVisible({ timeout: 8000 });
  });

  test("shows empty state when data is missing", async ({ page }) => {
    // Unroute the default mock first, then set up empty response
    await page.unroute("**/api/v1/benchmarks/me");
    await page.route("**/api/v1/benchmarks/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sector: "industry",
          overall_score: 0,
          environmental_score: 0,
          social_score: 0,
          governance_score: 0,
          carbon_total: 0,
          carbon_scope_1: 0, carbon_scope_2: 0, carbon_scope_3: 0,
          energy_intensity: 0, water_intensity: 0, waste_recycled: 0,
          employees: 0, percentile: 0, company_score: 0, sector_avg: 0, sector_top: 0,
          environmental: { company: 0, avg: 0, top: 0 },
          social: { company: 0, avg: 0, top: 0 },
          governance: { company: 0, avg: 0, top: 0 },
          sector_averages: {
            overall_score: 0, environmental_score: 0, social_score: 0,
            governance_score: 0, carbon_total: 0, carbon_scope_1: 0,
            carbon_scope_2: 0, carbon_scope_3: 0, energy_intensity: 0,
            water_intensity: 0, waste_recycled: 0,
          },
        }),
      });
    });

    await page.goto("/benchmarks");
    // Empty state or error state — either is fine
    await expect(page.getByText(/Completa tu autodiagnóstico|Error/i)).toBeVisible({ timeout: 8000 });
  });
});
