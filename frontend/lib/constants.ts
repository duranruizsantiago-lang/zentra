export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export const EMISSION_SCOPES = {
  SCOPE_1: "Scope 1 — Emisiones directas",
  SCOPE_2: "Scope 2 — Energía indirecta",
  SCOPE_3: "Scope 3 — Cadena de valor",
} as const;

export const ASG_CATEGORIES = {
  environmental: "Ambiental",
  social: "Social",
  governance: "Gobernanza",
} as const;

export const CATEGORY_COLORS = {
  environmental: "primary",
  social: "secondary",
  governance: "accent",
} as const;

export const REPORT_STANDARDS = ["VSME", "GRI", "TCFD", "CSRD"] as const;
