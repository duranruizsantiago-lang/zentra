"use client";

import { useState } from "react";
import { FileText, Download, FileDown } from "lucide-react";

const reportFrameworks = [
  { id: "NIS2", label: "NIS2 Compliance Report", icon: "🛡️" },
  { id: "DORA", label: "DORA Digital Resilience Report", icon: "💳" },
  { id: "ISO27001", label: "ISO 27001 ISMS Report", icon: "📋" },
  { id: "ENS", label: "ENS (Esquema Nacional de Seguridad)", icon: "🇪🇸" },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (fw: string) => {
    setGenerating(fw);
    // Simulated — in production this calls the Python reporter engine
    await new Promise(r => setTimeout(r, 2000));
    setGenerating(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Informes de Compliance</h1>
        <p className="text-zinc-400 mt-1">Genera informes PDF listos para auditoria</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportFrameworks.map(rf => (
          <div key={rf.id} className="glass p-6 space-y-4 hover:border-accent-500/20 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{rf.icon}</span>
              <div>
                <h3 className="text-white font-semibold">{rf.label}</h3>
                <p className="text-sm text-zinc-500">PDF profesional con evidencias y puntuaciones</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleGenerate(rf.id)}
                disabled={generating === rf.id}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-400 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                {generating === rf.id ? (
                  <>Generando...</>
                ) : (
                  <><FileDown className="w-4 h-4" /> Generar PDF</>
                )}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 glass-hover text-zinc-400 rounded-xl text-sm transition-all">
                <Download className="w-4 h-4" /> Previsualizar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent reports */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Informes Recientes</h2>
        <div className="text-center py-8 text-zinc-500">
          <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          Genera tu primer informe para verlo aqui
        </div>
      </div>
    </div>
  );
}
