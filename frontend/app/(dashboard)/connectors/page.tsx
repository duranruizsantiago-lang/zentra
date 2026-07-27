"use client";

import { useEffect, useState } from "react";
import { Plug, Plus, Trash2, RefreshCw, Cloud } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import type { Connector } from "@/lib/types";

const cloudIcons: Record<string, string> = {
  gcp: "☁️", aws: "🟠", azure: "🔵",
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [ctype, setCtype] = useState("gcp");
  const [config, setConfig] = useState("");

  const fetchConnectors = () => {
    apiFetch("/api/v1/connectors")
      .then(setConnectors)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchConnectors(); }, []);

  const handleAdd = async () => {
    await apiFetch("/api/v1/connectors", {
      method: "POST",
      body: JSON.stringify({ name, type: ctype, config }),
    });
    setShowAdd(false);
    setName(""); setConfig("");
    setLoading(true);
    fetchConnectors();
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/api/v1/connectors/${id}`, { method: "DELETE" });
    fetchConnectors();
  };

  const handleScan = async (id: string) => {
    await apiFetch(`/api/v1/connectors/${id}/scan`, { method: "POST" });
    fetchConnectors();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Conectores Cloud</h1>
          <p className="text-zinc-400 mt-1">Gestiona las conexiones a tus proveedores cloud</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-400 text-white rounded-xl font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Conectar
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass p-6 space-y-4 animate-slide-up">
          <h3 className="text-white font-semibold">Nuevo Conector</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Nombre (ej: Produccion GCP)"
              className="px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:border-accent-400"
            />
            <select
              value={ctype} onChange={e => setCtype(e.target.value)}
              className="px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm"
            >
              <option value="gcp">Google Cloud (GCP)</option>
              <option value="aws">Amazon Web Services (AWS)</option>
              <option value="azure">Microsoft Azure</option>
            </select>
            <input
              value={config} onChange={e => setConfig(e.target.value)}
              placeholder='{"project_id": "my-project"}'
              className="px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:border-accent-400 font-mono"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="px-4 py-2 bg-accent-500 text-white rounded-xl text-sm">Guardar</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 glass-hover text-zinc-400 rounded-xl text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Connector list */}
      {loading ? (
        <div className="glass p-6 text-center text-zinc-400">Cargando...</div>
      ) : connectors.length === 0 ? (
        <div className="glass p-12 text-center space-y-4">
          <Cloud className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">No hay conectores. Conecta GCP, AWS o Azure para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectors.map(c => (
            <div key={c.id} className="glass p-5 space-y-4 hover:border-accent-500/10 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cloudIcons[c.type] || "☁️"}</span>
                  <div>
                    <h3 className="text-white font-medium">{c.name}</h3>
                    <p className="text-xs text-zinc-500 uppercase">{c.type}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-lg border ${
                  c.status === "connected" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleScan(c.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-accent-500/10 hover:bg-accent-500/20 text-accent-400 rounded-lg text-xs transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Escanear
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg text-xs transition-all"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
              {c.last_scan_at && (
                <p className="text-xs text-zinc-600">
                  Ultimo escaneo: {new Date(c.last_scan_at).toLocaleString("es-ES")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
