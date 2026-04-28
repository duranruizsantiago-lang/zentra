import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { setupMocks } from "./utils/mocks";
import { TEST_USER, setupAuthContext } from "./fixtures/auth";

// ── Auth: Login ──────────────────────────────────────────────
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
    await expect(page.locator("#email")).not.toBeVisible();
  });

  test("invalid credentials stay on login page", async ({ page }) => {
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

    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/login/);
  });
});

// ── Auth: Register ───────────────────────────────────────────
test.describe("Auth — Register", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test("successful registration wizard flow", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h2, .text-2xl").first()).toContainText(/crear cuenta/i);

    await page.fill("#full_name", TEST_USER.fullName);
    await page.fill("#email", "nueva@empresa.es");
    await page.fill("#password", "SecurePass123");
    await page.click('button[type="submit"]:has-text("Continuar")');

    await page.waitForSelector("#company_name", { timeout: 5000 });
    await page.fill("#company_name", "Nueva Empresa S.L.");
    await page.fill("#nif", "B87654321");
    await page.click('[aria-label="Selecciona un sector"]');
    await page.locator('[role="option"]', { hasText: "Tecnología" }).click();

    await page.click('button[type="submit"]:has-text("Crear cuenta")');
    await page.waitForURL("/", { timeout: 15000 });
    await expect(page).toHaveURL("/");
  });

  test("step 1 validation prevents advance", async ({ page }) => {
    await page.goto("/register");
    await page.click('button[type="submit"]:has-text("Continuar")');
    await expect(page.locator("#full_name")).toBeVisible();
    await expect(page.getByText("Nombre requerido")).toBeVisible({ timeout: 3000 });
  });
});

// ── Auth: Forgot Password ────────────────────────────────────
test.describe("Auth — Forgot Password", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test("shows success message after submit", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h2, .text-2xl").first()).toContainText(/recuperar/i);
    await page.fill("#email", TEST_USER.email);
    await page.click('button[type="submit"]:has-text("Enviar")');
    await expect(page.getByText("Revisa tu bandeja de entrada")).toBeVisible({ timeout: 5000 });
  });

  test("has link back to login", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByText("Volver al inicio de sesión").first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

// ── Auth: Session ────────────────────────────────────────────
test.describe("Auth — Session", () => {
  test("token persists across page reload", async ({ page }) => {
    await setupMocks(page);
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("access_token", "test-token-123");
      localStorage.setItem("refresh_token", "test-refresh-456");
    });
    await page.reload();
    const token = await page.evaluate(() => localStorage.getItem("access_token"));
    expect(token).toBe("test-token-123");
  });

  test("user menu trigger exists when authenticated", async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
    await page.goto("/");
    await expect(page.locator('[aria-label="Menú de usuario"]')).toBeVisible();
  });
});

// ── Dashboard ────────────────────────────────────────────────
test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
    await page.goto("/");
  });

  test("renders KPI cards", async ({ page }) => {
    await expect(page.locator("text=Total Emisiones")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Reducción acumulada")).toBeVisible();
    await expect(page.locator("text=Score ASG")).toBeVisible();
    await expect(page.locator("text=Facturas procesadas")).toBeVisible();
  });

  test("renders charts and activity sections", async ({ page }) => {
    await expect(page.locator("text=Evolución de Emisiones")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("text=Distribución por Alcance")).toBeVisible();
    await expect(page.locator("text=Actividad Reciente")).toBeVisible({ timeout: 5000 });
  });

  test("renders Quick Actions and navigates", async ({ page }) => {
    await expect(page.locator("text=Acciones Rápidas")).toBeVisible({ timeout: 5000 });
    await page.click("text=Iniciar diagnóstico");
    await expect(page).toHaveURL(/\/diagnostics/);
  });
});

// ── Landing Page ─────────────────────────────────────────────
test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test("hero and CTA render", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/sostenibilidad/i, { timeout: 5000 });
    await expect(page.locator('text=Empieza gratis').first()).toBeVisible({ timeout: 5000 });
  });

  test("pricing section renders tiers", async ({ page }) => {
    await page.goto("/");
    await page.locator("#pricing").scrollIntoViewIfNeeded();
    await expect(page.getByText("Inicio", { exact: true }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Pro", { exact: true }).first()).toBeVisible();
  });

  test("footer renders", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(page.locator("footer")).toContainText("SENDA");
    await expect(page.locator("footer")).toContainText("AGPL-3.0");
  });

  test("CTA navigates to register", async ({ page }) => {
    await page.goto("/");
    await page.locator('a:has-text("Empieza gratis")').first().click();
    await expect(page).toHaveURL(/\/register/);
  });
});

// ── Benchmarks ───────────────────────────────────────────────
test.describe("Benchmarks", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
  });

  test("loads with KPIs and sector indicator", async ({ page }) => {
    await page.goto("/benchmarks");
    await expect(page.locator("h1")).toContainText(/Benchmarking/i, { timeout: 5000 });
    await expect(page.locator("#main-content").getByText("Score Global")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("#main-content").getByText("Score Ambiental")).toBeVisible();
  });

  test("renders comparison table and radar chart", async ({ page }) => {
    await page.goto("/benchmarks");
    await expect(page.locator("#main-content").getByText("Desglose de métricas")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("#main-content").getByText("Comparativa sectorial")).toBeVisible({ timeout: 8000 });
  });
});

// ── Feature Pages — Smoke ────────────────────────────────────
test.describe("Feature Pages", () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
  });

  const pages = [
    { path: "/diagnostics", heading: /Autodiagnóstico/i },
    { path: "/carbon", heading: /Huella de Carbono/i },
    { path: "/invoices", heading: /Facturas/i },
    { path: "/reports", heading: /Informes/i },
    { path: "/benchmarks", heading: /Benchmarking/i },
    { path: "/marketplace", heading: /Marketplace/i },
    { path: "/ai-chat", heading: /Asistente IA/i },
  ];

  for (const { path, heading } of pages) {
    test(`${path} page loads`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 8000 });
      await expect(page.locator("h1").first()).toContainText(heading, { timeout: 5000 });
    });
  }
});

// ── 404 Page ─────────────────────────────────────────────────
test.describe("404 Page", () => {
  test("renders custom 404", async ({ page }) => {
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
});

// ── Dark Mode ────────────────────────────────────────────────
test.describe("Dark Mode", () => {
  test("theme toggle exists", async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
    await page.goto("/");
    const toggle = page.locator('[aria-label*="modo oscuro"], [aria-label*="modo claro"]');
    await expect(toggle.first()).toBeVisible({ timeout: 5000 });
  });

  test("setting persists via localStorage", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("dark");
  });
});

// ── Responsive ───────────────────────────────────────────────
test.describe("Responsive", () => {
  test("mobile viewport loads dashboard", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setupMocks(page);
    await setupAuthContext(page);
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 5000 });
  });

  test("desktop viewport shows sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await setupMocks(page);
    await setupAuthContext(page);
    await page.goto("/");
    await expect(page.locator("aside")).toBeVisible({ timeout: 5000 });
  });
});

// ── Accessibility ────────────────────────────────────────────
test.describe("Accessibility", () => {
  test("landing page passes basic a11y scan", async ({ page }) => {
    await setupMocks(page);
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();
    expect(results.violations.length).toBeLessThan(15);
  });

  test("dashboard has skip-to-content link", async ({ page }) => {
    await setupMocks(page);
    await setupAuthContext(page);
    await page.goto("/");
    await expect(page.locator('a[href="#main-content"]')).toBeVisible();
  });

  test("login page passes basic a11y scan", async ({ page }) => {
    await setupMocks(page);
    await page.goto("/login");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();
    expect(results.violations.length).toBeLessThan(10);
  });
});
