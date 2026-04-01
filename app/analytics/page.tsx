'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { Activity, Globe, Shield, BarChart3, AlertTriangle, RefreshCcw, LayoutDashboard, Database, TrendingUp, Map as MapIcon, CheckCircle2, AlertCircle, ArrowRight, Clock, Box } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const AnalyticsMap = dynamic(() => import('@/components/AnalyticsMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-zinc-900/50 animate-pulse rounded-3xl flex items-center justify-center text-[10px] font-black uppercase text-zinc-700 tracking-widest border border-white/5">Initializing Neural Map...</div>
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

function MetricCard({ icon, label, value, sub, accent = 'indigo', isString = false }: any) {
  const accents: any = {
    indigo:  { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/5' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/5' },
    rose:    { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/5' },
    amber:   { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/5' },
  };
  const theme = accents[accent] || accents.indigo;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`relative group h-full rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-8 flex flex-col gap-6 hover:bg-zinc-900/60 transition-all duration-300 shadow-2xl ${theme.glow}`}>
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${theme.bg} ${theme.border} ${theme.text} group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <div className="space-y-1">
         <p className={`text-4xl font-black tracking-tighter ${theme.text}`}>
           {isString ? <span>{value}</span> : <AnimatedCounter value={value} />}
         </p>
         <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{label}</p>
         {sub && <p className="text-[10px] text-zinc-800 mt-2 font-black border-t border-white/5 pt-2 uppercase tracking-widest">{sub}</p>}
       </div>
    </motion.div>
  );
}

// ── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'hospital' | 'doctor' | 'patient' | null>(null);

  useEffect(() => {
    const hospitalToken = sessionStorage.getItem('portal_api_key');
    const doctorToken = localStorage.getItem('doctor_token');
    const patientToken = localStorage.getItem('token');
    
    if (hospitalToken) setUserRole('hospital');
    else if (doctorToken) setUserRole('doctor');
    else if (patientToken) setUserRole('patient');
    else {
      router.push('/hospital/login');
      return;
    }
    
    setAuthenticated(true);
  }, [router]);

  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const [filterSymptom, setFilter] = useState('');
  const [filterRegion, setRegion] = useState('');
  const [feedIdx, setFeedIdx] = useState(0);

  const fetchData = useCallback(async (p = period, s = filterSymptom, r = filterRegion) => {
    try {
      const params = new URLSearchParams({ period: p });
      if (s) params.set('symptom', s);
      if (r) params.set('region', r);
      const res = await fetch(`/api/analytics?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fetch failed');
      setData(json); setError('');
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

  const resetView = () => {
    setFilter('');
    setRegion('');
    setPeriod('24h');
    setSuccess('Intelligence view reset');
    setTimeout(()=>setSuccess(''), 2000);
  };

  if (!authenticated) return null;

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Syncing Intelligence Frames...</p>
    </div>
  );

  const m = data?.metrics;
  const alertState: any = (data?.outbreaks?.length ?? 0) > 0 ? 'outbreak' : (data?.warnings?.length ?? 0) > 0 ? 'warning' : 'normal';
  const visibleFeed = (data?.feed ?? []).slice(feedIdx, feedIdx + 5);

  const dashboardPath = userRole === 'hospital' ? '/dashboard' : userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';

  return (
    <div className="dark min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden text-white font-sans">
      {/* ── BACKGROUND ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto w-full p-6 lg:p-10 space-y-8 flex-1 flex flex-col">
        {/* HEADER */}
        <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-32 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />
           <div className="flex flex-col sm:flex-row items-center gap-6 cursor-pointer" onClick={resetView}>
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center border border-white/10 shadow-2xl shrink-0 group-hover:scale-105 transition-transform">
                 <BrandLogo variant="icon" size={36} />
              </div>
               <div className="space-y-0.5 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                     <h1 className="text-xl font-black tracking-tighter text-white uppercase">Clinical Intelligence Layer</h1>
                     <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${data?.mock ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${data?.mock ? 'bg-amber-400' : 'bg-emerald-400'}`} /> {data?.mock ? 'Simulation Node' : 'Network Synchronized'}
                     </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Globe size={10} className="text-emerald-500" /> Decentralized Vector Feed Active
                  </p>
               </div>
           </div>
           <div className="flex flex-wrap items-center justify-center gap-4 w-full lg:w-auto relative z-10">
              <button onClick={resetView} className="px-5 py-3 rounded-xl bg-zinc-950/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition group/nav flex items-center gap-2">
                <Box size={14} className="group-hover/nav:text-emerald-400 transition-colors" /> Reset View
              </button>
              
               <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-zinc-950/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition flex items-center gap-2">
                 ⟵ Return to Access Ecosystem
               </Link>
           </div>
        </motion.nav>

        {/* FEEDBACK BANNERS */}
        <AnimatePresence>
          {error && <motion.div key="err" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-black uppercase flex items-center gap-3"><AlertCircle size={18} /> {error}</motion.div>}
          {success && <motion.div key="succ" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase flex items-center gap-3"><CheckCircle2 size={18} /> {success}</motion.div>}
        </AnimatePresence>

        {/* FILTERS & TELEMETRY */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
           {/* LEFT: CONTROLS */}
           <div className="lg:col-span-3 space-y-6">
              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-8 space-y-8 shadow-2xl">
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-3"><RefreshCcw size={14} className="text-emerald-500" /> Control Protocol</h3>
                    <div className="flex flex-col gap-2">
                       {(['24h', '7d', '30d'] as const).map(p => (
                         <button key={p} onClick={() => { setPeriod(p); fetchData(p); }} className={`w-full px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all text-left flex items-center justify-between ${period === p ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-xl' : 'bg-black/20 border-white/5 text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}>
                            {p === '24h' ? 'Last Cycle' : p === '7d' ? 'Weekly Window' : 'Monthly Epoch'}
                            <div className={`w-1.5 h-1.5 rounded-full ${period === p ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-zinc-800'}`} />
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4 pt-8 border-t border-white/5">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dimension Filters</h3>
                    <div className="space-y-3">
                       <select value={filterSymptom} onChange={e => { setFilter(e.target.value); fetchData(period, e.target.value); }} className="w-full bg-black/40 border border-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-widest px-6 py-5 rounded-2xl outline-none focus:border-emerald-500/30 transition appearance-none cursor-pointer">
                          <option value="">All Indications</option>
                          {[...new Set((data?.events || []).map(e => e.diagnosis))].map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                       <select value={filterRegion} onChange={e => { setRegion(e.target.value); fetchData(period, filterSymptom, e.target.value); }} className="w-full bg-black/40 border border-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-widest px-6 py-5 rounded-2xl outline-none focus:border-emerald-500/30 transition appearance-none cursor-pointer">
                          <option value="">All Regions</option>
                          {(data?.regionTotals || []).map(r => <option key={r.region} value={r.region}>{r.regionName || r.region}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-8 space-y-4">
                 <div className="flex items-center justify-between"><h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Node Health</h3><PulseDot color="emerald" /></div>
                 <div className="space-y-2">
                   <div className="flex justify-between items-end"><p className="text-[9px] font-black text-zinc-700 uppercase">Verification Rate</p><p className="text-xs font-black text-emerald-400">99.8%</p></div>
                   <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '99.8%' }} className="h-full bg-emerald-500" /></div>
                 </div>
                 <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest mt-2">Handshake v.4.12 - OK</p>
              </div>
           </div>

           {/* MAIN TELMETRY ARRAY */}
           <div className="lg:col-span-9 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <MetricCard icon={<Database size={24} />} label="Records Committed" value={m?.totalRecords || 0} sub="Institutional Sync" accent="indigo" />
                 <MetricCard icon={<Globe size={24} />} label="Active Nodes" value={m?.activeRegions || 0} sub="Regional Clusters" accent="emerald" />
                 <MetricCard icon={<TrendingUp size={24} />} label="Top Vector" value={m?.topSymptom || '—'} isString sub="Primary Indication" accent="amber" />
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-4 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />
                    <AnalyticsMap data={data?.regionTotals || []} selectedRegion={filterRegion} />
                 </div>
                 
                 {/* ALERT SECTION */}
                 <div className="flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                      {alertState !== 'normal' ? (
                        <motion.div key="alert" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`p-8 rounded-3xl border flex-1 flex flex-col justify-between relative overflow-hidden shadow-2xl ${alertState === 'outbreak' ? 'border-rose-500/30 bg-rose-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                           <div className="relative z-10 space-y-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${alertState === 'outbreak' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'} animate-pulse`}>
                                 <AlertTriangle size={28} />
                              </div>
                              <div className="space-y-1">
                                 <h2 className={`text-xl font-black uppercase tracking-tighter ${alertState === 'outbreak' ? 'text-rose-500' : 'text-amber-500'}`}>Protocol Breach</h2>
                                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Symptom Cluster Detected</p>
                              </div>
                              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                                 <div className="flex justify-between items-center"><span className="text-[9px] font-black text-zinc-600 uppercase">Target Node</span><span className="text-[10px] font-black text-white">{data?.outbreaks?.[0]?.regionName || data?.warnings?.[0]?.regionName}</span></div>
                                 <div className="flex justify-between items-center"><span className="text-[9px] font-black text-zinc-600 uppercase">Vector</span><span className="text-[10px] font-black text-white">{data?.outbreaks?.[0]?.diagnosis || data?.warnings?.[0]?.diagnosis}</span></div>
                              </div>
                           </div>
                           <button className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${alertState === 'outbreak' ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-700' : 'bg-amber-600 text-white border-amber-500 hover:bg-amber-700'}`}>Initiate Response</button>
                        </motion.div>
                      ) : (
                        <motion.div key="nominal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-3xl border border-emerald-500/10 bg-emerald-500/5 flex-1 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl">
                           <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10"><CheckCircle2 size={40} /></div>
                           <div className="space-y-1">
                              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Status: Nominal</h3>
                              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">No active breaches in epoch</p>
                           </div>
                           <div className="w-full pt-6 border-t border-white/5 text-center"><p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.2em]">Neural Intelligence verified</p></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
              </div>

              {/* SECONDARY DIAGRAMS */}
              <div className="grid lg:grid-cols-2 gap-8">
                 <div className="rounded-[40px] border border-white/5 bg-zinc-900/40 p-10 space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <h2 className="text-sm font-black text-white uppercase tracking-widest">Neural Vector Array</h2>
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Symptom frequency per indication</p>
                       </div>
                       <BarChart3 size={18} className="text-zinc-800" />
                    </div>
                    <div className="space-y-6">
                       {(data?.symptomChart || []).map((s, i) => {
                         const max = Math.max(...(data?.symptomChart?.map(v => v.count) || [1]), 1);
                         const pct = (s.count / max) * 100;
                         return (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em]">
                                 <span className="text-zinc-500">{s.name}</span>
                                 <span className="text-emerald-400 font-mono tracking-normal">{s.count} Node Segments</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]" /></div>
                           </div>
                         );
                       })}
                    </div>
                 </div>

                 <div className="rounded-[40px] border border-white/5 bg-zinc-900/40 p-10 flex flex-col space-y-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <h2 className="text-sm font-black text-white uppercase tracking-widest">Live Telemetry Feed</h2>
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Neural extraction timeline</p>
                       </div>
                       <PulseDot color="emerald" />
                    </div>
                    <div className="flex-1 space-y-4">
                       {visibleFeed.map((item, i) => (
                         <div key={item.id} className="p-5 rounded-2xl border border-white/5 bg-black/40 flex items-start gap-4 hover:border-emerald-500/20 transition duration-300">
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <div className="flex-1 min-w-0 space-y-1">
                               <p className="text-[11px] text-zinc-300 font-bold leading-relaxed">{item.message}</p>
                               <p className="text-[9px] text-zinc-700 font-mono uppercase tracking-widest">Zone: 0x{item.region} · Node Verified at {new Date(item.timestamp).toLocaleTimeString()}</p>
                            </div>
                         </div>
                       ))}
                       {(data?.feed || []).length === 0 && <div className="flex-1 flex items-center justify-center text-[10px] text-zinc-800 font-black uppercase tracking-[0.3em]">Awaiting clinical packets...</div>}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* FOOTER */}
        <footer className="pt-10 border-t border-white/5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
           <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] max-w-2xl leading-relaxed">
              Decentralized health intelligence framework · data extraction governed by infrastructure-tier AI nodes ensuring sovereign anonymity and regional precision.
           </p>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Lock size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Sovereign Data</p></div>
              <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Network Verified</p></div>
           </div>
        </footer>
      </div>
    </div>
  );
}

function Lock({ size, className }: any) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>; }
