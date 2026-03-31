'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Calendar, MapPin, Shield, Edit3, Save, X, ChevronLeft, Database, Fingerprint, Activity } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function PatientProfile() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ gender: '', dob: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/patient/login'); return; }
    fetch('/api/patient/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => {
        setPatient(data);
        setEditForm({ gender: data.gender || '', dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '', pincode: data.pincode || '' });
      })
      .catch(() => router.push('/patient/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/patient/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editForm) });
      if (!res.ok) throw new Error('Failed to update profile');
      setPatient(await res.json()); setIsEditing(false);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Retrieving Identity Parameters...</p>
    </div>
  );

  const isMissingDetails = !patient?.gender || !patient?.dob || !patient?.pincode;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden text-white">
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
                 <h1 className="text-2xl font-black tracking-tighter uppercase">Identity Profile</h1>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Sovereign demographic Audit</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                 <Shield size={12} /> Encrypted State: Nominal
              </div>
              {!isEditing && <button onClick={()=>setIsEditing(true)} className="px-6 py-3 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition shadow-xl shadow-white/5 flex items-center gap-2"><Edit3 size={14} /> Modify Parameters</button>}
           </div>
        </motion.div>

        {isMissingDetails && !isEditing && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
             <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(245,158,11,0.02)_10px,rgba(245,158,11,0.02)_20px)] pointer-events-none" />
             <div className="relative z-10 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-xl"><Activity size={28} /></div>
                <div>
                   <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Clinical Demographic Deficit</h3>
                   <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-relaxed max-w-lg">Universal health identifiers require optimized gender, DOB, and regional data for precise clinical reporting and institutional synchronization.</p>
                </div>
             </div>
             <button onClick={()=>setIsEditing(true)} className="relative z-10 px-8 py-4 rounded-2xl bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-amber-400 transition shadow-xl shadow-amber-500/20">Initialize Sync</button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
           {/* AVATAR & STATS */}
           <div className="lg:col-span-4 space-y-6">
              <div className="rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-10 flex flex-col items-center text-center space-y-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-white/5 group-hover:h-2 transition-all" />
                 <div className="w-32 h-32 rounded-[40px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-5xl font-black text-indigo-400 shadow-inner group-hover:scale-105 transition-transform duration-500">{patient?.name?.[0]?.toUpperCase()}</div>
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tighter uppercase">{patient?.name}</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{patient?.email}</p>
                 </div>
                 <div className="w-full pt-6 border-t border-white/5 flex items-center justify-center gap-6">
                    <div className="text-center space-y-1"><p className="text-[8px] font-black text-zinc-600 uppercase">Trust Node</p><p className="text-xs font-black text-emerald-400">Alpha-Tier</p></div>
                    <div className="w-px h-6 bg-white/5" />
                    <div className="text-center space-y-1"><p className="text-[8px] font-black text-zinc-600 uppercase">Registry</p><p className="text-xs font-black text-indigo-400">VFD</p></div>
                 </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-8 space-y-6">
                 <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-3"><Fingerprint size={14} className="text-indigo-400" /> Identity Telemetry</h3>
                 <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 space-y-1 group hover:border-indigo-500/20 transition-all cursor-default">
                       <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Network ID</p>
                       <p className="text-xs font-black font-mono text-zinc-300 uppercase tracking-widest">{patient?.patient_id}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 space-y-1 group hover:border-indigo-500/20 transition-all cursor-default">
                       <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Enrollment Date</p>
                       <p className="text-xs font-black font-mono text-zinc-300 uppercase tracking-widest">{patient?.created_at ? new Date(patient.created_at).toLocaleDateString() : '—'}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* FORM / DETAILS */}
           <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                 {isEditing ? (
                   <motion.div key="edit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-10 space-y-10 shadow-2xl">
                      <div className="space-y-10">
                         <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Gender Identity</label>
                               <select value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-black text-white outline-none cursor-pointer hover:bg-zinc-900 transition appearance-none">
                                  <option value="">Select Protocol</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                               </select>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Calendar Origin (DOB)</label>
                               <input type="date" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-inner" style={{ colorScheme: 'dark' }} />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Region Geocode (Pincode)</label>
                            <input type="text" placeholder="6-digit protocol" value={editForm.pincode} onChange={e => setEditForm({...editForm, pincode: e.target.value})} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-lg font-black text-white font-mono outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-inner placeholder-zinc-800" maxLength={6} />
                         </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
                         <button onClick={handleSave} disabled={saving} className="flex-1 px-8 py-5 rounded-3xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            {saving ? 'Transmitting Data...' : <><Save size={18} /> Commit Parameters</>}
                         </button>
                         <button onClick={() => { setIsEditing(false); setEditForm({ gender: patient.gender || '', dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '', pincode: patient.pincode || '' })}} disabled={saving} className="px-10 py-5 rounded-3xl bg-zinc-950/50 border border-zinc-800 text-[11px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition shadow-xl font-bold flex items-center justify-center gap-2"><X size={18} /> Abort</button>
                      </div>
                   </motion.div>
                 ) : (
                   <motion.div key="view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-4 overflow-hidden shadow-2xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {[
                           { label: 'Universal Health ID', value: patient?.abha_id || 'Not Synchronized', icon: <Database size={14} />, accent: 'emerald' },
                           { label: 'Cryptographic Mobile', value: patient?.mobile, icon: <Activity size={14} /> },
                           { label: 'Gender Node', value: patient?.gender || '—', icon: <User size={14} /> },
                           { label: 'Calendar Origin', value: patient?.dob ? new Date(patient.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—', icon: <Calendar size={14} /> },
                           { label: 'Registry Region', value: patient?.pincode || 'Not Mapped', icon: <MapPin size={14} /> },
                           { label: 'Ingestion Tier', value: 'Alpha Infrastructure', icon: <Shield size={14} />, accent: 'indigo' },
                         ].map(field => (
                           <div key={field.label} className="p-8 rounded-[32px] bg-zinc-950/30 border border-white/5 space-y-4 group hover:bg-zinc-900/60 transition-all duration-300">
                              <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{field.label}</span>
                                 <div className={`p-2 rounded-lg bg-white/5 text-zinc-700 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all`}>{field.icon}</div>
                              </div>
                              <p className={`text-base font-black uppercase tracking-tighter ${field.accent === 'emerald' ? 'text-emerald-400' : field.accent === 'indigo' ? 'text-indigo-400' : 'text-zinc-200'}`}>
                                 {field.value}
                              </p>
                           </div>
                         ))}
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* FOOTER */}
        <footer className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
           <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] max-w-xl text-center sm:text-left leading-relaxed">
              Sovereign demographic profile complying with ABDM R4 guidelines · Data parameters are encrypted and stored within your private identity node.
           </p>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Node Integrated</p></div>
              <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-indigo-500" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Cryptographically Secure</p></div>
           </div>
        </footer>
      </div>
    </div>
  );
}
