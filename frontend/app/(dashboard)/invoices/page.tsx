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

export const metadata: Metadata = { title: titles["invoices"] };

export default function Page() {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <p className="text-sm">Próximamente — Fase {['diagnostics','carbon'].includes('invoices') ? '4' : ['invoices'].includes('invoices') ? '5' : ['reports'].includes('invoices') ? '6' : '7-8'}</p>
    </div>
  );
}
