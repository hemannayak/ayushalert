'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { Shield, Mail, Key, Lock, AlertCircle, RefreshCcw, Database, Activity, Stethoscope, ArrowRight } from 'lucide-react';

export default function EMRLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/hospital/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin_email: email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Clinical identity verification failed');

      // Set session for EMR
      sessionStorage.setItem('portal_api_key',     data.api_key || '');
      sessionStorage.setItem('hospital_name',      data.name);
      sessionStorage.setItem('hospital_logo_url',  data.logo_url || '');
      
      // Also set localStorage for persistence in this module
      localStorage.setItem('hospital_name', data.name);
      localStorage.setItem('hospital_logo_url', data.logo_url || '');

      if (data.status === 'verified' && data.api_key) {
        router.push('/emr');
      } else {
        throw new Error('Institutional node not verified for EMR clinical terminal.');
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white font-sans">
      {/* ── BACKGROUND ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-violet-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            <Stethoscope size={12} strokeWidth={3} />
            Clinical Terminal
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter leading-[0.85] text-white uppercase">
            EMR Console <br /> 
            <span className="text-zinc-600">Secure Node.</span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Authorized clinical staff only. Use institutional credentials to initialize terminal session.</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-10 space-y-8 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-white/5 group-hover:bg-indigo-500/20 transition-all" />
           
           {error && <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase flex items-center gap-3 animate-in fade-in slide-in-from-top-2"><AlertCircle size={14} /> {error}</div>}

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Institutional Email</label>
                 <div className="relative">
                    <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" />
                    <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="staff@hospital.node" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition placeholder-zinc-800" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Access Key</label>
                 <div className="relative">
                    <Key size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" />
                    <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition placeholder-zinc-800" />
                 </div>
              </div>
           </div>

           <button type="submit" disabled={loading} className="w-full py-6 rounded-3xl bg-indigo-500 text-white text-[12px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-2xl shadow-indigo-500/30 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3">
              {loading ? <><RefreshCcw size={18} className="animate-spin" /> Verifying Clinical ID...</> : <><Shield size={18} /> Initialize EMR Session</>}
           </button>
        </form>

        <div className="flex items-center justify-between px-2">
           <Link href="/hospital/login" className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition">← Hospital Portal</Link>
           <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">TLS 1.3 Secure Node</p></div>
        </div>
      </motion.div>
    </div>
  );
}
