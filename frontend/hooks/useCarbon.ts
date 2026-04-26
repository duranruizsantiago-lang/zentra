"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { CarbonFootprint, CarbonEntry } from "@/types/models";

const MOCK_FOOTPRINT: CarbonFootprint = {
  total_co2e: 12.8,
  scope_1: 3.2,
  scope_2: 4.1,
  scope_3: 5.5,
  period_start: "2026-01-01",
  period_end: "2026-04-26",
  trend: -8.2,
  entries: [
    {
      id: "entry-1",
      company_id: "c-001",
      scope: 1,
      category: "Combustibles",
      activity: "Gasóleo calefacción",
      amount: 1200,
      unit: "litros",
      co2e: 3.2,
      date: "2026-03-15",
    },
    {
      id: "entry-2",
      company_id: "c-001",
      scope: 2,
      category: "Electricidad",
      activity: "Consumo oficina",
      amount: 8500,
      unit: "kWh",
      co2e: 4.1,
      date: "2026-03-10",
      invoice_id: "inv-004",
    },
    {
      id: "entry-3",
      company_id: "c-001",
      scope: 3,
      category: "Transporte",
      activity: "Viajes de negocio",
      amount: 3200,
      unit: "km",
      co2e: 2.1,
      date: "2026-02-28",
    },
    {
      id: "entry-4",
      company_id: "c-001",
      scope: 3,
      category: "Compras",
      activity: "Material oficina",
      amount: 450,
      unit: "kg",
      co2e: 3.4,
      date: "2026-02-15",
    },
  ],
};

export function useCarbonFootprint(companyId?: string) {
  return useQuery({
    queryKey: ["carbon", "footprint", companyId],
    queryFn: async () => {
      try {
        const { data } = await api.get("/api/v1/carbon/footprint");
        return data as CarbonFootprint;
      } catch {
        return MOCK_FOOTPRINT;
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCarbonEntries(filters?: { scope?: number; start?: string; end?: string }) {
  return useQuery({
    queryKey: ["carbon", "entries", filters],
    queryFn: async () => {
      try {
        const { data } = await api.get("/api/v1/carbon/entries", { params: filters });
        return data as CarbonEntry[];
      } catch {
        return MOCK_FOOTPRINT.entries.filter(
          (e) => !filters?.scope || e.scope === filters.scope
        );
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCarbonEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<CarbonEntry, "id" | "company_id">) => {
      try {
        const { data } = await api.post("/api/v1/carbon/entries", entry);
        return data as CarbonEntry;
      } catch {
        await new Promise((r) => setTimeout(r, 500));
        return { ...entry, id: `entry-${Date.now()}`, company_id: "c-001" } as CarbonEntry;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carbon"] });
    },
  });
}
