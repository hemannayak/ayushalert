'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { 
  Eye, Activity, AlertTriangle, ShieldAlert, Thermometer, MapPin, Search, 
  ArrowRight, HeartPulse, Building2, Users, Flame, Box, Zap, Stethoscope, 
  ChevronRight, BrainCircuit, Wallet, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

// ── UTILS ───────────────────────────────────────────────────────────────────
const now = new Date();
const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const dateString = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

// ── MOCK SYSTEM DATA ────────────────────────────────────────────────────────
const ANOMALY_ALERTS = [
  { id: 1, type: 'critical', title: 'Viral Outbreak Detected', detail: '+27 Acute Febrile Illness cases detected in Kukatpally (last 6 hours)', location: 'Zone B: Kukatpally / KPHB', action: 'Notify Local ERs & Clinics' },
  { id: 2, type: 'warning', title: 'Pediatric Respiratory Anomaly', detail: '14% spike in minor asthma cases compared to historical 30-day average', location: 'Zone D: Madhapur', action: 'Monitor Pollution API Links' }
];

const RESOURCE_DATA = {
  icuOccupancy: 88,
  wardOccupancy: 64,
  erLoad: '+35%',
  erStatus: 'critical',
  staffActive: 312,
  staffRequired: 345,
};

export default function IntelligenceCommandCenter() {
  const router = useRouter();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const int = setInterval(() => setPulse(p => !p), 4000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090C] text-zinc-300 font-sans flex flex-col relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* ── AMBIENT GLOWS ── */}
      <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-rose-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none z-0" />

      {/* ── NAVBAR ── */}
      <nav className="h-16 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center p-1.5"><BrandLogo variant="icon" /></div>
             <span className="text-sm font-black text-white uppercase tracking-tighter">AyushAlert</span>
           </div>
           <div className="w-px h-4 bg-white/10 mx-2" />
           <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500"><Eye size={12} /></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Intelligence Layer</span>
           </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-mono font-bold text-zinc-500">{dateString}</p>
              <p className="text-[10px] font-mono text-zinc-400">{timeString} IST</p>
           </div>
           <button onClick={() => router.push('/dashboard')} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors">
              Exit Terminal
           </button>
        </div>
      </nav>

      {/* ── CORE CONTENT ── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 w-full max-w-[1800px] mx-auto space-y-6">
        
        {/* 🟢 TOP PRIORITY: LIVE SURVEILLANCE */}
        <section className="space-y-4">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-2">
              <div className="space-y-1">
                 <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Eye className="text-rose-500" size={20} /> Live Surveillance
                 </h2>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Real-time outbreak detection & anomaly alerts across aggregated EMR nodes</p>
              </div>
              <div className="px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[ping_1.5s_infinite]" /> Scanning Network...
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {ANOMALY_ALERTS.map((alert, idx) => (
                 <motion.div 
                   key={alert.id} 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                   className={`p-6 rounded-2xl border bg-black/40 backdrop-blur-md relative overflow-hidden group ${alert.type === 'critical' ? 'border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.05)]' : 'border-amber-500/30'}`}
                 >
                    {/* Visual fx */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${alert.type === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    {pulse && alert.type === 'critical' && <div className="absolute inset-0 bg-rose-500/5 duration-1000" />}

                    <div className="flex flex-col h-full justify-between gap-6 pl-2">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${alert.type === 'critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                <AlertTriangle size={10} strokeWidth={3} /> {alert.title}
                             </div>
                             <p className="text-[10px] font-mono text-zinc-500">{timeString} (Live)</p>
                          </div>
                          
                          <div className="space-y-2">
                             <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                                {alert.detail}
                             </h3>
                             <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin size={12} className="text-zinc-500" /> {alert.location}
                             </p>
                          </div>
                       </div>
                       
                       <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <p className="text-[10px] font-medium text-zinc-500">System generated via cross-hospital EMR aggregation</p>
                          <button className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 ${alert.type === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'}`}>
                             {alert.action}
                          </button>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>
        </section>

        {/* 🔵 MIDDLE PRIORITY: RESOURCE MONITOR */}
        <section className="space-y-4 pt-4">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-2">
              <div className="space-y-1">
                 <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Building2 className="text-cyan-500" size={18} /> Resource Monitor
                 </h2>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Hospital capacity, bed loads, and active workforce staging</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ICU Tracker */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                 <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">City ICU Capacity</p>
                    <Activity size={14} className="text-amber-400" />
                 </div>
                 <div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-white tracking-tighter">{RESOURCE_DATA.icuOccupancy}%</span>
                       <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest border border-amber-400/20 bg-amber-400/10 px-1.5 rounded">High Load</span>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500 rounded-full" style={{ width: `${RESOURCE_DATA.icuOccupancy}%` }} />
                    </div>
                 </div>
                 <div className="pt-3 border-t border-white/5">
                    <p className="text-[10px] font-medium text-zinc-400 flex items-center justify-between">
                       Action Required: <span className="text-amber-400 font-bold cursor-pointer">Re-route Level 3 Trauma</span>
                    </p>
                 </div>
              </div>

              {/* ER Load */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                 <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Emergency Room Stress</p>
                    <Flame size={14} className="text-rose-500" />
                 </div>
                 <div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-rose-500 tracking-tighter">{RESOURCE_DATA.erLoad}</span>
                       <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Active Surge</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-400 mt-2">Correlated with Kukatpally fever alert.</p>
                 </div>
                 <div className="pt-3 border-t border-white/5">
                    <p className="text-[10px] font-medium text-zinc-400 flex items-center justify-between">
                       Suggested Directive: <span className="text-rose-400 font-bold cursor-pointer hover:underline">Increase Triage Staffing</span>
                    </p>
                 </div>
              </div>

              {/* Workforce */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                 <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Network Clinical Staff</p>
                    <Users size={14} className="text-indigo-400" />
                 </div>
                 <div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black text-white tracking-tighter">{RESOURCE_DATA.staffActive}</span>
                       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">/ {RESOURCE_DATA.staffRequired} Req.</span>
                    </div>
                    <p className="text-xs font-medium text-amber-500 mt-2">Deficit of 33 active personnel detected.</p>
                 </div>
                 <div className="pt-3 border-t border-white/5">
                    <p className="text-[10px] font-medium text-zinc-400 flex items-center justify-between">
                       Immediate Action: <span className="text-indigo-400 font-bold cursor-pointer hover:underline">Approve Overtime Block</span>
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* 🟡 BOTTOM PRIORITY: INSIGHTS & INTEL */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
           
           {/* Revenue Insights */}
           <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-white/5">
                 <Wallet size={14} className="text-emerald-500" /> Revenue Insights
              </h3>
              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Daily Network Billing</p>
                    <div className="flex items-baseline gap-2"><span className="text-2xl font-black text-white tracking-tighter">₹1.42M</span><span className="text-[10px] font-bold text-emerald-500">+8.4%</span></div>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Predictive Cashflow</p>
                    <p className="text-xs font-medium text-zinc-300">Trending POSITIVE based on ER surge billing projections.</p>
                 </div>
              </div>
           </div>

           {/* Supply Chain */}
           <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-white/5">
                 <Box size={14} className="text-amber-500" /> Supply Chain
              </h3>
              <div className="space-y-3">
                 <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Critical Shortage Warning</p>
                    <p className="text-xs font-bold text-white">Azithromycin 500mg (Est. 4 days left)</p>
                    <button className="mt-2 text-[9px] font-black uppercase tracking-widest text-zinc-900 bg-white px-3 py-1.5 rounded">Auto-Reorder</button>
                 </div>
                 <div className="p-3 bg-zinc-950/50 rounded-lg">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Stable Inventory</p>
                    <p className="text-xs font-medium text-zinc-400">IV Fluids, Syringes, Generic Analgesics.</p>
                 </div>
              </div>
           </div>

           {/* System Intelligence */}
           <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-white/5">
                 <BrainCircuit size={14} className="text-indigo-400" /> System Intelligence
              </h3>
              <div className="space-y-4 font-mono text-xs">
                 <div className="flex gap-3">
                    <span className="text-zinc-600">[{timeString}]</span>
                    <p className="text-zinc-400 flex-1">Pharmacy API sync latency (2.4s). <span className="text-emerald-500">Healed.</span></p>
                 </div>
                 <div className="flex gap-3">
                    <span className="text-zinc-600">[{timeString}]</span>
                    <p className="text-zinc-400 flex-1">Database Shard 04 optimization complete.</p>
                 </div>
                 <div className="flex gap-3">
                    <span className="text-zinc-600">[{timeString}]</span>
                    <p className="text-zinc-400 flex-1">Nightly EMR backup sequence pending...</p>
                 </div>
              </div>
           </div>

        </section>

      </main>
      
    </div>
  );
}
