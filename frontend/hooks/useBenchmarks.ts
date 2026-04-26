"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { BenchmarkData } from "@/types/models";

const MOCK_SECTORS: Record<string, BenchmarkData> = {
  industry: {
    sector: "industry",
    company_score: 2.8,
    sector_avg: 2.5,
    sector_top: 4.1,
    environmental: { company: 2.3, avg: 2.1, top: 4.0 },
    social: { company: 2.9, avg: 2.6, top: 4.3 },
    governance: { company: 3.2, avg: 2.8, top: 4.5 },
  },
  services: {
    sector: "services",
    company_score: 3.1,
    sector_avg: 2.7,
    sector_top: 4.3,
    environmental: { company: 2.5, avg: 2.2, top: 4.2 },
    social: { company: 3.2, avg: 2.8, top: 4.4 },
    governance: { company: 3.5, avg: 3.0, top: 4.6 },
  },
  construction: {
    sector: "construction",
    company_score: 2.2,
    sector_avg: 2.0,
    sector_top: 3.8,
    environmental: { company: 1.9, avg: 1.7, top: 3.6 },
    social: { company: 2.4, avg: 2.1, top: 4.0 },
    governance: { company: 2.4, avg: 2.2, top: 4.1 },
  },
};

const MOCK_MY_BENCHMARK: BenchmarkData & {
  carbon_total: number;
  carbon_scope_1: number;
  carbon_scope_2: number;
  carbon_scope_3: number;
  energy_intensity: number;
  water_intensity: number;
  waste_recycled: number;
  employees: number;
  percentile: number;
  overall_score: number;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  sector_averages: Record<string, number>;
} = {
  sector: "industry",
  company_score: 2.8,
  sector_avg: 2.5,
  sector_top: 4.1,
  overall_score: 72,
  environmental_score: 68,
  social_score: 74,
  governance_score: 78,
  carbon_total: 12.8,
  carbon_scope_1: 3.2,
  carbon_scope_2: 4.1,
  carbon_scope_3: 5.5,
  energy_intensity: 0.28,
  water_intensity: 2.1,
  waste_recycled: 64,
  employees: 42,
  percentile: 62,
  environmental: { company: 2.3, avg: 2.1, top: 4.0 },
  social: { company: 2.9, avg: 2.6, top: 4.3 },
  governance: { company: 3.2, avg: 2.8, top: 4.5 },
  sector_averages: {
    overall_score: 65,
    environmental_score: 58,
    social_score: 62,
    governance_score: 63,
    carbon_total: 15.2,
    carbon_scope_1: 4.8,
    carbon_scope_2: 5.6,
    carbon_scope_3: 7.1,
    energy_intensity: 0.35,
    water_intensity: 2.8,
    waste_recycled: 48,
  },
};

export function useMyBenchmark() {
  return useQuery({
    queryKey: ["benchmarks", "me"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/api/v1/benchmarks/me");
        return data as typeof MOCK_MY_BENCHMARK;
      } catch {
        return MOCK_MY_BENCHMARK;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useSectorBenchmark(sector?: string) {
  return useQuery({
    queryKey: ["benchmarks", "sector", sector],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/v1/benchmarks/${sector}`);
        return data as BenchmarkData;
      } catch {
        return (
          MOCK_SECTORS[sector || "industry"] ?? MOCK_SECTORS.industry
        );
      }
    },
    enabled: !!sector,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
