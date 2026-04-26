import type { Metadata } from "next";

const titles: Record<string, string> = {
  diagnostics: "Autodiagnóstico ASG",
  carbon: "Huella de Carbono",
  invoices: "Facturas",
  reports: "Informes",
  benchmarks: "Benchmarking Sectorial",
  marketplace: "Marketplace",
  "ai-chat": "Asistente IA",
};

export const metadata: Metadata = { title: titles["marketplace"] };

export default function Page() {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <p className="text-sm">Próximamente — Fase {['diagnostics','carbon'].includes('marketplace') ? '4' : ['invoices'].includes('marketplace') ? '5' : ['reports'].includes('marketplace') ? '6' : '7-8'}</p>
    </div>
  );
}
