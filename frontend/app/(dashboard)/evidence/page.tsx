"use client";

import { useEffect, useState } from "react";
import { FileSearch, Clock } from "lucide-react";
import { apiFetch, statusColor } from "@/lib/utils";
import type { Evidence } from "@/lib/types";

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/v1/evidence")
      .then(setEvidence)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Evidencias</h1>
        <p className="text-zinc-400 mt-1">Hallazgos de compliance recolectados de tus conectores cloud</p>
      </div>

      {loading ? (
        <div className="glass p-6 text-center text-zinc-400">Cargando evidencias...</div>
      ) : evidence.length === 0 ? (
        <div className="glass p-12 text-center space-y-4">
          <FileSearch className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">No hay evidencias todavia. Ejecuta un escaneo desde Conectores.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {evidence.map(e => (
            <div key={e.id} className="glass p-5 flex items-start gap-4 hover:border-accent-500/10 transition-all">
              <div className={`px-2.5 py-0.5 rounded-lg border text-xs font-medium ${statusColor(e.status)}`}>
                {e.status.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium text-white">{e.finding}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="font-mono bg-dark-800 px-2 py-0.5 rounded">{e.resource}</span>
                  <span className="font-mono">CTRL: {e.control_id}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(e.collected_at).toLocaleString("es-ES")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
