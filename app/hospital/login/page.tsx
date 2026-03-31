'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { Shield, Mail, ArrowLeft, Fingerprint, Activity, Stethoscope, Database, Lock, AlertCircle, Clock, XCircle, Key, RefreshCcw } from 'lucide-react';

export default function HospitalLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [loginData, setLoginData] = useState<{ name: string; status: string; api_key: string | null; hospital_id: string; logo_url: string; } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/hospital/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin_email: email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Identity verification failed');

      localStorage.setItem('hospital_token',    data.token);
      localStorage.setItem('hospital_id',       data.hospital_id);
      localStorage.setItem('hospital_name',     data.name);
      localStorage.setItem('hospital_logo_url', data.logo_url || '');
      if (data.api_key) localStorage.setItem('hospital_api_key', data.api_key);

      if (data.status === 'verified' && data.api_key) {
        sessionStorage.setItem('portal_api_key',     data.api_key);
        sessionStorage.setItem('portal_hospital_name', data.name);
        sessionStorage.setItem('portal_logo_url',    data.logo_url || '');
        sessionStorage.setItem('portal_city',        data.city || '');
        router.push('/hospital/portal');
      } else { setLoginData(data); }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (loginData && loginData.status !== 'verified') {
    const isPending  = loginData.status === 'pending';
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white font-sans">
        <div className="absolute inset-0 opacity-[0.2] pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[140px]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-lg text-center space-y-8">
           <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-3xl border ${isPending ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-xl shadow-rose-500/10'}`}>
              {isPending ? <Clock size={32} /> : <XCircle size={32} />}
           </div>
           <div className="rounded-3xl sm:rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />
              <div className="space-y-1">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{loginData.name}</h2>
                 <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isPending ? 'text-amber-500' : 'text-rose-500'}`}>{isPending ? 'Verification Protocol Active' : 'Access Terminated'}</p>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                 {isPending ? 'Your institutional application is currently undergoing manual audit by the infrastructure governance team. Node activation will occur upon verification.' : 'Your institutional application did not meet the sovereign security standards for node activation. Please contact terminal support.'}
              </p>
              <div className="pt-6 border-t border-white/5">
                 <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Node ID: <span className="text-zinc-500">{loginData.hospital_id}</span></p>
              </div>
           </div>
           <button onClick={() => setLoginData(null)} className="text-[10px] font-black text-zinc-700 uppercase tracking-widest hover:text-white transition border-b border-zinc-900 hover:border-zinc-500 pb-1">Abort & Return to Gateway</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white font-sans">
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-violet-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md space-y-10">
        <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                <Database size={12} strokeWidth={3} />
                Institutional Gateway
              </div>
              <h1 className="text-5xl font-extrabold tracking-tighter leading-[0.85] text-white uppercase">
                Institutional <br /> 
                <span className="text-zinc-600">Vault Access.</span>
              </h1>
            </div>
          </motion.div>

        <form onSubmit={handleLogin} className="rounded-3xl sm:rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-8 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-white/5 group-hover:bg-indigo-500/20 transition-all" />
           
           {error && <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase flex items-center gap-3 animate-in shake-200"><AlertCircle size={14} /> {error}</div>}

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Admin Credential (Email)</label>
                 <div className="relative">
                    <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" />
                    <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@institutional.hub" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition placeholder-zinc-800" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Vault Access Key (Password)</label>
                 <div className="relative">
                    <Key size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" />
                    <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition placeholder-zinc-800" />
                 </div>
              </div>
           </div>

           <button type="submit" disabled={loading} className="w-full py-6 rounded-3xl bg-indigo-500 text-white text-[12px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-2xl shadow-indigo-500/30 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3">
              {loading ? <><RefreshCcw size={18} className="animate-spin" /> Authenticating...</> : <><Lock size={18} /> Initialize Session</>}
           </button>
        </form>

        <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4 group hover:bg-emerald-500/10 transition-all">
           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500"><Shield size={20} /></div>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Verified institutions automatically synchronize with the <span className="text-emerald-400">EMR clinical terminal</span>.</p>
        </div>

        <p className="text-center text-[10px] text-zinc-600 font-black uppercase tracking-widest">
           Unregistered Node?{' '}
           <Link href="/hospital/register" className="text-indigo-400 hover:text-indigo-300 border-b border-indigo-900 transition">
              Provision Institutional Node →
           </Link>
        </p>
      </motion.div>
    </div>
  );
}
