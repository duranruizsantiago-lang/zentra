"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/shared/ChartCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RadarDataPoint {
  metric: string;
  company: number;
  sector: number;
}

interface BenchmarkRadarProps {
  data: RadarDataPoint[];
  isLoading?: boolean;
}

export function BenchmarkRadar({ data, isLoading }: BenchmarkRadarProps) {
  return (
    <ChartCard
      title="Comparativa sectorial"
      description="Tu empresa vs. promedio del sector"
      isLoading={isLoading}
    >
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={data}
              margin={{ top: 0, right: 30, bottom: 0, left: 30 }}
            >
              <PolarGrid
                stroke="oklch(0.922 0.006 247.9)"
                className="dark:stroke-white/10"
              />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 5]}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <Radar
                name="Tu empresa"
                dataKey="company"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Radar
                name="Promedio sector"
                dataKey="sector"
                stroke="var(--chart-2)"
                fill="var(--chart-2)"
                fillOpacity={0.15}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                iconType="circle"
                iconSize={8}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
