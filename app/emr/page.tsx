'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { Shield, Key, FileText, Printer, Save, CheckCircle2, AlertCircle, LayoutDashboard, Database, Activity, User, Mail, Building2, Stethoscope, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// ── TYPES ──────────────────────────────────────────────────────────────────
interface Medicine { name: string; dosage: string; instructions: string; }

// ── A4 PREVIEW MODAL ────────────────────────────────────────────────────────
function A4Preview({ 
  open, onClose, onPrint, patientId, patientEmail, doctorName, hospitalName, docType, symptoms, diagnosis, medicines, dosage, logoUrl 
}: any) {
  if (!open) return null;
  const parseCSV = (s: string) => s.split(',').map(x=>x.trim()).filter(Boolean);
  const parseLines = (s: string) => s.split(/\r?\n|,/).map(x=>x.trim()).filter(Boolean);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-start justify-center overflow-y-auto py-12 px-6" onClick={e=>e.target === e.currentTarget && onClose()}>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-zinc-900/80 border border-white/5 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-2xl">
         <button onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition">✕ Close</button>
         <div className="w-px h-4 bg-white/5" />
         <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Institutional A4 Preview</span>
         <div className="w-px h-4 bg-white/5" />
         <button onClick={onPrint} className="text-[10px] font-black uppercase tracking-widest text-white hover:text-indigo-300 transition flex items-center gap-2"><Printer size={14} /> Print / Save PDF</button>
      </div>

      <div id="a4-report" className="relative w-[794px] min-h-[1123px] bg-white text-zinc-950 p-[56px] shadow-[0_40px_120px_rgba(0,0,0,0.8)] rounded-sm mt-8 origin-top scale-90 sm:scale-100">
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center -rotate-30 overflow-hidden font-black text-[80px] tracking-widest">AYUSHALERT · EMR</div>
         <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start border-b-2 border-indigo-500 pb-6 mb-8">
               <div className="flex items-center gap-4">
                  {logoUrl ? <img src={logoUrl} className="h-16 object-contain" /> : <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-serif">Rx</div>}
                  <div>
                     <h2 className="text-xl font-black tracking-tight leading-none uppercase">{hospitalName || 'Institutional Health Node'}</h2>
                     <p className="text-sm font-bold text-zinc-500 mt-1">{doctorName}</p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="inline-block px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 text-xs font-black uppercase tracking-widest mb-2">{docType}</div>
                  <p className="text-[10px] font-bold text-zinc-400">DATE: {dateStr}</p>
                  <p className="text-[10px] font-bold text-zinc-400">{timeStr}</p>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-6 bg-zinc-50 border border-zinc-100 p-6 rounded-xl mb-10">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Universal ABHA Identifier</p>
                  <p className="text-xs font-black font-mono">{patientId || '—'}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Identity email</p>
                  <p className="text-xs font-bold">{patientEmail || '—'}</p>
               </div>
               <div className="text-right space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Security Profile</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Infrastructure</p>
               </div>
            </div>

            <div className="flex-1 space-y-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-4"><div className="flex-1 h-px bg-zinc-100" /><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Clinical Observations</p><div className="flex-1 h-px bg-zinc-100" /></div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Presenting Symptoms</p>
                        <div className="flex flex-wrap gap-2">{parseCSV(symptoms).map((s,i)=><span key={i} className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-600">{s}</span>)}</div>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Primary Diagnosis</p>
                        <div className="space-y-1">{parseCSV(diagnosis).map((d,i)=><p key={i} className="text-sm font-black border-l-4 border-indigo-500 pl-3 py-1 bg-indigo-50/50">{d}</p>)}</div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-4"><div className="flex-1 h-px bg-zinc-100" /><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pharmaceutical Regimen</p><div className="flex-1 h-px bg-zinc-100" /></div>
                  <table className="w-full text-left border-collapse">
                     <thead><tr className="border-b border-zinc-200"><th className="py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Medicine / Compound</th><th className="py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Regimen / Frequency</th></tr></thead>
                     <tbody className="divide-y divide-zinc-100">
                        {parseCSV(medicines).map((m,i)=>(<tr key={i}><td className="py-4 text-xs font-black text-zinc-900">{m}</td><td className="py-4 text-xs font-medium text-zinc-500">{parseLines(dosage)[i] || '—'}</td></tr>))}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="pt-12 mt-12 border-t border-zinc-200 flex justify-between items-end">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Digitally Signed & Verified</p>
                  <p className="text-xs font-black">{doctorName}</p>
                  <p className="text-[10px] font-bold text-zinc-500">{hospitalName}</p>
                  <div className="w-40 border-b border-dashed border-zinc-400 h-10 mb-2" />
                  <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Security Hash: 0xEMR_VERIFIED_PROTOCOL</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Powered by</p>
                  <h3 className="text-xl font-black text-indigo-600 tracking-tighter uppercase leading-none">AyushAlert</h3>
                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">Infrastructure Tier Health Data platform</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// ── MAIN EMR PORTAL ──────────────────────────────────────────────────────────
export default function EMRDashboard() {
  const router = useRouter();
  const [patientId, setPatientId] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Smith (Attending)');
  const [hospitalName, setHospitalName] = useState('Apollo Hospital');
  const [docType, setDocType] = useState('Prescription');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medicines, setMedicines] = useState('');
  const [dosage, setDosage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleLogoUpload = (e: any) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!patientId && !patientEmail) { setError('Patient identifier required.'); return; }
    if (!diagnosis && !symptoms && !medicines) { setError('Clinical parameters required.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/hospital/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'demo_hospital_key_2024' },
        body: JSON.stringify({ abha_id: patientId, patient_email: patientEmail, records: [{ diagnosis: diagnosis.split(','), symptoms: symptoms.split(','), medicines: medicines.split(','), dosage: dosage.split(','), doctor: `${doctorName} — ${hospitalName}`, file_name: `${docType} - ${new Date().toLocaleDateString()}` }] }),
      });
      if (!res.ok) throw new Error('Ingestion failed');
      setSuccess('EMR Node Propagated Successfully');
      setDiagnosis(''); setSymptoms(''); setMedicines(''); setDosage('');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* ── MESH BACKGROUND ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-violet-600/5 rounded-full blur-[160px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <A4Preview open={showPreview} onClose={()=>setShowPreview(false)} onPrint={()=>window.print()} patientId={patientId} patientEmail={patientEmail} doctorName={doctorName} hospitalName={hospitalName} docType={docType} symptoms={symptoms} diagnosis={diagnosis} medicines={medicines} dosage={dosage} logoUrl={logoUrl} />

      <div className="relative z-10 max-w-[1600px] mx-auto w-full px-6 lg:px-10 py-10 space-y-8 flex-1 flex flex-col">
        {/* HEADER */}
        <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-6 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-14 h-14 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-indigo-500/10 shadow-2xl shrink-0">
               <BrandLogo variant="icon" size={36} />
            </div>
            <div className="text-center sm:text-left">
               <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h1 className="text-xl font-extrabold tracking-tighter text-white">EMR Terminal</h1>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-400">Clinical Tier</span>
               </div>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Sovereign clinical identity Management</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 w-full lg:w-auto">
             <Link href="/" className="px-5 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition flex-1 sm:flex-none text-center">Home</Link>
             <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition flex-1 sm:flex-none text-center flex items-center justify-center gap-2">
                <LayoutDashboard size={14} /> Dashboard
             </Link>
             <div className="px-5 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center justify-center gap-2 flex-1 sm:flex-none">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Node Verified
             </div>
          </div>
        </motion.nav>

        {/* FEEDBACK BANNERS */}
        <AnimatePresence>
          {error && <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity:1, scale:1 }} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-black uppercase flex items-center gap-3"><AlertCircle size={18} /> {error}</motion.div>}
          {success && <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity:1, scale:1 }} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase flex items-center gap-3"><CheckCircle2 size={18} /> {success}</motion.div>}
        </AnimatePresence>

        <div className="grid lg:grid-cols-12 gap-8 flex-1">
          {/* LEFT PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-8 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><User size={20} /></div>
                  <div><p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Patient Resolver</p><p className="text-sm font-bold text-white uppercase">Identity Vector</p></div>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Universal ABHA Identifier</label><input type="text" value={patientId} onChange={e=>setPatientId(e.target.value)} placeholder="12-3456-7890-1234" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 transition" /></div>
                  <div className="flex items-center gap-4"><div className="flex-1 h-px bg-white/5" /><span className="text-[9px] font-black text-zinc-800 uppercase">Or</span><div className="flex-1 h-px bg-white/5" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Registered ID Email</label><input type="email" value={patientEmail} onChange={e=>setPatientEmail(e.target.value)} placeholder="identity@node.health" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 transition" /></div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { label: 'Patient Density', value: '142' },
                 { label: 'Vectors Signed', value: '318' },
                 { label: 'Clinical Loops', value: '84' },
                 { label: 'Infrastructure', value: 'Active' },
               ].map((m,i)=>(
                 <div key={i} className="p-5 rounded-2xl border border-white/5 bg-zinc-900/40 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{m.label}</p>
                    <p className="text-xl font-black text-white">{m.value}</p>
                 </div>
               ))}
            </div>

            <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-6 space-y-4">
               <div className="flex items-center justify-between"><h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Institutional Signature</h3><p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{logoUrl ? 'Customized' : 'Verified mark'}</p></div>
               {logoUrl ? <div className="p-3 bg-white rounded-xl border-4 border-indigo-500/20"><img src={logoUrl} className="max-h-12 object-contain mx-auto" /></div> : <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-indigo-500/30 transition bg-zinc-950/40 group"><FileText size={24} className="text-zinc-600 group-hover:text-indigo-400 mb-2 transition-colors" /><span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Drop hospital mark</span><input type="file" className="hidden" onChange={handleLogoUpload} /></label>}
            </div>
          </div>

          {/* RIGHT PANEL: CHARTING FORM */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/50 overflow-hidden flex flex-col h-full shadow-2xl">
               <div className="bg-white/5 p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20"><Stethoscope size={20} /></div>
                     <div><h2 className="text-sm font-black text-white uppercase tracking-widest">Charting Protocol</h2><p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">EMR_VERIFIED_PROTOCOL_v3.4</p></div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                     <div className="space-y-0.5"><p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Provider Node</p><input value={doctorName} onChange={e=>setDoctorName(e.target.value)} className="bg-transparent text-[11px] font-black text-zinc-300 text-right uppercase border-none focus:ring-0 w-36 outline-none" /></div>
                     <div className="w-px h-8 bg-white/5 mx-2" />
                     <div className="space-y-0.5"><p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Facility Origin</p><input value={hospitalName} onChange={e=>setHospitalName(e.target.value)} className="bg-transparent text-[11px] font-black text-zinc-300 text-right uppercase border-none focus:ring-0 w-36 outline-none" /></div>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="p-8 space-y-10">
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Document Payload</label>
                        <select value={docType} onChange={e=>setDocType(e.target.value)} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-xs font-bold text-white outline-none cursor-pointer hover:bg-zinc-900 transition appearance-none">
                           <option>Prescription</option><option>Clinical Note</option><option>Imaging Ledger</option><option>Discharge Protocol</option>
                        </select>
                     </div>
                     <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Institutional Signature date</label>
                        <input disabled value={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-2xl px-5 py-4 text-xs font-mono text-zinc-600 cursor-not-allowed" />
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Primary Clinical indications <span className="font-mono text-zinc-700 font-bold ml-1">(CSV Protocol)</span></label>
                        <input value={symptoms} onChange={e=>setSymptoms(e.target.value)} placeholder="Fever, Dry Cough, Acute fatigue..." className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-bold text-white placeholder-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-inner" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Verified Clinical Diagnosis <span className="font-mono text-zinc-800 font-bold ml-1">(REQUIRED)</span></label>
                        <input value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} placeholder="Institutional Diagnostic Summary..." className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-lg font-black text-white tracking-tight placeholder-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-inner" />
                     </div>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Pharmaceutical Regimen</label><textarea value={medicines} onChange={e=>setMedicines(e.target.value)} placeholder="Drug Name / Salt (CSV)..." rows={4} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-xs font-bold text-zinc-300 placeholder-zinc-800 outline-none resize-none focus:border-indigo-500/30 transition shadow-inner" /></div>
                        <div className="space-y-3"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Dosage Frequency Instructions</label><textarea value={dosage} onChange={e=>setDosage(e.target.value)} placeholder="Dosage (CSV matched to medicines)..." rows={4} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-xs font-bold text-zinc-300 placeholder-zinc-800 outline-none resize-none focus:border-indigo-500/30 transition shadow-inner" /></div>
                     </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-white/5">
                     <button type="button" onClick={()=>setShowPreview(true)} className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-zinc-800/80 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-700 transition shadow-xl">📄 Intelligence Preview</button>
                     <button type="submit" disabled={loading} className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                        {loading ? 'Propagating...' : <>Commit Identity Vector <ArrowRight size={18} /></>}
                     </button>
                  </div>
               </form>
            </div>
          </div>
        </div>

        {/* PHASE 2 */}
         <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-8 space-y-6">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex flex-col sm:flex-row items-center justify-between gap-4">Infrastructure Roadmap <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">Phase 2.0</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {['Billing Protocol Alpha', 'Pharmacy direct-loop', 'Scheduled Surveillance', 'Revenue Analytics v2'].map((item,i)=>(
                 <div key={i} className="p-5 rounded-2xl bg-zinc-950/50 border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition">
                    <p className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">{item}</p>
                    <ChevronRight size={14} className="text-zinc-800 group-hover:text-indigo-400 transition-colors" />
                 </div>
               ))}
            </div>
         </div>

        {/* FOOTER */}
        <footer className="pt-10 border-t border-white/5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
           <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] max-w-xl">
              Institutional clinical Management environment complying with ABDM R4 & DISHA security frameworks · encrypted node distribution enabled.
           </p>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Shield size={12} className="text-indigo-500" /><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">E2E Sovereign Security</p></div>
              <div className="flex items-center gap-2"><Database size={12} className="text-indigo-500" /><p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Live Node Verified</p></div>
           </div>
        </footer>
      </div>
    </div>
  );
}
