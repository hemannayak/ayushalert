'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Layers, Shield, LayoutGrid, Activity, User, LogOut, ChevronRight, Hash, ArrowRight, Database, Disc, Globe } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

// ── COMPONENTS ─────────────────────────────────────────────────────────────
function DashboardCard({ icon, title, description, link, accent = 'indigo', label }: any) {
  const accents: any = {
    indigo:  { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/5' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/5' },
    rose:    { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/5' },
    amber:   { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/5' },
    blue:    { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-blue-500/5' },
  };
  const theme = accents[accent] || accents.indigo;
  return (
    <motion.div whileHover={{ y: -5 }} className={`group relative p-8 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl flex flex-col items-start gap-4 hover:bg-zinc-900/60 transition-all duration-300 shadow-2xl ${theme.glow}`}>
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${theme.bg} ${theme.border} ${theme.text} group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <div className="space-y-1">
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{label}</p>
          <h2 className="text-xl font-black tracking-tighter text-white uppercase">{title}</h2>
       </div>
       <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-6">{description}</p>
       <Link href={link} className="w-full py-4 rounded-xl bg-zinc-950/50 border border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center gap-2">Initialize Protocol <ChevronRight size={14} /></Link>
    </motion.div>
  );
}

// ── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/patient/login'); return; }
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/patient/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setPatientData(await res.json());
        else { localStorage.removeItem('token'); router.push('/patient/login'); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Establishing Identity Link...</p>
    </div>
  );

  const handleLogout = () => { localStorage.removeItem('token'); router.push('/patient/login'); };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden text-white font-sans">
      {/* ── BACKGROUND ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto w-full p-6 lg:p-10 space-y-12 flex-1 flex flex-col">
        {/* HEADER */}
        <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
           <div className="flex flex-col sm:flex-row items-center gap-6 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-14 h-14 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-emerald-500/10 shadow-2xl shrink-0">
                 <BrandLogo variant="icon" size={36} />
              </div>
               <div className="space-y-0.5 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                     <h1 className="text-xl font-extrabold tracking-tighter text-white">Sovereign Identity</h1>
                     <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Identity Verified
                     </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Global Handshake Active</p>
               </div>
           </div>
           <div className="flex flex-wrap items-center justify-center gap-4 w-full lg:w-auto">
              <Link href="/" className="px-5 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition flex-1 sm:flex-none text-center">Home</Link>
              <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition flex-1 sm:flex-none text-center">Dashboard</Link>
              <button onClick={handleLogout} className="px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition flex-1 sm:flex-none text-center">Session Termination</button>
           </div>
        </motion.nav>

        {/* HERO SECTION */}
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative p-8 md:p-16 rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-4 text-center md:text-left">
                 <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase"><span className="text-zinc-600">Sovereign Node:</span> <br/><span className="break-words">{patientData?.name || 'Authorized User'}</span></h2>
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                     <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] flex items-center gap-2"><Disc size={12} className="text-emerald-500" /> Identity Hub Verified</p>
                     <div className="hidden sm:block w-px h-3 bg-white/10" />
                     <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] flex items-center gap-2 text-indigo-400"><Globe size={12} /> Decentralized Protocol</p>
                  </div>
              </div>
              <div className="bg-zinc-950/50 border border-white/5 p-6 sm:p-8 rounded-3xl space-y-6 w-full md:min-w-[280px] md:w-auto shadow-2xl backdrop-blur-xl">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Infrastructure ID (ABHA)</p>
                    <p className="text-xl sm:text-2xl font-black font-mono tracking-tighter text-emerald-400 break-all">
                       {patientData?.abha_id || 'Generating...'}
                    </p>
                 </div>
                 <div className="w-full h-px bg-white/5" />
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Identity Vector Node</p>
                    <p className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-widest break-all">{patientData?.patient_id}</p>
                 </div>
              </div>
           </div>
        </motion.header>

        {/* CORE PROTOCOLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 flex-1">
           <DashboardCard icon={<Layers size={24} />} title="Data Ingestion" label="Infrastructure Tier" description="Digitize and integrate clinical data into your unified longitudinal health record node." link="/patient/upload" accent="blue" />
           <DashboardCard icon={<Shield size={24} />} title="Access Hub" label="Sovereign Governance" description="Review and authorize consent requests from clinical stakeholders in real-time." link="/patient/requests" accent="emerald" />
           <DashboardCard icon={<LayoutGrid size={24} />} title="Identity Audit" label="Cryptographic demog" description="Audit your core demographics, regional registry status, and underlying security settings." link="/patient/profile" accent="indigo" />
           <DashboardCard icon={<Activity size={24} />} title="Health Intel" label="Telemetry Layer" description="Observe real-time population-level patterns enabled by the infrastructure's intelligence system." link="/analytics" accent="amber" />
        </div>

        {/* FOOTER */}
        <footer className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
           <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] max-w-xl text-center sm:text-left leading-relaxed">
              Unified health data framework for sovereign identity management · encrypted node distribution enabled through zero-knowledge data exchanges.
           </p>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Database size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Node Distribution Verified</p></div>
              <div className="flex items-center gap-2"><Shield size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">E2E Sovereign Security</p></div>
           </div>
        </footer>
      </div>
    </div>
  );
}
