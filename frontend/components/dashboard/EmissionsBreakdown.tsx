"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard } from "@/components/shared/ChartCard";
import { formatNumber } from "@/lib/utils";

const data = [
  { name: "Scope 1", value: 1.6, color: "hsl(var(--primary))" },
  { name: "Scope 2", value: 2.3, color: "hsl(var(--secondary))" },
  { name: "Scope 3", value: 4.0, color: "hsl(var(--accent))" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  const item = payload[0];
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
        <span className="font-semibold">{item.name}</span>
      </div>
      <p className="text-muted-foreground">{formatNumber(item.value)} tCO₂e</p>
      <p className="text-muted-foreground">{formatNumber((item.value / total) * 100)}%</p>
    </div>
  );
}

export function EmissionsBreakdown() {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard title="Distribución por Alcance" description="Abril 2026">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={750}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => (
              <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-2">
        <p className="text-2xl font-bold font-tabular">{formatNumber(total)}</p>
        <p className="text-xs text-muted-foreground">tCO₂e total</p>
      </div>
    </ChartCard>
  );
}
