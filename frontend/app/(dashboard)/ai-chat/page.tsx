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

export const metadata: Metadata = { title: titles["ai-chat"] };

export default function Page() {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <p className="text-sm">Próximamente — Fase {['diagnostics','carbon'].includes('ai-chat') ? '4' : ['invoices'].includes('ai-chat') ? '5' : ['reports'].includes('ai-chat') ? '6' : '7-8'}</p>
    </div>
  );
}
