"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Report } from "@/types/models";

const MOCK_REPORTS: Report[] = [
  {
    id: "rep-001",
    company_id: "c-001",
    title: "Informe VSME Q1 2026",
    standard: "VSME",
    status: "completed",
    period_start: "2026-01-01",
    period_end: "2026-03-31",
    pdf_url: "#",
    created_at: "2026-04-01T08:00:00Z",
    completed_at: "2026-04-01T08:05:00Z",
  },
  {
    id: "rep-002",
    company_id: "c-001",
    title: "Informe GRI Anual 2025",
    standard: "GRI",
    status: "generating",
    period_start: "2025-01-01",
    period_end: "2025-12-31",
    created_at: "2026-01-15T10:30:00Z",
  },
  {
    id: "rep-003",
    company_id: "c-001",
    title: "Evaluación TCFD",
    standard: "TCFD",
    status: "pending",
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    created_at: "2026-04-20T14:00:00Z",
  },
];

export function useReports(companyId?: string) {
  return useQuery({
    queryKey: ["reports", companyId],
    queryFn: async () => {
      try {
        const { data } = await api.get("/api/v1/reports");
        return data as Report[];
      } catch {
        return MOCK_REPORTS;
      }
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useReport(id?: string) {
  return useQuery({
    queryKey: ["reports", "detail", id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/v1/reports/${id}`);
        return data as Report;
      } catch {
        return MOCK_REPORTS.find((r) => r.id === id) ?? null;
      }
    },
    enabled: !!id,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      standard: Report["standard"];
      period_start: string;
      period_end: string;
    }) => {
      try {
        const { data } = await api.post("/api/v1/reports/generate", params);
        return data as Report;
      } catch {
        await new Promise((r) => setTimeout(r, 2000));
        return {
          id: `rep-${Date.now()}`,
          company_id: "c-001",
          title: params.title,
          standard: params.standard,
          status: "generating" as const,
          period_start: params.period_start,
          period_end: params.period_end,
          created_at: new Date().toISOString(),
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
