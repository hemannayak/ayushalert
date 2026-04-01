'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { Shield, Key, Building2, Bell, CheckCircle2, AlertCircle, Clock, RefreshCcw, ChevronLeft, ArrowRight, Lock, Send, XCircle, Database } from 'lucide-react';
import Link from 'next/link';

// ── TYPES ──────────────────────────────────────────────────────────────────
interface ConsentRequest {
  request_id: string; hospital_id: string; status: string; created_at: string;
}

// ── MAIN REQUESTS PAGE ──────────────────────────────────────────────────────
export default function PatientRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const fetchRequests = async (isPolling = false) => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/patient/login'); return; }
    try {
      if (!isPolling) setLoading(true);
      const res = await fetch('/api/patient/consent-requests', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 401) { localStorage.removeItem('token'); router.push('/patient/login'); return; }
        throw new Error('Sync failed');
      }
      setRequests(await res.json());
      if (!isPolling) setError('');
    } catch (err: any) { if (!isPolling) setError(err.message); }
    finally { if (!isPolling) setLoading(false); }
  };

  useEffect(() => {
    setMounted(true); fetchRequests(false);
    const iv = setInterval(() => fetchRequests(true), 3000);
    return () => clearInterval(iv);
  }, [router]);

  if (!mounted) return null;

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Loading Access Requests...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden text-white font-sans">
      {/* ── BACKGROUND ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.2] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto w-full p-6 lg:p-10 space-y-8 flex-1">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
           <div className="flex items-center gap-6">
              <Link href="/patient/dashboard" className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition shadow-xl"><ChevronLeft size={20} /></Link>
              <div>
                 <h1 className="text-2xl font-black tracking-tighter uppercase">Access Requests</h1>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Manage doctor and hospital requests</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                 <RefreshCcw size={12} className="animate-spin-slow" /> Status: Live
              </div>
           </div>
        </motion.div>

        {error && <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-black uppercase flex items-center gap-3"><AlertCircle size={18} /> {error}</div>}

        <div className="space-y-6">
           {requests.length === 0 && !error && (
             <div className="p-20 rounded-[40px] border border-white/5 bg-zinc-900/20 backdrop-blur-xl text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center mx-auto text-zinc-800"><Bell size={32} /></div>
                <div className="space-y-1">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">No Active Requests</h3>
                   <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No doctors or hospitals are currently requesting access to your records.</p>
                </div>
             </div>
           )}

           <AnimatePresence>
             {requests.map((req, idx) => (
               <motion.div key={req.request_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <ConsentRequestCard request={req} />
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

        {/* FOOTER */}
        <footer className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
           <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] max-w-xl text-center sm:text-left leading-relaxed">
               Manage who can see your health records. You can approve or reject access requests at any time.
           </p>
           <div className="flex items-center gap-6">
               <div className="flex items-center gap-2"><Lock size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Secure Access</p></div>
               <div className="flex items-center gap-2"><Database size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Verified Requests</p></div>
           </div>
        </footer>
      </div>
    </div>
  );
}

// ── CONSENT CARD COMPONENT ───────────────────────────────────────────────────
function ConsentRequestCard({ request }: { request: ConsentRequest }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(request.status);
  const [msg, setMsg] = useState('');

  const sendOtp = async () => {
    setLoading(true); setMsg('');
    try {
      const res = await fetch('/api/patient/consent-otp', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ request_id: request.request_id }) });
      if (!res.ok) throw new Error('OTP failed');
      setOtpSent(true); setMsg('Verification code sent to your phone.');
    } catch (err: any) { setMsg(err.message); }
    finally { setLoading(false); }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (action === 'approve' && !otp.trim()) { setMsg('Verification code required.'); return; }
    setLoading(true); setMsg('');
    try {
      const res = await fetch('/api/patient/consent-action', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ request_id: request.request_id, action, otp: otp.trim() || undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setStatus(data.status);
      setMsg(action === 'approve' ? '✅ Access granted' : '❌ Request declined');
    } catch (err: any) { setMsg(err.message); }
    finally { setLoading(false); }
  };

  const statusCls = status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <div className={`rounded-[32px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-8 space-y-6 transition-all shadow-2xl relative overflow-hidden group`}>
       <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-all" />
       
       <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors"><Building2 size={24} /></div>
             <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tighter uppercase text-white">{request.hospital_id}</h3>
                <div className="flex items-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                   <p className="flex items-center gap-2"><Clock size={10} /> Received {new Date(request.created_at).toLocaleTimeString()}</p>
                   <p className="flex items-center gap-2"><Key size={10} /> ID: 0x{request.request_id.slice(0,8)}</p>
                </div>
             </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusCls}`}>{status}</span>
       </div>

       {msg && (
         <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${msg.includes('✅') ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : msg.includes('❌') ? 'bg-rose-500/5 text-rose-400 border-rose-500/10' : 'bg-indigo-500/5 text-indigo-400 border-indigo-500/10'}`}>
            {msg.includes('✅') ? <CheckCircle2 size={14} /> : msg.includes('❌') ? <XCircle size={14} /> : <Send size={14} />} {msg}
         </div>
       )}

       {status === 'pending' && (
         <div className="pt-6 border-t border-white/5 space-y-6">
               <span className="text-indigo-400">{request.hospital_id}</span> is requesting access to view your medical history and health records.
            {!otpSent ? (
               <button onClick={sendOtp} disabled={loading} className="w-full py-4 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50">Send Verification Code</button>
            ) : (
               <div className="space-y-4">
                  <input type="text" placeholder="0 0 0 0 0 0" value={otp} onChange={e=>setOtp(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center text-white font-mono text-xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-indigo-500/40 transition placeholder-zinc-800" />
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={()=>handleAction('approve')} disabled={loading} className="py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50">Approve</button>
                     <button onClick={()=>handleAction('reject')} disabled={loading} className="py-4 rounded-2xl bg-zinc-800 border border-white/5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-zinc-700 transition active:scale-95 disabled:opacity-50 uppercase">Decline</button>
                  </div>
               </div>
            )}
         </div>
       )}
    </div>
  );
}
