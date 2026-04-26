"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PercentileGauge } from "./PercentileGauge";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  percentile: number;
  sectorAvg: number;
  icon: LucideIcon;
  color: "primary" | "secondary" | "accent" | "destructive";
  isLoading?: boolean;
}

const colorMap = {
  primary: { bg: "bg-primary/10", icon: "text-primary" },
  secondary: { bg: "bg-secondary/10", icon: "text-secondary" },
  accent: { bg: "bg-accent/10", icon: "text-accent" },
  destructive: { bg: "bg-destructive/10", icon: "text-destructive" },
};

function getComparisonLabel(pct: number): string {
  if (pct >= 75) return "Por encima del promedio";
  if (pct >= 50) return "En línea con el sector";
  return "Por debajo del promedio";
}

export function MetricCard({
  title,
  value,
  unit,
  percentile,
  sectorAvg,
  icon: Icon,
  color,
  isLoading,
}: MetricCardProps) {
  const colors = colorMap[color];
  const prefersReduced = useReducedMotion();

  if (isLoading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-10 w-10 rounded-full mb-3" />
        <Skeleton className="h-7 w-20 mb-1" />
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
      </Card>
    );
  }

  return (
    <motion.div whileHover={prefersReduced ? undefined : { y: -2 }} transition={{ duration: 0.15 }}>
      <Card className="p-5 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-0 flex flex-col items-center text-center">
          <div
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full mb-3",
              colors.bg
            )}
          >
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-tabular tracking-tight text-foreground">
              {value}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>

          <p className="text-sm text-muted-foreground mt-0.5">{title}</p>

          <div className="mt-3">
            <PercentileGauge value={percentile} size="sm" />
          </div>

          <div className="mt-2 space-y-0.5">
            <p className="text-xs text-muted-foreground">
              Promedio sector:{" "}
              <span className="font-semibold text-foreground">
                {sectorAvg} {unit}
              </span>
            </p>
            <p
              className={cn(
                "text-xs font-medium",
                percentile >= 75
                  ? "text-success"
                  : percentile >= 50
                    ? "text-warning"
                    : "text-destructive"
              )}
            >
              {getComparisonLabel(percentile)}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
