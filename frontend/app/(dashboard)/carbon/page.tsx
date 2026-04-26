import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huella de Carbono",
  description: "Calcula tu huella de carbono Scope 1, 2 y 3. Sube facturas y obtén cálculos automáticos de emisiones CO₂e.",
};

export default function Page() {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <p className="text-sm">Próximamente — Fase {['diagnostics','carbon'].includes('carbon') ? '4' : ['invoices'].includes('carbon') ? '5' : ['reports'].includes('carbon') ? '6' : '7-8'}</p>
    </div>
  );
}
