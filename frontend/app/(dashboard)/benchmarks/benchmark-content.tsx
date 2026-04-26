"use client";

import { useMemo, useEffect } from "react";
import {
  BarChart3,
  TreePine,
  Star,
  Zap,
  Recycle,
  AlertTriangle,
} from "lucide-react";
import { useMyBenchmark } from "@/hooks/useBenchmarks";
import { MetricCard } from "@/components/benchmarks/MetricCard";
import { BenchmarkRadar } from "@/components/benchmarks/BenchmarkRadar";
import { SectorComparisonTable } from "@/components/benchmarks/SectorComparisonTable";
import type { ComparisonRow } from "@/components/benchmarks/SectorComparisonTable";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";

function interpretScore(pct: number, metric: string): string {
  if (pct >= 75) return `Tu ${metric} está significativamente por encima del promedio sectorial.`;
  if (pct >= 60) return `Tu ${metric} está ligeramente por encima del promedio.`;
  if (pct >= 40) return `Tu ${metric} está en línea con el promedio del sector.`;
  if (pct >= 25) return `Tu ${metric} está por debajo del promedio. Hay margen de mejora.`;
  return `Tu ${metric} requiere atención prioritaria.`;
}

function computeComparisonRows(
  data: Awaited<ReturnType<typeof import("@/hooks/useBenchmarks").useMyBenchmark>["data"]>
): ComparisonRow[] {
  if (!data) return [];
  const avg = data.sector_averages;

  const calcPercentile = (company: number, sectorAvg: number, reverse = false) => {
    if (reverse) {
      const ratio = sectorAvg / Math.max(company, 0.01);
      return Math.min(95, Math.round(ratio * 50));
    }
    const ratio = company / Math.max(sectorAvg, 0.01);
    return Math.min(95, Math.round(ratio * 50));
  };

  return [
    {
      metric: "Score ASG Global",
      companyValue: data.overall_score,
      percentile: data.percentile,
      sectorAvg: avg.overall_score,
      interpretation: interpretScore(data.percentile, "puntuación global"),
      unit: "/100",
    },
    {
      metric: "Score Ambiental",
      companyValue: data.environmental_score,
      percentile: calcPercentile(data.environmental_score, avg.environmental_score),
      sectorAvg: avg.environmental_score,
      interpretation: interpretScore(
        calcPercentile(data.environmental_score, avg.environmental_score),
        "desempeño ambiental"
      ),
      unit: "/100",
    },
    {
      metric: "Score Social",
      companyValue: data.social_score,
      percentile: calcPercentile(data.social_score, avg.social_score),
      sectorAvg: avg.social_score,
      interpretation: interpretScore(
        calcPercentile(data.social_score, avg.social_score),
        "desempeño social"
      ),
      unit: "/100",
    },
    {
      metric: "Score Gobernanza",
      companyValue: data.governance_score,
      percentile: calcPercentile(data.governance_score, avg.governance_score),
      sectorAvg: avg.governance_score,
      interpretation: interpretScore(
        calcPercentile(data.governance_score, avg.governance_score),
        "desempeño en gobernanza"
      ),
      unit: "/100",
    },
    {
      metric: "Huella de Carbono Total",
      companyValue: data.carbon_total,
      percentile: calcPercentile(avg.carbon_total, data.carbon_total, true),
      sectorAvg: avg.carbon_total,
      interpretation:
        data.carbon_total < avg.carbon_total
          ? "Tu huella de carbono es menor que el promedio del sector. Buen trabajo."
          : "Tu huella de carbono supera el promedio sectorial. Prioriza la reducción.",
      unit: "tCO₂e",
    },
    {
      metric: "Intensidad Energética",
      companyValue: data.energy_intensity,
      percentile: calcPercentile(avg.energy_intensity, data.energy_intensity, true),
      sectorAvg: avg.energy_intensity,
      interpretation:
        data.energy_intensity < avg.energy_intensity
          ? "Eres más eficiente energéticamente que el promedio."
          : "Tu intensidad energética es superior al promedio. Considera medidas de eficiencia.",
      unit: "MWh/empleado",
    },
    {
      metric: "Consumo de Agua",
      companyValue: data.water_intensity,
      percentile: calcPercentile(avg.water_intensity, data.water_intensity, true),
      sectorAvg: avg.water_intensity,
      interpretation:
        data.water_intensity < avg.water_intensity
          ? "Tu consumo de agua por empleado está por debajo del promedio."
          : "Tu consumo de agua supera el promedio sectorial.",
      unit: "m³/empleado",
    },
    {
      metric: "Residuos Reciclados",
      companyValue: data.waste_recycled,
      percentile: calcPercentile(data.waste_recycled, avg.waste_recycled),
      sectorAvg: avg.waste_recycled,
      interpretation:
        data.waste_recycled > avg.waste_recycled
          ? "Superas la tasa de reciclaje promedio del sector."
          : "Tu tasa de reciclaje está por debajo del promedio. Aumenta la separación de residuos.",
      unit: "%",
    },
  ];
}

export function BenchmarkContent() {
  const {
    data: benchmark,
    isLoading,
    isError,
    error,
  } = useMyBenchmark();

  useEffect(() => {
    if (isError && error) {
      toast.error("No se pudieron cargar los datos de benchmarking");
    }
  }, [isError, error]);

  const radarData = useMemo(() => {
    if (!benchmark) return [];
    return [
      { metric: "Ambiental", company: benchmark.environmental.company, sector: benchmark.environmental.avg },
      { metric: "Social", company: benchmark.social.company, sector: benchmark.social.avg },
      { metric: "Gobernanza", company: benchmark.governance.company, sector: benchmark.governance.avg },
      { metric: "Carbono", company: 5 - benchmark.carbon_total / 6, sector: 5 - benchmark.sector_averages.carbon_total / 6 },
      { metric: "Energía", company: 5 - benchmark.energy_intensity * 5, sector: 5 - benchmark.sector_averages.energy_intensity * 5 },
      { metric: "Reciclaje", company: benchmark.waste_recycled / 20, sector: benchmark.sector_averages.waste_recycled / 20 },
    ];
  }, [benchmark]);

  const tableRows = useMemo(() => computeComparisonRows(benchmark), [benchmark]);

  if (isLoading) {
    return <BenchmarksSkeleton />;
  }

  if (isError || !benchmark) {
    return (
      <div className="flex items-center justify-center h-96">
        <EmptyState
          icon={AlertTriangle}
          title="Error al cargar datos"
          description="No se pudieron cargar los datos de benchmarking. Intenta de nuevo más tarde."
        />
      </div>
    );
  }

  const isEmpty =
    benchmark.overall_score === 0 &&
    benchmark.carbon_total === 0;

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-96">
        <EmptyState
          icon={BarChart3}
          title="Completa tu autodiagnóstico"
          description="Completa tu autodiagnóstico y calcula tu huella de carbono para ver tu posición en el sector."
          action={{
            label: "Ir a Autodiagnóstico",
            onClick: () => {
              window.location.href = "/diagnostics";
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sector indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Sector:{" "}
          <span className="font-semibold text-foreground capitalize">
            {benchmark.sector === "industry"
              ? "Industria"
              : benchmark.sector === "services"
                ? "Servicios"
                : benchmark.sector === "construction"
                  ? "Construcción"
                  : benchmark.sector}
          </span>
        </span>
        <span className="text-xs text-muted-foreground">
          · {benchmark.employees} empleados
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Score Global"
          value={benchmark.overall_score}
          unit="/100"
          percentile={benchmark.percentile}
          sectorAvg={benchmark.sector_averages.overall_score}
          icon={Star}
          color="accent"
        />
        <MetricCard
          title="Score Ambiental"
          value={benchmark.environmental_score}
          unit="/100"
          percentile={Math.round((benchmark.environmental_score / Math.max(benchmark.sector_averages.environmental_score, 0.01)) * 50)}
          sectorAvg={benchmark.sector_averages.environmental_score}
          icon={TreePine}
          color="primary"
        />
        <MetricCard
          title="Huella de Carbono"
          value={benchmark.carbon_total}
          unit="tCO₂e"
          percentile={Math.round((benchmark.sector_averages.carbon_total / Math.max(benchmark.carbon_total, 0.01)) * 50)}
          sectorAvg={benchmark.sector_averages.carbon_total}
          icon={Zap}
          color="destructive"
        />
        <MetricCard
          title="Residuos Reciclados"
          value={benchmark.waste_recycled}
          unit="%"
          percentile={Math.round((benchmark.waste_recycled / Math.max(benchmark.sector_averages.waste_recycled, 0.01)) * 50)}
          sectorAvg={benchmark.sector_averages.waste_recycled}
          icon={Recycle}
          color="secondary"
        />
      </div>

      {/* Radar chart */}
      <BenchmarkRadar data={radarData} />

      {/* Detailed table */}
      <SectorComparisonTable rows={tableRows} />

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pt-2 pb-4">
        Datos: MITECO, CEPYME 2025 · Basado en {benchmark.employees > 0 ? benchmark.employees : "N"} empleados
      </p>
    </div>
  );
}

function BenchmarksSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-44" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-64 w-full rounded-md" />
      </Card>

      <Card className="p-6">
        <Skeleton className="h-5 w-36 mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full mb-2" />
        ))}
      </Card>

      <Skeleton className="h-3 w-64 mx-auto" />
    </div>
  );
}
