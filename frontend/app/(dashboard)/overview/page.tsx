'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, FileSearch, Plug, TrendingUp, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { apiFetch, formatScore } from '@/lib/utils';
import type { DashboardData } from '@/lib/types';

export default function OverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    apiFetch('/api/v1/dashboard')
      .then(setData)
      .catch((err) => {
        if (err.message.includes('401') || err.message.includes('token')) {
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-dark-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="glass p-6 h-32 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <p className="text-zinc-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{data.organization.name}</h1>
        <p className="text-zinc-400 mt-1">Compliance Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.scores && data.scores.slice(0, 2).map((score) => (
          <div key={score.framework} className="glass p-6 space-y-3 hover:border-accent-500/20 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{score.framework}</span>
              <ShieldCheck className="w-5 h-5 text-accent-400" />
            </div>
            <div className="text-3xl font-bold text-white">{formatScore(score.score)}</div>
            <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-accent-500 transition-all duration-700" style={{ width: `${score.score}%` }} />
            </div>
          </div>
        ))}
        <div className="glass p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Evidencias</span>
            <FileSearch className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{data.total_evidence}</div>
          <p className="text-xs text-zinc-500">hallazgos recolectados</p>
        </div>
        <div className="glass p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Conectores</span>
            <Plug className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{data.connectors}</div>
          <p className="text-xs text-zinc-500">cloud providers</p>
        </div>
      </div>

      {data.scores && data.scores.length > 0 ? (
        <div className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Postura de Compliance</h2>
          <div className="space-y-4">
            {data.scores.map((score) => (
              <div key={score.framework} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{score.framework}</span>
                    <div className="flex gap-2 text-xs">
                      <span className="flex items-center gap-1 text-green-400"><CheckCircle2 className="w-3 h-3" /> {score.pass}</span>
                      <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="w-3 h-3" /> {score.fail}</span>
                      <span className="flex items-center gap-1 text-zinc-400"><HelpCircle className="w-3 h-3" /> {score.manual}</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white">{formatScore(score.score)}</span>
                </div>
                <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden flex">
                  {score.pass > 0 && <div className="h-full bg-green-500 transition-all" style={{ width: `${(score.pass/score.total)*100}%` }} />}
                  {score.fail > 0 && <div className="h-full bg-red-500 transition-all" style={{ width: `${(score.fail/score.total)*100}%` }} />}
                  {score.warn > 0 && <div className="h-full bg-amber-500 transition-all" style={{ width: `${(score.warn/score.total)*100}%` }} />}
                  {score.manual > 0 && <div className="h-full bg-blue-500 transition-all" style={{ width: `${(score.manual/score.total)*100}%` }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass p-12 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">Conecta un cloud provider y ejecuta un escaneo para ver tu postura de compliance</p>
        </div>
      )}
    </div>
  );
}
