"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.token);
      router.push("/overview");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="glass p-8 w-full max-w-md space-y-6 animate-slide-up">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">CertFlow</h1>
          <p className="text-zinc-400">Inicia sesion en tu cuenta</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-400 transition-colors"
              placeholder="tu@empresa.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-400 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-500 hover:bg-accent-400 text-white rounded-xl font-medium transition-all disabled:opacity-50"
          >
            {loading ? "Iniciando sesion..." : "Iniciar Sesion"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          No tienes cuenta?{" "}
          <Link href="/register" className="text-accent-400 hover:text-accent-300">
            Crear una
          </Link>
        </p>
      </div>
    </div>
  );
}
