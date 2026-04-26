export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "member";
  company_id: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  size: "micro" | "small" | "medium";
  country: string;
  nif: string;
}

export interface DiagnosticQuestion {
  id: number;
  question: string;
  category: "environmental" | "social" | "governance";
  options: { text: string; score: number }[];
  weight?: number;
}

export interface DiagnosticResult {
  id: string;
  company_id: string;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  total_score: number;
  maturity_level: "inicial" | "en desarrollo" | "definido" | "avanzado" | "lider";
  recommendations: Recommendation[];
  completed_at: string;
}

export interface Recommendation {
  category: "environmental" | "social" | "governance";
  title: string;
  description: string;
  priority: "alta" | "media" | "baja";
}

export interface CarbonEntry {
  id: string;
  company_id: string;
  scope: 1 | 2 | 3;
  category: string;
  activity: string;
  amount: number;
  unit: string;
  co2e: number;
  date: string;
  source?: string;
  invoice_id?: string;
}

export interface CarbonFootprint {
  total_co2e: number;
  scope_1: number;
  scope_2: number;
  scope_3: number;
  period_start: string;
  period_end: string;
  trend: number;
  entries: CarbonEntry[];
}

export interface Invoice {
  id: string;
  company_id: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "error";
  supplier?: string;
  amount?: number;
  date?: string;
  co2e_extracted?: number;
  ocr_confidence?: number;
  uploaded_at: string;
}

export interface Report {
  id: string;
  company_id: string;
  title: string;
  standard: "VSME" | "GRI" | "TCFD" | "CSRD";
  status: "pending" | "generating" | "completed" | "error";
  period_start: string;
  period_end: string;
  pdf_url?: string;
  created_at: string;
  completed_at?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  created_at: string;
}

export interface ChatConversation {
  id: string;
  company_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface BenchmarkData {
  sector: string;
  company_score: number;
  sector_avg: number;
  sector_top: number;
  environmental: { company: number; avg: number; top: number };
  social: { company: number; avg: number; top: number };
  governance: { company: number; avg: number; top: number };
}

export interface MarketplaceService {
  id: string;
  title: string;
  provider: string;
  category: "certification" | "consulting" | "energy" | "offset" | "training";
  description: string;
  price_from?: number;
  rating: number;
  reviews_count: number;
  verified: boolean;
  tags: string[];
}
