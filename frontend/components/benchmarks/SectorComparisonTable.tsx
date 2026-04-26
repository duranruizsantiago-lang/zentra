"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export interface ComparisonRow {
  metric: string;
  companyValue: number;
  percentile: number;
  sectorAvg: number;
  interpretation: string;
  unit: string;
}

interface SectorComparisonTableProps {
  rows: ComparisonRow[];
  isLoading?: boolean;
}

function getPercentileColor(pct: number): string {
  if (pct >= 75) return "text-success";
  if (pct >= 50) return "text-warning";
  return "text-destructive";
}

function getTrendIcon(pct: number) {
  if (pct >= 65) return TrendingUp;
  if (pct >= 35) return Minus;
  return TrendingDown;
}

export function SectorComparisonTable({
  rows,
  isLoading,
}: SectorComparisonTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Desglose de métricas</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Métrica
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Valor Empresa
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Percentil
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Promedio Sector
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Interpretación
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const TrendIcon = getTrendIcon(row.percentile);
                  return (
                    <tr
                      key={row.metric}
                      className={cn(
                        "border-b border-border transition-colors hover:bg-muted/20",
                        i === rows.length - 1 && "border-b-0"
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.metric}
                      </td>
                      <td className="px-4 py-3 text-right font-tabular font-semibold text-foreground">
                        {row.companyValue}
                        <span className="text-muted-foreground font-normal text-xs ml-0.5">
                          {row.unit}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-tabular font-semibold",
                          getPercentileColor(row.percentile)
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          <TrendIcon className="h-3.5 w-3.5" />
                          {row.percentile}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-tabular text-muted-foreground">
                        {row.sectorAvg}{" "}
                        <span className="text-xs">{row.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {row.interpretation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
