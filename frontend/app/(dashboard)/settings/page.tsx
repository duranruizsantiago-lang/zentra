"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuracion</h1>
        <p className="text-zinc-400 mt-1">Gestiona tu organizacion y preferencias</p>
      </div>

      <div className="glass p-6 space-y-6">
        <div>
          <h3 className="text-white font-medium mb-2">Organizacion</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre de la organizacion"
              className="px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:border-accent-400"
            />
            <input
              placeholder="Email de contacto"
              className="px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:border-accent-400"
            />
          </div>
        </div>

        <div>
          <h3 className="text-white font-medium mb-2">Equipo</h3>
          <div className="text-sm text-zinc-500 py-4 text-center glass-hover rounded-xl">
            Gestiona miembros y roles de tu equipo
          </div>
        </div>

        <div>
          <h3 className="text-white font-medium mb-2">Peligro</h3>
          <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition-all border border-red-500/20">
            Eliminar Organizacion
          </button>
        </div>
      </div>
    </div>
  );
}
