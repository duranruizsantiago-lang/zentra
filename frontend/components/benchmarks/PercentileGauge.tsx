"use client";

import { cn } from "@/lib/utils";

interface PercentileGaugeProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: { outer: "h-16 w-16", text: "text-sm", strokeW: 4 },
  md: { outer: "h-24 w-24", text: "text-lg", strokeW: 5 },
  lg: { outer: "h-32 w-32", text: "text-2xl", strokeW: 6 },
};

function getColor(percentile: number): string {
  if (percentile < 25) return "stroke-destructive";
  if (percentile < 75) return "stroke-warning";
  return "stroke-success";
}

function getBgColor(percentile: number): string {
  if (percentile < 25) return "bg-destructive/10 text-destructive";
  if (percentile < 75) return "bg-warning/10 text-warning";
  return "bg-success/10 text-success";
}

export function PercentileGauge({
  value,
  size = "md",
  label,
  className,
}: PercentileGaugeProps) {
  const s = sizeClasses[size];
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn("flex flex-col items-center gap-1.5", className)}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Percentil ${value}`}
    >
      <div className={cn("relative flex items-center justify-center", s.outer)}>
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="45"
            cy="45"
            r={radius}
            strokeWidth={s.strokeW}
            className="stroke-muted"
          />
          <circle
            cx="45"
            cy="45"
            r={radius}
            strokeWidth={s.strokeW}
            strokeLinecap="round"
            className={getColor(value)}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <span className={cn("font-bold font-tabular", s.text)}>
          {Math.round(value)}
        </span>
      </div>
      {label && (
        <span
          className={cn(
            "text-xs font-medium rounded-full px-2 py-0.5",
            getBgColor(value)
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function PercentileGaugeSkeleton({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const s = sizeClasses[size];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("rounded-full animate-pulse bg-muted", s.outer)} />
      <div className="h-4 w-12 rounded animate-pulse bg-muted" />
    </div>
  );
}
