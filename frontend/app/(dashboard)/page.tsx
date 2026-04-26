import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { TreePine, TrendingDown, Star, FileUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartCard } from "@/components/shared/ChartCard";

const EmissionsChart = dynamic(
  () => import("@/components/dashboard/EmissionsChart").then((m) => ({ default: m.EmissionsChart })),
  {
    ssr: false,
    loading: () => (
      <ChartCard title="Evolución de Emisiones" description="Últimos 12 meses — tCO₂e">
        <Skeleton className="h-[280px] w-full rounded-md" />
      </ChartCard>
    ),
  }
);

const EmissionsBreakdown = dynamic(
  () => import("@/components/dashboard/EmissionsBreakdown").then((m) => ({ default: m.EmissionsBreakdown })),
  {
    ssr: false,
    loading: () => (
      <ChartCard title="Distribución por Alcance" description="Cargando…">
        <Skeleton className="h-[280px] w-full rounded-md" />
      </ChartCard>
    ),
  }
);

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Panel principal de SENDA. Visualiza tus emisiones, score ASG y accede a todas las herramientas de sostenibilidad.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("es-ES", { dateStyle: "full" }).format(new Date())}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Emisiones"
          value="7.9"
          unit="tCO₂e"
          change={-8.2}
          changeLabel="vs mes anterior"
          icon={TreePine}
          trend="down"
          color="primary"
        />
        <KpiCard
          title="Reducción acumulada"
          value="12.5"
          unit="%"
          change={2.1}
          changeLabel="vs trimestre anterior"
          icon={TrendingDown}
          trend="up"
          color="secondary"
        />
        <KpiCard
          title="Score ASG"
          value="72"
          unit="/100"
          change={5}
          changeLabel="vs último diagnóstico"
          icon={Star}
          trend="up"
          color="accent"
        />
        <KpiCard
          title="Facturas procesadas"
          value="34"
          unit="este mes"
          change={13.3}
          changeLabel="vs mes anterior"
          icon={FileUp}
          trend="up"
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <EmissionsChart />
        </div>
        <div className="lg:col-span-2">
          <EmissionsBreakdown />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}
