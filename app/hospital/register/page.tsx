'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { Building2, Shield, Lock, ChevronRight, AlertCircle, Clock, CheckCircle2, Mail, Key, MapPin, Phone, Globe, Upload, Trash2, ArrowRight, RefreshCcw } from 'lucide-react';


type Step = 'form' | 'success';

export default function HospitalRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [hospitalId, setHospitalId] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [form, setForm] = useState({ name: '', registration_id: '', license_number: '', address: '', city: '', phone: '', logo_url: '', admin_email: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Invalid artifact format.'); return; }
    if (file.size > 500 * 1024) { setError('Payload exceeds 500 KB limit.'); return; }
    const reader = new FileReader();
    reader.onload = () => { const res = reader.result as string; setLogoPreview(res); setForm(f => ({ ...f, logo_url: res })); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm_password) { setError('Credential mismatch.'); return; }
    if (form.password.length < 8) { setError('Security requirement: Min 8 chars.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/hospital/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Provisioning failed');
      setHospitalId(data.hospital_id); setSubmittedName(data.name || form.name); setStep('success');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white font-sans">
        <div className="absolute inset-0 opacity-[0.2] pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[140px]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-xl text-center space-y-10">
           <div className="w-24 h-24 rounded-[40px] mx-auto overflow-hidden border-4 border-emerald-500/10 shadow-2xl bg-zinc-900 flex items-center justify-center">
              {logoPreview ? <img src={logoPreview} alt="Node Logo" className="w-full h-full object-contain" /> : <div className="text-emerald-500 scale-150"><Building2 size={32} /></div>}
           </div>
           <div className="rounded-3xl sm:rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-8 sm:p-12 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20" />
              <div className="space-y-2">
                 <h2 className="text-3xl font-extrabold text-white uppercase tracking-tighter leading-none">Node Provisioned</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Institutional application submitted</p>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">Your institutional profile is currently undergoing manual verification. Node activation keys will be transmitted to the admin endpoint upon approval.</p>
              <div className="p-6 rounded-3xl bg-zinc-950/50 border border-white/5 text-center space-y-2">
                 <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">Sovereign Hospital ID</p>
                 <p className="text-lg font-black font-mono text-emerald-400">{hospitalId}</p>
              </div>
              <div className="space-y-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-left max-w-xs mx-auto border-t border-white/5 pt-6">
                 <div className="flex items-center gap-3">✓ Artifacts Transmitted</div>
                 <div className="flex items-center gap-3">✓ Identity Node Pending Audit</div>
                 <div className="flex items-center gap-3">✓ API Key Cycle Initialized</div>
              </div>
              <Link href="/hospital/login" className="block w-full py-5 rounded-3xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-2xl shadow-indigo-500/30 active:scale-95">Access Gateway Protocol <ArrowRight size={16} className="inline ml-2" /></Link>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-6 relative overflow-hidden text-white font-sans">
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-violet-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-3xl space-y-12">
        <div className="text-center space-y-4">
           <div className="w-20 h-20 rounded-3xl bg-zinc-900/50 flex items-center justify-center mx-auto shadow-2xl border border-indigo-500/10 group hover:scale-110 transition-transform">
              <BrandLogo variant="icon" size={48} />
           </div>
           <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tighter uppercase text-white leading-none">Institutional Enrollment</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Provisioning Sovereign identity nodes for hospitals</p>
           </div>
        </div>

        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
           <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mt-1"><Shield size={20} /></div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Institutional Integrity Check</p>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">Only ABDM-registered healthcare entities are eligible for node provisioning. All registration artifacts are cross-checked against national registries.</p>
           </div>
        </div>

        {error && <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase flex items-center gap-3 animate-in shake-200"><AlertCircle size={14} /> {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-10">
           {/* SECTION 1 */}
           <div className="rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-10 space-y-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5 group-hover:bg-indigo-500/20 transition-all" />
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <Building2 className="text-indigo-400" size={20} />
                 <h2 className="text-lg font-black tracking-tighter uppercase text-white">Institutional Identity</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Hospital Formal Title</label>
                    <input required type="text" placeholder="e.g. Apollo Health City" value={form.name} onChange={set('name')} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Govt. Registry ID</label>
                    <input required type="text" placeholder="TSMC/REG/YYYY" value={form.registration_id} onChange={set('registration_id')} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-xs font-black font-mono text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition placeholder-zinc-800" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Operational License</label>
                    <input type="text" placeholder="LIC-XXXX-YYYY" value={form.license_number} onChange={set('license_number')} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-xs font-black font-mono text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition placeholder-zinc-800" />
                 </div>
              </div>
              
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Institutional Artifact (Logo)</label>
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                       {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain" /> : <Building2 size={24} className="text-zinc-800" />}
                    </div>
                    <label className="flex-1 cursor-pointer group/upload">
                       <div className="rounded-2xl border-2 border-dashed border-zinc-800 p-6 text-center group-hover/upload:border-indigo-500/40 group-hover/upload:bg-zinc-900/50 transition-all">
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 group-hover/upload:text-indigo-400">{logoPreview ? '✓ Artifact Loaded' : '↑ Upload Institutional Mark'}</p>
                          <p className="text-[9px] text-zinc-800 font-bold uppercase tracking-widest">(PNG/JPG · Max 500KB)</p>
                       </div>
                       <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                 </div>
                 {logoPreview && <button type="button" onClick={()=>{setLogoPreview(''); setForm(f=>({...f, logo_url:''}));}} className="text-[9px] font-black text-rose-500 hover:text-rose-400 transition ml-2 uppercase flex items-center gap-2"><Trash2 size={10}/> Purge Artifact</button>}
              </div>
           </div>

           {/* SECTION 2 */}
           <div className="rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-10 space-y-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-hover:bg-violet-500/20 transition-all" />
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <MapPin className="text-violet-400" size={20} />
                 <h2 className="text-lg font-black tracking-tighter uppercase text-white">Geocode & Metadata</h2>
              </div>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Physical Coordinate (Address)</label>
                    <input required type="text" placeholder="Street, Area, City - Pin" value={form.address} onChange={set('address')} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-violet-500/40 transition" />
                 </div>
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Registry City</label>
                       <div className="relative">
                          <Globe size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" />
                          <input type="text" placeholder="Hyderabad" value={form.city} onChange={set('city')} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-[11px] font-black text-white uppercase outline-none focus:ring-2 focus:ring-violet-500/40 transition placeholder-zinc-800" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Comm-Channel (Phone)</label>
                       <div className="relative">
                          <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" />
                          <input type="tel" placeholder="+91-40-XXXX-XXXX" value={form.phone} onChange={set('phone')} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-[11px] font-black font-mono text-white outline-none focus:ring-2 focus:ring-violet-500/40 transition placeholder-zinc-800" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* SECTION 3 */}
           <div className="rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-10 space-y-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-1 h-full bg-white/5 group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <Key className="text-emerald-400" size={20} />
                 <h2 className="text-lg font-black tracking-tighter uppercase text-white">Vault Custodian</h2>
              </div>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Custodian Endpoint (Email)</label>
                    <div className="relative">
                       <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700" />
                       <input required type="email" placeholder="admin@institutional.hub" value={form.admin_email} onChange={set('admin_email')} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/40 transition placeholder-zinc-800" />
                    </div>
                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest pl-2">Provisioned API keys will be transmitted to this endpoint.</p>
                 </div>
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Vault Key (Password)</label>
                       <input required type="password" placeholder="Min 8 chars" value={form.password} onChange={set('password')} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/40 transition placeholder-zinc-800" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">Confirm Key</label>
                       <input required type="password" placeholder="Verify vault key" value={form.confirm_password} onChange={set('confirm_password')} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-emerald-500/40 transition placeholder-zinc-800" />
                    </div>
                 </div>
              </div>
           </div>

           <button type="submit" disabled={loading} className="w-full py-6 rounded-[32px] bg-white text-black text-[12px] font-black uppercase tracking-widest hover:bg-zinc-200 transition shadow-2xl shadow-white/5 active:scale-95 disabled:opacity-30">
              {loading ? <RefreshCcw size={20} className="animate-spin inline mr-2" /> : <CheckCircle2 size={20} className="inline mr-2" />} 
              {loading ? 'Transmitting Application...' : 'Commit Enrollment Data'}
           </button>
        </form>

        <p className="text-center text-[10px] text-zinc-600 font-black uppercase tracking-widest">
           Already Provisioned?{' '}
           <Link href="/hospital/login" className="text-indigo-400 hover:text-indigo-300 border-b border-indigo-900 transition">
              Access Institutional Vault →
           </Link>
        </p>
      </motion.div>
    </div>
  );
}
