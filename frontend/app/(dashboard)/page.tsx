import type { Metadata } from "next";
import { TreePine, TrendingDown, Star, FileUp } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCards";
import { EmissionsChart } from "@/components/dashboard/EmissionsChart";
import { EmissionsBreakdown } from "@/components/dashboard/EmissionsBreakdown";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Panel principal de Zentra ESG. Visualiza tus emisiones, score ASG y accede a todas las herramientas de sostenibilidad.",
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
