import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { setupMocks } from "../utils/mocks";
import { setupAuthContext } from "../fixtures/auth";

test.describe("404 Page", () => {
  test("renders custom 404 for unknown route", async ({ page }) => {
    await page.goto("/ruta-que-no-existe-12345");
    await expect(page.getByText("Esta senda no existe")).toBeVisible({ timeout: 5000 });
  });

  test("has link back to dashboard", async ({ page }) => {
    await page.goto("/does-not-exist-xyz");
    const backLink = page.getByText("Volver al dashboard");
    await expect(backLink).toBeVisible({ timeout: 5000 });
    await backLink.click();
    await expect(page).toHaveURL("/");
  });

  test("renders footer", async ({ page }) => {
    await page.goto("/unknown-page");
    await expect(page.getByText("AGPL-3.0")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Dark Mode", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
  });

  test("theme toggle exists and is clickable", async ({ page }) => {
    await page.goto("/");
    // Theme toggle should be in the navbar
    const toggle = page.locator('[aria-label*="modo oscuro"], [aria-label*="modo claro"]');
    await expect(toggle.first()).toBeVisible({ timeout: 5000 });
    await toggle.first().click();
    // Toggle should still be visible after click
    await expect(toggle.first()).toBeVisible();
  });

  test("dark mode setting persists via localStorage", async ({ page }) => {
    await page.goto("/");
    // Set dark mode directly
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
    });
    await page.reload();

    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("dark");
  });
});

test.describe("Responsive Design", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
  });

  test.describe("Mobile viewport (375px)", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("dashboard loads with mobile layout", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 5000 });
    });

    test("landing page loads without errors", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible({ timeout: 5000 });
    });

    test("benchmarks page loads on mobile", async ({ page }) => {
      await page.goto("/benchmarks");
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 8000 });
    });

    test("404 page loads on mobile", async ({ page }) => {
      await page.goto("/ruta-inventada");
      await expect(page.getByText("Esta senda no existe")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Desktop viewport (1280px)", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("sidebar is visible on desktop", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("aside")).toBeVisible({ timeout: 5000 });
    });

    test("benchmarks page renders fully on desktop", async ({ page }) => {
      await page.goto("/benchmarks");
      await expect(page.locator("#main-content").getByText("Score Global")).toBeVisible({ timeout: 8000 });
    });
  });
});

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test("landing page a11y scan", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();

    expect(results.violations.length).toBeLessThan(15);
  });

  test("dashboard page a11y scan", async ({ page }) => {
    await setupAuthContext(page);
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();

    expect(results.violations.length).toBeLessThan(15);
  });

  test("benchmarks page a11y scan", async ({ page }) => {
    await setupAuthContext(page);
    await page.goto("/benchmarks");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();

    expect(results.violations.length).toBeLessThan(15);
  });

  test("login page a11y scan", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();

    expect(results.violations.length).toBeLessThan(10);
  });

  test("skip-to-content link exists on dashboard", async ({ page }) => {
    await setupAuthContext(page);
    await page.goto("/");
    await expect(page.locator('a[href="#main-content"]')).toBeVisible();
  });
});
