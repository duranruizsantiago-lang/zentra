"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Search, Filter } from "lucide-react";
import { apiFetch, statusColor } from "@/lib/utils";
import type { Control } from "@/lib/types";

const frameworks = ["NIS2", "DORA", "ISO27001", "ENS"];

const severityBadge = (s: string) => {
  switch (s) {
    case "critical": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "high": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
};

export default function ControlsPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFW, setSelectedFW] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = selectedFW ? `?framework=${selectedFW}` : "";
    apiFetch(`/api/v1/controls${params}`)
      .then(setControls)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedFW]);

  const filtered = controls.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Matriz de Controles</h1>
        <p className="text-zinc-400 mt-1">Controles de compliance por framework</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedFW("")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedFW ? "bg-accent-500 text-white" : "glass-hover text-zinc-400"}`}
        >
          Todos
        </button>
        {frameworks.map(fw => (
          <button
            key={fw}
            onClick={() => setSelectedFW(fw)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedFW === fw ? "bg-accent-500 text-white" : "glass-hover text-zinc-400"}`}
          >
            {fw}
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar control..."
            className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-400 w-64"
          />
        </div>
      </div>

      {/* Controls grid */}
      {loading ? (
        <div className="glass p-6 text-center text-zinc-400">Cargando controles...</div>
      ) : filtered.length === 0 ? (
        <div className="glass p-12 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">Conecta un cloud provider para empezar a recolectar evidencias</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(control => (
            <div key={control.id} className="glass p-5 hover:border-accent-500/20 transition-all space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-lg border bg-dark-800 text-zinc-500 font-mono">
                      {control.code}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg border ${severityBadge(control.severity)}`}>
                      {control.severity}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{control.title}</h3>
                </div>
                <span className="text-xs text-zinc-500 whitespace-nowrap">{control.framework}</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{control.description}</p>
              <div className="text-xs text-zinc-600">{control.category}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
