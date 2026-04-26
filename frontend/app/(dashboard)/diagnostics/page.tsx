import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autodiagnóstico ASG",
  description: "Evalúa la madurez ESG de tu empresa en ambiental, social y gobernanza. Obtén recomendaciones personalizadas.",
};

export default function Page() {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <p className="text-sm">Próximamente — Fase {['diagnostics','carbon'].includes('diagnostics') ? '4' : ['invoices'].includes('diagnostics') ? '5' : ['reports'].includes('diagnostics') ? '6' : '7-8'}</p>
    </div>
  );
}
