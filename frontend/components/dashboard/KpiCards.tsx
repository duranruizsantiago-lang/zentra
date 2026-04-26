"use client";

import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatPercentChange } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
  color: "primary" | "secondary" | "accent" | "destructive";
  isLoading?: boolean;
}

const colorMap = {
  primary: {
    bg: "bg-primary/10",
    icon: "text-primary",
    trend: { up: "text-destructive", down: "text-success", neutral: "text-muted-foreground" },
  },
  secondary: {
    bg: "bg-secondary/10",
    icon: "text-secondary",
    trend: { up: "text-destructive", down: "text-success", neutral: "text-muted-foreground" },
  },
  accent: {
    bg: "bg-accent/10",
    icon: "text-accent",
    trend: { up: "text-success", down: "text-destructive", neutral: "text-muted-foreground" },
  },
  destructive: {
    bg: "bg-destructive/10",
    icon: "text-destructive",
    trend: { up: "text-destructive", down: "text-success", neutral: "text-muted-foreground" },
  },
};

export function KpiCard({
  title,
  value,
  unit,
  change,
  changeLabel,
  icon: Icon,
  trend,
  color,
  isLoading,
}: KpiCardProps) {
  const colors = colorMap[color];
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const prefersReduced = useReducedMotion();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </Card>
    );
  }

  return (
    <motion.div whileHover={prefersReduced ? undefined : { y: -2 }} transition={{ duration: 0.15 }}>
      <Card className="p-6 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-0">
          <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-full mb-4", colors.bg)}>
            <Icon className={cn("h-6 w-6", colors.icon)} />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-tabular tracking-tight text-foreground">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-muted-foreground">{unit}</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-1">{title}</p>

          {change !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", colors.trend[trend])}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{formatPercentChange(change)}</span>
              {changeLabel && (
                <span className="text-muted-foreground font-normal">{changeLabel}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </Card>
      ))}
    </div>
  );
}
