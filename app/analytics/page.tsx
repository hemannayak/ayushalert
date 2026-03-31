'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { Activity, Globe, Shield, BarChart3, AlertTriangle, RefreshCcw, LayoutDashboard, Database, TrendingUp, Map as MapIcon, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const AnalyticsMap = dynamic(() => import('@/components/AnalyticsMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-zinc-900/50 animate-pulse rounded-3xl flex items-center justify-center text-[10px] font-black uppercase text-zinc-700 tracking-widest">Loading Geographic Intelligence...</div>
});

// ── TYPES ──────────────────────────────────────────────────────────────────
interface Metrics {
  totalRecords: number; activeRegions: number; alertsTriggered: number;
  topSymptom: string; pctChange: number; currentCount: number;
}
interface SymptomEvent {
  region: string; regionName: string; diagnosis: string; count: number;
  lastSeen: string; status: 'normal' | 'warning' | 'outbreak'; outbreak: boolean;
}
interface RegionTotal {
  region: string; regionName: string; total: number; status: 'normal' | 'warning' | 'outbreak';
}
interface FeedItem {
  id: string; message: string; timestamp: string; severity: 'info' | 'warning' | 'critical'; region: string;
}
interface SymptomChart { name: string; count: number; }
interface AnalyticsData {
  period: string; threshold: number; warningThreshold: number;
  metrics: Metrics; events: SymptomEvent[]; regionTotals: RegionTotal[];
  outbreaks: SymptomEvent[]; warnings: SymptomEvent[]; feed: FeedItem[];
  symptomChart: SymptomChart[];
  mock?: boolean;
}

// ── COMPONENTS ─────────────────────────────────────────────────────────────
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number | string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const isNumber = typeof value === 'number';
  useEffect(() => {
    if (!isNumber) return;
    let start = 0; const end = value as number;
    if (end === 0) { setDisplay(0); return; }
    const duration = 1000; const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step; if (start >= end) { setDisplay(end); clearInterval(timer); } else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, isNumber]);
  if (!isNumber) return <span>{prefix}{value}{suffix}</span>;
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function PulseDot({ color = 'emerald' }: { color?: string }) {
  const colors: Record<string, string> = { emerald: 'bg-emerald-400', rose: 'bg-rose-400', amber: 'bg-amber-400', indigo: 'bg-indigo-400' };
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[color]} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[color]}`} />
    </span>
  );
}

function StatusBadge({ status }: { status: 'normal' | 'warning' | 'outbreak' }) {
  const cfg = {
    normal:   { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'emerald', label: 'Nominal' },
    warning:  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'amber', label: 'Warning' },
    outbreak: { cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'rose', label: 'Critical' },
  }[status];
  return (
    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border flex items-center gap-1.5 ${cfg.cls}`}>
      <PulseDot color={cfg.dot} /> {cfg.label}
    </span>
  );
}

function MetricCard({ icon, label, value, sub, accent = 'indigo', isString = false }: any) {
  const accents: any = {
    indigo:  { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/5' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/5' },
    rose:    { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/5' },
    amber:   { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/5' },
  };
  const theme = accents[accent] || accents.indigo;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`relative group h-full rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-6 flex flex-col gap-4 hover:bg-zinc-900/60 transition-all duration-300 shadow-2xl ${theme.glow}`}>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${theme.bg} ${theme.border} ${theme.text} group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <div>
         <p className={`text-3xl font-black tracking-tighter ${theme.text}`}>
           {isString ? <span>{value}</span> : <AnimatedCounter value={value} />}
         </p>
         <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">{label}</p>
         {sub && <p className="text-[10px] text-zinc-700 mt-2 font-medium border-t border-white/5 pt-2">{sub}</p>}
       </div>
    </motion.div>
  );
}

// ── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const [filterSymptom, setFilter] = useState('');
  const [filterRegion, setRegion] = useState('');
  const [lastRefresh, setLast] = useState(new Date());
  const [simulating, setSimulating] = useState(false);
  const [simMsg, setSimMsg] = useState('');
  const [feedIdx, setFeedIdx] = useState(0);

  const fetchData = useCallback(async (p = period, s = filterSymptom, r = filterRegion) => {
    try {
      const params = new URLSearchParams({ period: p });
      if (s) params.set('symptom', s);
      if (r) params.set('region', r);
      const res = await fetch(`/api/analytics?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fetch failed');
      setData(json); setLast(new Date()); setError('');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [period, filterSymptom, filterRegion]);

  useEffect(() => {
    fetchData(period, filterSymptom, filterRegion);
    const iv = setInterval(() => fetchData(period, filterSymptom, filterRegion), 30000);
    return () => clearInterval(iv);
  }, [period, filterSymptom, filterRegion, fetchData]);

  useEffect(() => {
    if (!data?.feed?.length) return;
    const iv = setInterval(() => setFeedIdx(i => (i + 1) % Math.min(data.feed.length, 8)), 4000);
    return () => clearInterval(iv);
  }, [data?.feed?.length]);

  const handleSimulate = async () => {
    setSimulating(true); setSimMsg('');
    try {
      const res = await fetch('/api/analytics/simulate', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSimMsg(`⚠ PROTOCOL BREACH: ${json.message}`);
      await fetchData();
    } catch (e: any) { setSimMsg('Simulation failed: ' + e.message); }
    finally { setSimulating(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Initializing Intelligence Layer...</p>
    </div>
  );

  const m = data?.metrics;
  const alertState: any = (data?.outbreaks?.length ?? 0) > 0 ? 'outbreak' : (data?.warnings?.length ?? 0) > 0 ? 'warning' : 'normal';
  const visibleFeed = (data?.feed ?? []).slice(feedIdx, feedIdx + 5);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.2] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto w-full p-6 lg:p-10 space-y-8">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-emerald-500/10 shadow-2xl">
                   <BrandLogo variant="icon" size={42} />
                </div>
               <div className="space-y-1">
                 <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-extrabold tracking-tighter text-white">Health Intelligence</h1>
                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400">Infrastructure Node</div>
                 </div>
                 <p className="text-sm text-zinc-500 font-medium">Anonymized Surveillance · Infrastructure Intelligence v3.1</p>
               </div>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
               <div className={`px-5 py-3 rounded-xl border flex items-center gap-3 ${data?.mock ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${data?.mock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{data?.mock ? 'Simulated Node' : 'Live Node Verified'}</span>
               </div>
               <Link href="/" className="px-5 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition flex-1 sm:flex-none text-center">Home</Link>
               <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition flex-1 sm:flex-none text-center flex items-center justify-center gap-2">
                 <LayoutDashboard size={14} /> Dashboard
               </Link>
               <button onClick={() => fetchData()} className="px-5 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-zinc-800 transition flex items-center justify-center gap-2 flex-1 sm:flex-none"><RefreshCcw size={14} /> Refresh</button>
               <button onClick={handleSimulate} disabled={simulating} className="px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 transition flex-1 sm:flex-none text-center">{simulating ? 'Processing...' : 'Simulate Outbreak'}</button>
            </div>
        </motion.div>

        {simMsg && <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest animate-pulse">{simMsg}</div>}

        {/* FILTERS */}
        <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-4 flex flex-col md:flex-row items-center gap-6 shadow-xl">
           <div className="flex items-center bg-zinc-950/50 border border-zinc-800 rounded-xl p-1 w-full md:w-auto">
             {(['24h', '7d', '30d'] as const).map(p => (
               <button key={p} onClick={() => { setPeriod(p); fetchData(p); }} className={`flex-1 md:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${period === p ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}>{p}</button>
             ))}
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
             <select value={filterSymptom} onChange={e => { setFilter(e.target.value); fetchData(period, e.target.value); }} className="bg-zinc-950/50 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/30 transition w-full sm:min-w-[180px]">
                <option value="">All Indications</option>
                {[...new Set((data?.events || []).map(e => e.diagnosis))].map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <select value={filterRegion} onChange={e => { setRegion(e.target.value); fetchData(period, filterSymptom, e.target.value); }} className="bg-zinc-950/50 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500/30 transition w-full sm:min-w-[180px]">
                <option value="">All Regions</option>
                {(data?.regionTotals || []).map(r => <option key={r.region} value={r.region}>{r.regionName || r.region}</option>)}
             </select>
           </div>
           <p className="md:ml-auto text-[10px] font-black text-zinc-800 uppercase tracking-widest hidden lg:block">Confidence: High · Live Handshake: Encrypted</p>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <MetricCard icon={<Database size={20} />} label="Telemetry Nodes" value={m?.totalRecords || 0} sub="Anonymized records synced" accent="indigo" />
           <MetricCard icon={<Globe size={20} />} label="Active Zones" value={m?.activeRegions || 0} sub={`Incidence clusters in ${period}`} accent="emerald" />
           <MetricCard icon={<Activity size={20} />} label="Events Logged" value={m?.alertsTriggered || 0} sub={`${m?.pctChange || 0}% vs prev period`} accent={alertState === 'outbreak' ? 'rose' : 'amber'} />
           <MetricCard icon={<TrendingUp size={20} />} label="Top Indication" value={m?.topSymptom || '—'} isString accent="indigo" />
        </div>

        {/* GEOGRAPHIC INTELLIGENCE & ALERTS */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <AnalyticsMap data={data?.regionTotals || []} selectedRegion={filterRegion} />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AnimatePresence>
              {alertState !== 'normal' ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-8 rounded-3xl border ${alertState === 'outbreak' ? 'border-rose-500/30 bg-rose-500/5' : 'border-amber-500/30 bg-amber-500/5'} relative overflow-hidden flex-1 flex flex-col justify-center`}>
                  <div className="relative z-10 space-y-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${alertState === 'outbreak' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'} animate-pulse`}>
                      <AlertTriangle size={28} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-black uppercase tracking-tighter ${alertState === 'outbreak' ? 'text-rose-500' : 'text-amber-500'}`}>
                        {alertState === 'outbreak' ? 'Threshold Breach' : 'Incidence Warning'}
                      </h2>
                      <p className={`text-[11px] font-medium leading-relaxed mt-1 ${alertState === 'outbreak' ? 'text-rose-300/60' : 'text-amber-300/60'}`}>
                        Cluster detected in {data?.outbreaks?.[0]?.regionName || data?.warnings?.[0]?.regionName}
                      </p>
                    </div>
                    
                    <div className="pt-4 grid grid-cols-2 gap-4">
                       <div className={`${alertState === 'outbreak' ? 'bg-rose-950/40 border-rose-500/10' : 'bg-amber-950/40 border-amber-500/10'} border p-4 rounded-2xl`}>
                          <p className="text-[9px] font-black uppercase text-zinc-500 mb-1">Involved</p>
                          <p className="text-xl font-black text-white">{data?.outbreaks?.[0]?.count || data?.warnings?.[0]?.count || 0}</p>
                       </div>
                       <div className={`${alertState === 'outbreak' ? 'bg-rose-950/40 border-rose-500/10' : 'bg-amber-950/40 border-amber-500/10'} border p-4 rounded-2xl`}>
                          <p className="text-[9px] font-black uppercase text-zinc-500 mb-1">Status</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${alertState === 'outbreak' ? 'text-rose-400' : 'text-amber-400'}`}>{alertState}</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-3xl border border-emerald-500/10 bg-emerald-500/5 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Protocol Nominal</h3>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">No active breaches in {period}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Node Health</h3>
                 <PulseDot color="emerald" />
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between items-end"><p className="text-[10px] font-bold text-zinc-600">Verification Rate</p><p className="text-sm font-black text-white">99.8%</p></div>
                 <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden"><div className="h-full w-[99.8%] bg-emerald-500" /></div>
               </div>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-8">
           <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-8 space-y-8">
              <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-sm font-black text-white uppercase tracking-widest">Symptom Distribution</h2>
                   <p className="text-[10px] text-zinc-600">Frequency per indication · {period}</p>
                 </div>
                 <BarChart3 size={18} className="text-zinc-800" />
              </div>
              <div className="space-y-4">
                {(data?.symptomChart || []).map((s, i) => {
                  const max = Math.max(...(data?.symptomChart?.map(v => v.count) || [1]), 1);
                  const pct = (s.count / max) * 100;
                  return (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-zinc-400">{s.name}</span>
                          <span className="text-emerald-400">{s.count} Cases</span>
                       </div>
                       <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-emerald-500/60" />
                       </div>
                    </div>
                  );
                })}
              </div>
           </div>

           <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <div>
                   <h2 className="text-sm font-black text-white uppercase tracking-widest">Live Telemetry</h2>
                   <p className="text-[10px] text-zinc-600">Real-time surveillance stream</p>
                 </div>
                 <PulseDot color="emerald" />
              </div>
              <div className="flex-1 space-y-3">
                 {visibleFeed.map((item, i) => (
                   <div key={item.id} className="p-3 rounded-xl border border-white/5 bg-zinc-950/30 flex items-start gap-4 hover:bg-zinc-900/50 transition duration-300">
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${item.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <div className="flex-1 min-w-0">
                         <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">{item.message}</p>
                         <p className="text-[9px] text-zinc-600 font-mono mt-1 uppercase tracking-widest">Zone {item.region} · Node verified</p>
                      </div>
                   </div>
                 ))}
                 {(data?.feed || []).length === 0 && <div className="flex-1 flex items-center justify-center text-[10px] text-zinc-700 uppercase">Awaiting telemetry frames...</div>}
              </div>
           </div>
        </div>

        {/* FOOTER */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-[9px] text-zinc-700 font-medium max-w-xl text-center md:text-left uppercase tracking-widest">
              Institutional intelligence layer aggregated from anonymized clinical vectors · AyushAlert complies with ABDM & DISHA frameworks for sovereign health ownership.
           </p>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Shield size={12} className="text-emerald-500" />
                 <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Zero-Knowledge Protocols</span>
              </div>
              <div className="flex items-center gap-2">
                 <CheckCircle2 size={12} className="text-emerald-500" />
                 <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Node Verified</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
