import type { Page, Route } from "@playwright/test";

interface MockOptions {
  plan?: "freemium" | "pro" | "enterprise";
  diagnosticsDone?: boolean;
}

const MOCK_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJjb21wYW55X2lkIjoidGVzdC1jb21wYW55LWlkIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock";

const MOCK_USER = {
  id: "test-user-id",
  email: "test@empresa.es",
  full_name: "María García",
  company_id: "test-company-id",
};

const MOCK_COMPANY = {
  id: "test-company-id",
  name: "Test Company S.L.",
  nif: "B12345678",
  sector: "industry",
  size: "small",
  employees: 42,
  plan: "freemium",
};

const MOCK_DIAGNOSTIC_QUESTIONS = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `env-${i + 1}`,
    question: `Pregunta ambiental ${i + 1}: ¿Cómo gestiona tu empresa el aspecto ambiental ${i + 1}?`,
    category: "environmental",
    options: ["No implementado", "En desarrollo", "Implementado", "Líder sectorial"],
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `soc-${i + 1}`,
    question: `Pregunta social ${i + 1}: ¿Cómo gestiona tu empresa el aspecto social ${i + 1}?`,
    category: "social",
    options: ["No implementado", "En desarrollo", "Implementado", "Líder sectorial"],
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `gov-${i + 1}`,
    question: `Pregunta gobernanza ${i + 1}: ¿Cómo gestiona tu empresa el aspecto de gobernanza ${i + 1}?`,
    category: "governance",
    options: ["No implementado", "En desarrollo", "Implementado", "Líder sectorial"],
  })),
];

const MOCK_DIAGNOSTIC_RESULT = {
  id: "diag-result-1",
  overall_score: 72,
  environmental_score: 68,
  social_score: 74,
  governance_score: 78,
  category_scores: { environmental: 68, social: 74, governance: 78 },
  gap_analysis: ["Mejorar gestión de residuos", "Formalizar política de diversidad"],
  recommended_actions: ["Implementar ISO 14001", "Crear comité de sostenibilidad"],
  completed: true,
  created_at: new Date().toISOString(),
};

const MOCK_CARBON_ENTRIES = [
  { id: "carbon-1", scope: 1, source: "Gas natural", amount: 2.1, unit: "tCO₂e", created_at: new Date().toISOString() },
  { id: "carbon-2", scope: 2, source: "Electricidad", amount: 3.4, unit: "tCO₂e", created_at: new Date().toISOString() },
  { id: "carbon-3", scope: 3, source: "Transporte", amount: 5.2, unit: "tCO₂e", created_at: new Date().toISOString() },
];

const MOCK_INVOICES = [
  {
    id: "inv-1",
    filename: "factura-iberdrola-marzo.pdf",
    provider: "Iberdrola",
    amount: 1250.5,
    currency: "EUR",
    is_processed: true,
    is_ocr_processed: true,
    ocr_data: { energy_type: "electricity", consumption_kwh: 4500, period: "Marzo 2026" },
    carbon_entry_id: "carbon-2",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "inv-2",
    filename: "factura-naturgy-febrero.pdf",
    provider: "Naturgy",
    amount: 890.3,
    currency: "EUR",
    is_processed: false,
    is_ocr_processed: false,
    ocr_data: null,
    carbon_entry_id: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const MOCK_REPORTS = [
  {
    id: "report-1",
    title: "Informe VSME T1 2026",
    type: "vsme_basic",
    language: "es",
    status: "completed",
    file_url: "/api/v1/reports/report-1/download",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "report-2",
    title: "Informe VSME T2 2026",
    type: "vsme_complete",
    language: "es",
    status: "generating",
    file_url: null,
    created_at: new Date().toISOString(),
  },
];

const MOCK_CHATS = [
  {
    id: "chat-1",
    title: "¿Qué es VSME?",
    messages: [
      { role: "user", content: "¿Qué es VSME?" },
      {
        role: "assistant",
        content:
          "VSME (Voluntary Sustainability Reporting Standard for Non-Listed SMEs) es el estándar europeo de reporte de sostenibilidad para PYMEs no cotizadas, desarrollado por EFRAG.",
        sources: [{ title: "EFRAG VSME Standard", url: "https://efrag.org/vsme" }],
      },
    ],
    created_at: new Date().toISOString(),
  },
];

const MOCK_MARKETPLACE_SERVICES = [
  { id: "svc-1", name: "EcoAudit Consulting", category: "consulting", description: "Consultoría de sostenibilidad", verified: true, rating: 4.8 },
  { id: "svc-2", name: "SolarPro Instalaciones", category: "energy", description: "Instalación de paneles solares", verified: true, rating: 4.5 },
  { id: "svc-3", name: "GreenCert Auditoría", category: "certification", description: "Certificación ISO 14001", verified: true, rating: 4.9 },
  { id: "svc-4", name: "ResiduoZero Gestión", category: "waste", description: "Gestión de residuos industriales", verified: false, rating: 4.2 },
];

const MOCK_BENCHMARKS_ME = {
  sector: "industry",
  results: [
    { metric: "overall_score", company_value: 72, percentile: 65, sector_average: 65, interpretation: "Por encima del promedio" },
    { metric: "environmental_score", company_value: 68, percentile: 58, sector_average: 58, interpretation: "En el promedio" },
    { metric: "social_score", company_value: 74, percentile: 72, sector_average: 62, interpretation: "Por encima del promedio" },
    { metric: "governance_score", company_value: 78, percentile: 70, sector_average: 63, interpretation: "Por encima del promedio" },
    { metric: "total_carbon", company_value: 12.5, percentile: 40, sector_average: 15.0, interpretation: "En el promedio" },
  ],
};

const MOCK_BENCHMARK_SECTORS = ["industry", "services", "construction", "retail", "hospitality"];
const MOCK_SUBSCRIPTION = { plan: "freemium", usage: { diagnostics: 1, reports: 1, ai_queries: 3 }, limits: { diagnostics: 1, reports: 1, ai_queries: 5 } };

function jsonRoute(handler: (route: Route, body: unknown, url: URL) => unknown) {
  return async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body: unknown = null;
    try {
      body = JSON.parse(request.postData() || "{}");
    } catch { /* no body */ }
    const result = handler(route, body, url);
    if (result !== undefined) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(result),
      });
    }
  };
}

export function mockBackend(page: Page, options: MockOptions = {}) {
  const plan = options.plan || "freemium";

  // Auth routes
  page.route("**/api/v1/auth/login", jsonRoute((_route, body: any) => ({
    access_token: MOCK_JWT,
    refresh_token: "mock-refresh-token",
    user: MOCK_USER,
    company: MOCK_COMPANY,
  })));

  page.route("**/api/v1/auth/register", jsonRoute((_route, body: any) => ({
    access_token: MOCK_JWT,
    refresh_token: "mock-refresh-token",
    user: { ...MOCK_USER, email: body?.email || MOCK_USER.email },
    company: { ...MOCK_COMPANY, name: body?.company_name || MOCK_COMPANY.name },
  })));

  page.route("**/api/v1/auth/refresh", jsonRoute(() => ({
    access_token: MOCK_JWT,
  })));

  page.route("**/api/v1/auth/forgot-password", jsonRoute(() => ({
    message: "Email sent if account exists",
  })));

  page.route("**/api/v1/auth/me", jsonRoute(() => ({
    ...MOCK_USER,
    company: MOCK_COMPANY,
  })));

  // Company routes
  page.route("**/api/v1/companies/me", jsonRoute(() => MOCK_COMPANY));

  // Diagnostics routes
  page.route("**/api/v1/diagnostics/questions", jsonRoute(() => MOCK_DIAGNOSTIC_QUESTIONS));

  page.route("**/api/v1/diagnostics/submit", jsonRoute(() => MOCK_DIAGNOSTIC_RESULT));

  page.route("**/api/v1/diagnostics/results", jsonRoute(() => [MOCK_DIAGNOSTIC_RESULT]));

  // Carbon routes
  page.route("**/api/v1/carbon/**", (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: `carbon-${Date.now()}`,
          scope: 1,
          source: "Manual entry",
          amount: 1.5,
          unit: "tCO₂e",
          created_at: new Date().toISOString(),
        }),
      });
    }
    if (url.pathname.includes("/carbon/") && url.pathname.split("/").length > 4) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_CARBON_ENTRIES[0]) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_CARBON_ENTRIES) });
  });

  // Invoices routes
  page.route("**/api/v1/invoices/**", (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());
    const pathParts = url.pathname.split("/");
    const invoiceId = pathParts[pathParts.length - 1];

    if (method === "DELETE") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ deleted: true }) });
    }
    if (method === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: `inv-${Date.now()}`,
          filename: "uploaded-factura.pdf",
          provider: "Unknown",
          amount: 500,
          currency: "EUR",
          is_processed: false,
          is_ocr_processed: false,
          created_at: new Date().toISOString(),
        }),
      });
    }
    if (invoiceId && invoiceId !== "invoices") {
      const inv = MOCK_INVOICES.find((i) => i.id === invoiceId);
      return route.fulfill({ status: inv ? 200 : 404, contentType: "application/json", body: JSON.stringify(inv || { detail: "Not found" }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_INVOICES) });
  });

  // Reports routes
  page.route("**/api/v1/reports/**", (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    if (url.pathname.includes("/generate")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "report-new",
          title: "Nuevo Informe VSME",
          type: "vsme_basic",
          language: "es",
          status: "generating",
          file_url: null,
          created_at: new Date().toISOString(),
        }),
      });
    }
    if (url.pathname.includes("/download")) {
      return route.fulfill({
        status: 200,
        contentType: "application/pdf",
        headers: { "content-disposition": 'attachment; filename="informe.pdf"' },
        body: Buffer.from("%PDF-1.4 mock"),
      });
    }
    if (method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_REPORTS) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_REPORTS) });
  });

  // AI Chat routes
  page.route("**/api/v1/ai/chat/**", (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());
    const pathParts = url.pathname.split("/");
    const chatId = pathParts[pathParts.length - 1];

    if (method === "DELETE") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ deleted: true }) });
    }
    if (method === "POST" && url.pathname.endsWith("/chat")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: `chat-${Date.now()}`,
          title: "Nueva conversación",
          messages: [{
            role: "assistant",
            content: "VSME es el estándar voluntario de reporte de sostenibilidad para PYMEs no cotizadas de la UE.",
            sources: [{ title: "EFRAG VSME", url: "https://efrag.org" }],
          }],
          created_at: new Date().toISOString(),
        }),
      });
    }
    if (chatId && chatId !== "chat") {
      const chat = MOCK_CHATS.find((c) => c.id === chatId);
      return route.fulfill({ status: chat ? 200 : 404, contentType: "application/json", body: JSON.stringify(chat || { detail: "Not found" }) });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_CHATS) });
  });

  // Marketplace routes
  page.route("**/api/v1/marketplace/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/contact")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "Contact request sent" }) });
    }
    const category = url.searchParams.get("category");
    let services = MOCK_MARKETPLACE_SERVICES;
    if (category) services = services.filter((s) => s.category === category);
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(services) });
  });

  // Subscriptions routes
  page.route("**/api/v1/subscriptions/me", jsonRoute(() => ({
    plan,
    usage: { diagnostics: plan === "freemium" ? 1 : 100, reports: 1, ai_queries: 3 },
    limits: { diagnostics: plan === "freemium" ? 1 : 999, reports: 5, ai_queries: 10 },
  })));

  // Benchmarks routes
  page.route("**/api/v1/benchmarks/sectors", jsonRoute(() => MOCK_BENCHMARK_SECTORS));
  page.route("**/api/v1/benchmarks/me", jsonRoute(() => MOCK_BENCHMARKS_ME));
  page.route("**/api/v1/benchmarks/*", jsonRoute(() => MOCK_BENCHMARKS_ME));
}

export async function setupMocks(page: Page, options?: MockOptions) {
  // Always use mocks since the backend may not be running
  mockBackend(page, options);
  return { backendAvailable: false };
}

export { MOCK_JWT, MOCK_USER, MOCK_COMPANY };
