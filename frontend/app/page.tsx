import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="glass p-12 max-w-2xl w-full text-center space-y-8 animate-slide-up">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-400/10 border border-accent-400/20 text-accent-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            Compliance Automation
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-white">Cert</span>
            <span className="text-accent-400">Flow</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            Automatiza la recoleccion de evidencias de compliance para NIS2, DORA, ISO 27001 y ENS.
            Disenado para PYMEs espanolas.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-accent-500 hover:bg-accent-400 text-white rounded-xl font-medium transition-all"
          >
            Iniciar Sesion
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 glass-hover text-zinc-300 rounded-xl font-medium transition-all"
          >
            Crear Cuenta
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8">
          {["NIS2", "DORA", "ISO 27001"].map((fw) => (
            <div key={fw} className="glass-hover p-4 rounded-xl transition-all">
              <div className="text-sm text-zinc-500">{fw}</div>
              <div className="text-2xl font-bold text-accent-400 mt-1">--</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
