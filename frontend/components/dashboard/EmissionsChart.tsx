"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "@/components/shared/ChartCard";
import { formatNumber } from "@/lib/utils";

const mockData = [
  { month: "May", scope1: 2.1, scope2: 3.4, scope3: 5.2 },
  { month: "Jun", scope1: 2.3, scope2: 3.1, scope3: 5.5 },
  { month: "Jul", scope1: 1.9, scope2: 2.9, scope3: 4.8 },
  { month: "Ago", scope1: 1.8, scope2: 2.7, scope3: 4.5 },
  { month: "Sep", scope1: 2.0, scope2: 3.0, scope3: 5.0 },
  { month: "Oct", scope1: 2.4, scope2: 3.3, scope3: 5.3 },
  { month: "Nov", scope1: 2.2, scope2: 3.2, scope3: 5.1 },
  { month: "Dic", scope1: 2.1, scope2: 2.8, scope3: 4.9 },
  { month: "Ene", scope1: 1.9, scope2: 2.6, scope3: 4.6 },
  { month: "Feb", scope1: 1.8, scope2: 2.5, scope3: 4.4 },
  { month: "Mar", scope1: 1.7, scope2: 2.4, scope3: 4.2 },
  { month: "Abr", scope1: 1.6, scope2: 2.3, scope3: 4.0 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{formatNumber(entry.value)} tCO₂e</span>
        </div>
      ))}
    </div>
  );
}

export function EmissionsChart() {
  return (
    <ChartCard title="Evolución de Emisiones" description="Últimos 12 meses — tCO₂e">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={mockData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
            formatter={(value) => (
              <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="scope1"
            name="Scope 1"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="scope2"
            name="Scope 2"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="scope3"
            name="Scope 3"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
