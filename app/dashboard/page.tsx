'use client';
import { useEffect, useState } from 'react';

interface Event { region: string; diagnosis: string; count: number; outbreak: boolean; }
interface RegionTotal { region: string; total: number; }

export default function AnalyticsDashboard() {
  const [events, setEvents]     = useState<Event[]>([]);
  const [regions, setRegions]   = useState<RegionTotal[]>([]);
  const [outbreaks, setOutbreaks] = useState<Event[]>([]);
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setEvents(data.events || []);
      setRegions(data.regionTotals || []);
      setOutbreaks(data.outbreaks || []);
      setThreshold(data.threshold || 5);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const maxCount = Math.max(...events.map(e => e.count), 1);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading analytics...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-10 space-y-8 px-4 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="glass-panel p-8 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
             <span className="text-indigo-400">🌍</span> Population Health Matrix
          </h1>
          <p className="text-zinc-400 mt-2 font-mono text-sm tracking-wide">
             <span className="text-emerald-400">● LIVE</span> · ANONYMIZED · DECENTRALIZED TELEMETRY
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-end gap-2">
           <button onClick={fetchData} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow flex items-center gap-2 group">
             <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span> Force Sync
           </button>
           <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Last synced: {lastRefresh.toLocaleTimeString()}</p>
        </div>
      </div>

      {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm font-semibold shadow-inner">{error}</div>}

      {/* Outbreak Alerts */}
      {outbreaks.length > 0 && (
        <div className="glass-panel border-rose-500/50 bg-rose-950/20 p-8 shadow-[0_0_50px_rgba(225,29,72,0.1)] relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(225,29,72,0.05)_10px,rgba(225,29,72,0.05)_20px)] pointer-events-none" />
          <div className="relative z-10">
             <h2 className="text-2xl font-black mb-2 text-rose-500 flex items-center gap-3 tracking-wide">
                <span className="animate-pulse">🚨</span> CRITICAL OUTBREAK DETECTED
             </h2>
             <p className="text-sm text-rose-300/80 mb-6 font-mono bg-rose-950/50 inline-block px-3 py-1 rounded border border-rose-900/50">
                THRESHOLD BREACH: &ge;{threshold} cases vectoring per region in 24h cycle
             </p>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {outbreaks.map((o, i) => (
                 <div key={i} className="bg-rose-950 border border-rose-800/80 rounded-2xl p-6 shadow-inner relative group">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/20 blur-[20px] rounded-full pointer-events-none group-hover:bg-rose-500/30 transition-colors" />
                   <p className="font-extrabold text-white text-xl capitalize mb-1 relative z-10">{o.diagnosis}</p>
                   <p className="text-rose-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5 relative z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {o.region} Sector
                   </p>
                   <div className="flex items-end gap-2 relative z-10">
                      <p className="text-rose-500 font-black text-4xl leading-none drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]">{o.count}</p>
                      <span className="text-xs font-bold text-rose-500/70 uppercase tracking-widest mb-1">Infected Nodes</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {outbreaks.length === 0 && (
        <div className="glass-panel p-6 border-emerald-500/30 bg-emerald-950/10 flex items-center gap-4 shadow-inner">
          <div className="w-12 h-12 rounded-full bg-emerald-900/50 border border-emerald-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">✓</div>
          <div>
             <h3 className="font-bold text-emerald-400 tracking-wide text-lg">System Nominal</h3>
             <p className="text-xs text-emerald-200/60 font-mono">No localized outbreak parameters detected in the trailing 24h vector space.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 items-start">
         
         {/* Region Overview */}
         {regions.length > 0 && (
           <div className="glass-panel p-8 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
             <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800/80 pb-4">
                <span className="text-blue-400">📍</span> Regional Heatmap <span className="text-[10px] text-zinc-500 font-mono tracking-widest">(T-24H)</span>
             </h2>
             <div className="space-y-6 relative z-10">
               {regions.map((r, i) => {
                 const maxTotal = Math.max(...regions.map(x => x.total), 1);
                 const pct = Math.round((r.total / maxTotal) * 100);
                 const isHighRisk = r.total >= threshold;
                 return (
                   <div key={i} className="group">
                     <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                       <span className="text-zinc-300">{r.region} SECTOR</span>
                       <span className={isHighRisk ? 'text-rose-400' : 'text-blue-400'}>{r.total} VECTORS</span>
                     </div>
                     <div className="bg-zinc-900 rounded-full h-2 border border-zinc-800/80 overflow-hidden shadow-inner">
                       <div
                         className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isHighRisk ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(225,29,72,0.8)]' : 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                         style={{ width: `${pct}%` }}
                       >
                          <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent" />
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         )}

         {/* Symptom Heatmap Table */}
         {events.length > 0 && (
           <div className="glass-panel p-8 lg:col-span-2 relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
             <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800/80 pb-4 relative z-10">
                <span className="text-indigo-400">🦠</span> Global Disease Frequency
             </h2>
             <div className="overflow-x-auto relative z-10">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800/80">
                     <th className="pb-3 pr-4">Network Node</th>
                     <th className="pb-3 pr-4">Vector Syntax</th>
                     <th className="pb-3 pr-4">Density</th>
                     <th className="pb-3 text-right">System Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800/50">
                   {events.map((e, i) => (
                     <tr key={i} className={`group transition-colors hover:bg-zinc-900/30 ${e.outbreak ? 'bg-rose-950/10' : ''}`}>
                       <td className="py-4 pr-4 font-mono text-xs text-zinc-400">
                           <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 shadow-inner group-hover:border-indigo-500/30 transition-colors">SEC-{e.region.substring(0,3).toUpperCase()}</span>
                       </td>
                       <td className="py-4 pr-4 capitalize font-bold text-zinc-200 tracking-wide">{e.diagnosis}</td>
                       <td className="py-4 pr-4">
                         <div className="flex items-center gap-3">
                           <div className="bg-zinc-900 border border-zinc-800 rounded-full h-1.5 w-24 overflow-hidden shadow-inner">
                             <div className={`h-full rounded-full ${e.outbreak ? 'bg-rose-500 shadow-[0_0_5px_rgba(225,29,72,0.8)]' : 'bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]'}`} style={{ width: `${Math.round((e.count / maxCount) * 100)}%` }} />
                           </div>
                           <span className={`font-mono font-bold text-xs ${e.outbreak ? 'text-rose-400' : 'text-indigo-400'}`}>{e.count.toString().padStart(2, '0')}</span>
                         </div>
                       </td>
                       <td className="py-4 text-right">
                         <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border shadow-inner inline-flex items-center gap-1.5 ${e.outbreak ? 'bg-rose-900/30 text-rose-400 border-rose-500/50' : 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'}`}>
                           {e.outbreak ? <><div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />CRITICAL</> : <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />NOMINAL</>}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         )}
      </div>

      {events.length === 0 && !error && (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-2 border-zinc-700 rounded-full flex items-center justify-center text-2xl text-zinc-500 mb-4 animate-pulse">
            📡
          </div>
          <p className="font-bold text-white text-lg mb-2">Awaiting Telemetry</p>
          <p className="text-zinc-500 text-sm max-w-md">No analog records ingested in the network. Awaiting cryptographically signed health parameters to establish matrix.</p>
        </div>
      )}

      <p className="text-[10px] text-center font-mono text-zinc-600 pb-6 uppercase tracking-widest flex items-center justify-center gap-2">
         <span className="w-1 h-1 bg-zinc-600 rounded-full" /> SECURE END-TO-END ENCRYPTION <span className="w-1 h-1 bg-zinc-600 rounded-full" /> ZERO-KNOWLEDGE ARCHITECTURE <span className="w-1 h-1 bg-zinc-600 rounded-full" />
      </p>
    </div>
  );
}
