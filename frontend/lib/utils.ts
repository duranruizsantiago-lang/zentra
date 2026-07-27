import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function statusColor(status: string): string {
  switch (status) {
    case "pass": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "fail": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "warn": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "manual": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}
