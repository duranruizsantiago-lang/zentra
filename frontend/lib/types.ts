export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceScore {
  framework: string;
  score: number;
  pass: number;
  fail: number;
  warn: number;
  manual: number;
  total: number;
}

export interface DashboardData {
  organization: Organization;
  scores: ComplianceScore[];
  total_evidence: number;
  connectors: number;
}

export interface Connector {
  id: string;
  organization_id: string;
  name: string;
  type: "gcp" | "aws" | "azure";
  status: string;
  last_scan_at: string | null;
  created_at: string;
}

export interface Control {
  id: string;
  framework: string;
  category: string;
  code: string;
  title: string;
  description: string;
  severity: string;
}

export interface Evidence {
  id: string;
  control_id: string;
  connector_id: string;
  resource: string;
  status: "pass" | "fail" | "warn" | "manual";
  finding: string;
  collected_at: string;
}
