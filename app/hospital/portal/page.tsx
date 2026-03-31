'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { Shield, Key, Database, Activity, Lock, ArrowRight, Building2, Globe, Stethoscope, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

// ── SESSION HELPERS ──────────────────────────────────────────────────────────
function getInitialApiKey() {
  if (typeof window === 'undefined') return '';
  const fromLogin = sessionStorage.getItem('portal_api_key');
  if (fromLogin) { sessionStorage.removeItem('portal_api_key'); return fromLogin; }
  return 'demo_hospital_key_2024';
}
function getInitialAuthStep(): 'enter' | 'authenticated' {
  if (typeof window === 'undefined') return 'enter';
  return sessionStorage.getItem('portal_api_key') ? 'authenticated' : 'enter';
}
function getSessionBranding() {
  if (typeof window === 'undefined') return { name: '', logo: '', city: '' };
  return {
    name: sessionStorage.getItem('portal_hospital_name') || '',
    logo: sessionStorage.getItem('portal_logo_url') || '',
    city: sessionStorage.getItem('portal_city') || '',
  };
}

// ── CONSTANTS ───────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'gastro', label: 'Acute Gastroenteritis', icdCode: 'K52.9',
    specialty: 'Internal Medicine', icon: '🦠',
    severity: 'Moderate', severityStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    diagnosis: 'Acute Gastroenteritis',
    symptoms: ['Diarrhea', 'Vomiting', 'Fever', 'Dehydration'],
    medicines: [
      { name: 'Azithromycin 500mg', dosage: '1 tablet daily', instructions: 'Take for 3 days' },
      { name: 'Paracetamol 500mg', dosage: '1 tablet TDS',    instructions: 'As needed for fever' },
      { name: 'ORS Sachets',        dosage: 'As required',     instructions: 'After every loose motion' },
    ],
  },
  {
    id: 'dengue', label: 'Dengue Fever (NS1+)', icdCode: 'A90',
    specialty: 'Infectious Disease', icon: '🩺',
    severity: 'High', severityStyle: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    diagnosis: 'Dengue Fever (NS1 Positive)',
    symptoms: ['High Fever', 'Body Rash', 'Joint Pain', 'Headache'],
    medicines: [
      { name: 'Paracetamol 650mg', dosage: '1 tablet SOS', instructions: 'Only for fever > 38.5°C' },
      { name: 'Cetirizine 10mg',   dosage: '1 tablet at night', instructions: 'For rash/itching' },
    ],
  },
  {
    id: 'viral', label: 'Viral URTI', icdCode: 'J06.9',
    specialty: 'General Medicine', icon: '💊',
    severity: 'Mild', severityStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    diagnosis: 'Viral Upper Respiratory Tract Infection',
    symptoms: ['Sore Throat', 'Runny Nose', 'Mild Fever', 'Cough'],
    medicines: [
      { name: 'Azithromycin 250mg',        dosage: '1 tablet OD',  instructions: 'Take for 5 days' },
      { name: 'Cetirizine 5mg',             dosage: '1 tablet at bed', instructions: 'For nasal congestion' },
      { name: 'Dextromethorphan Syrup 10ml', dosage: 'TDS',          instructions: 'After meals' },
    ],
  },
];

const RECORD_TYPES = ['Prescription', 'Discharge Summary', 'Lab Report', 'Diagnosis Note', 'Imaging Report', 'OPD Note', 'Referral Letter'];

type Hospital = { hospital_id: string; name: string; city: string; verified_at: string };
type Medicine = { name: string; dosage: string; instructions: string };

const EMPTY_RECORD = {
  diagnosis:  '',
  symptoms:   [''] as string[],
  medicines:  [{ name: '', dosage: '', instructions: '' }] as Medicine[],
  notes:      '',
  doctor:     '',
  recordType: 'Prescription',
};

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function HospitalSyncPortal() {
  const [apiKey, setApiKey]         = useState(getInitialApiKey);
  const [authStep, setAuthStep]     = useState<'enter' | 'authenticated'>(getInitialAuthStep);
  const [authError, setAuthError]   = useState('');
  const [authLoading, setAuthLoad]  = useState(false);

  const [branding] = useState(getSessionBranding);
  const [hospitals, setHospitals]         = useState<Hospital[]>([]);
  const [loadingHosp, setLoadingHosp]     = useState(false);
  const [selectedHospIdx, setHospIdx]     = useState(0);

  const [abhaId, setAbhaId] = useState('');
  const [email, setEmail]   = useState('');
  const [rec, setRec]       = useState(EMPTY_RECORD);
  const [activeTemplateId, setActiveTemplate] = useState<string | null>(null);

  const [showTemplates, setShowTemplates] = useState(false);
  const [syncStatus, setSyncStatus]       = useState<string | null>(null);
  const [syncError, setSyncError]         = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);

  const hospital     = hospitals[selectedHospIdx];
  const hospitalName = branding.name || hospital?.name || 'Institutional';
  const hospitalLogo = branding.logo || '';
  const today        = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (authStep !== 'authenticated') return;
    setLoadingHosp(true);
    fetch('/api/hospital/list')
      .then(r => r.json())
      .then(d => setHospitals(d.hospitals || []))
      .catch(() => setHospitals([]))
      .finally(() => setLoadingHosp(false));
  }, [authStep]);

  // Handlers
  const applyTemplate = (tmpl: any) => {
    setRec({
      diagnosis:  tmpl.diagnosis,
      symptoms:   [...tmpl.symptoms],
      medicines:  tmpl.medicines.map((m: any) => ({ ...m })),
      notes:      rec.notes,
      doctor:     rec.doctor,
      recordType: rec.recordType,
    });
    setActiveTemplate(tmpl.id);
    setShowTemplates(false);
  };

  const clearTemplate = () => {
    setRec(EMPTY_RECORD);
    setActiveTemplate(null);
  };

  const setSymptom = (i: number, v: string) => setRec(r => { 
    const s = [...r.symptoms]; s[i] = v; return { ...r, symptoms: s }; 
  });
  const addSymptom = () => setRec(r => ({ ...r, symptoms: [...r.symptoms, ''] }));
  const removeSymptom = (i: number) => setRec(r => { 
    const s = r.symptoms.filter((_, idx) => idx !== i); 
    return { ...r, symptoms: s.length ? s : [''] }; 
  });

  const setMed = (i: number, field: keyof Medicine, v: string) => setRec(r => { 
    const m = r.medicines.map((med, idx) => idx === i ? { ...med, [field]: v } : med); 
    return { ...r, medicines: m }; 
  });
  const addMed = () => setRec(r => ({ ...r, medicines: [...r.medicines, { name: '', dosage: '', instructions: '' }] }));
  const removeMed = (i: number) => setRec(r => { 
    const m = r.medicines.filter((_, idx) => idx !== i); 
    return { ...r, medicines: m.length ? m : [{ name: '', dosage: '', instructions: '' }] }; 
  });

  const handleSync = async () => {
    if (!abhaId && !email) { setSyncError('Missing identifier.'); return; }
    if (!rec.diagnosis.trim()) { setSyncError('Missing diagnosis.'); return; }
    
    setLoading(true); setSyncStatus(null); setSyncError(null);
    try {
      const payload = {
        abha_id: abhaId || undefined,
        patient_email: email || undefined,
        records: [{
          file_name: `${rec.recordType} — ${rec.diagnosis} — ${today}`,
          diagnosis: [rec.diagnosis],
          symptoms: rec.symptoms.filter(s => s.trim()),
          medicines: rec.medicines.filter(m => m.name.trim()).map(m => m.name),
          dosage: rec.medicines.filter(m => m.name.trim()).map(m => m.dosage),
          doctor: rec.doctor || hospitalName,
          notes: rec.notes,
        }],
      };
      const res = await fetch('/api/hospital/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setSyncStatus(data.message);
    } catch (err: any) { setSyncError(err.message); }
    finally { setLoading(false); }
  };

  /*─────────────────────────────────  VIEW LOGIC  ─────────────────────────────*/
  if (authStep === 'enter') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 lg:p-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.3] pointer-events-none select-none z-0">
          <div className="absolute top-1/2 -left-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-1/2 -right-1/4 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[160px]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md space-y-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-[32px] bg-zinc-900/50 flex items-center justify-center border border-indigo-500/10 shadow-2xl">
               <BrandLogo variant="icon" size={56} />
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                <Database size={12} strokeWidth={3} />
                Infrastructure Tier Gateway
              </div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-white uppercase leading-none">
                Institutional <br /> <span className="text-zinc-600">Synchronization.</span>
              </h1>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/5 blur-2xl group-focus-within:bg-indigo-500/10 transition-colors" />
              <div className="relative space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Institutional API Token</label>
                <div className="relative">
                   <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                   <input 
                      type="password" 
                      placeholder="IAT_••••••••••••••••" 
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') setAuthStep('authenticated'); }}
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-14 pr-5 py-5 text-white font-mono text-lg placeholder-zinc-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition" 
                   />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setAuthStep('authenticated')}
              disabled={authLoading}
              className="w-full bg-white hover:bg-zinc-100 text-zinc-950 h-16 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              {authLoading ? 'Orchestrating...' : 'Establish Secure Node'}
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
             <Link href="/hospital/register" className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 transition-all group">
                <Building2 size={20} className="text-zinc-600 group-hover:text-indigo-400 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Enrollment</p>
                <p className="text-[9px] font-medium text-zinc-500">New node registration.</p>
             </Link>
             <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                <Globe size={20} className="text-zinc-600 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Protocol</p>
                <p className="text-[9px] font-medium text-zinc-500">FHIR R4 Compliant.</p>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-[1600px] mx-auto w-full p-6 lg:p-10 space-y-8">
        
        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-indigo-500/10 shadow-2xl">
              {hospitalLogo ? <img src={hospitalLogo} className="w-full h-full object-contain p-2" /> : <BrandLogo variant="icon" size={40} />}
            </div>
                 <div className="flex flex-col sm:flex-row items-center gap-3">
                    <h1 className="text-xl font-extrabold tracking-tighter text-white">{hospitals[selectedHospIdx]?.name || 'Hospital Terminal'}</h1>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Node Verified
                    </span>
                 </div>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sovereign institutional hub</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase text-zinc-600">Facility Cluster</p>
                {hospitals.length > 0 ? (
                  <select value={selectedHospIdx} onChange={e => setHospIdx(Number(e.target.value))} className="bg-zinc-800/80 border border-white/5 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none">
                    {hospitals.map((h, i) => <option key={h.hospital_id} value={i} className="bg-zinc-900">{h.name}</option>)}
                  </select>
                ) : <p className="text-sm font-bold text-zinc-500">Standalone Node</p>}
             </div>
             <button onClick={() => setAuthStep('enter')} className="p-3 rounded-xl bg-zinc-800/50 border border-white/5 text-zinc-500 hover:text-white transition"><Lock size={18} /></button>
          </div>
        </motion.div>

        {/* ALERTS */}
        <AnimatePresence>
          {syncStatus && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-3">
              <CheckCircle2 size={16} /> {syncStatus}
            </motion.div>
          )}
          {syncError && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3">
              <AlertCircle size={16} /> {syncError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GRID */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* LEFT */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Globe size={20} /></div>
                <div><p className="text-[10px] font-black uppercase text-zinc-500">Patient Resolver</p><p className="text-sm font-bold text-white">Identity Matrix</p></div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-zinc-600 px-1">ABHA ID</label><input type="text" value={abhaId} onChange={e=>setAbhaId(e.target.value)} placeholder="12-3456-7890-1234" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white font-mono text-sm outline-none" /></div>
                <div className="flex items-center gap-4"><div className="flex-1 h-px bg-white/5" /><span className="text-[9px] font-black text-zinc-800 uppercase">Or</span><div className="flex-1 h-px bg-white/5" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-zinc-600 px-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="identity@node.health" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm outline-none" /></div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Shield size={20} /></div>
                <div><p className="text-[10px] font-black uppercase text-zinc-500">Origin Attribution</p><p className="text-sm font-bold text-white">Verification</p></div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-zinc-600 px-1">Practitioner Signature</label><input type="text" value={rec.doctor} onChange={e=>setRec(r=>({...r, doctor:e.target.value}))} placeholder="Dr. Signature" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm outline-none" /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-zinc-600 px-1">Payload Type</label>
                  <select value={rec.recordType} onChange={e=>setRec(r=>({...r, recordType:e.target.value}))} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm outline-none appearance-none cursor-pointer">
                    {RECORD_TYPES.map(t=><option key={t} className="bg-zinc-900">{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-8 space-y-10 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400"><Activity size={Activity === undefined ? 20 : 20} /></div>
                   <div><p className="text-[10px] font-black uppercase text-zinc-500">Payload Assembly</p><p className="text-sm font-bold text-white">Clinical Parameters</p></div>
                </div>
                <div className="flex items-center gap-3">
                   {activeTemplateId && <button onClick={clearTemplate} className="text-[10px] font-black bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-2 rounded-xl">Reset</button>}
                   <button onClick={() => setShowTemplates(v => !v)} className={`text-[10px] font-black px-5 py-3 rounded-xl transition-all ${showTemplates ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Protocols</button>
                </div>
              </div>

              <AnimatePresence>
                {showTemplates && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-white/5 pb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                       {TEMPLATES.map(t => (
                         <button key={t.id} onClick={() => applyTemplate(t)} className="text-left p-4 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-indigo-500/30 transition-all">
                            <span className="text-xl mb-2 block">{t.icon}</span>
                            <p className="text-xs font-black text-white uppercase mb-1">{t.label}</p>
                            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{t.icdCode}</p>
                         </button>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase text-zinc-500 px-1">Primary Diagnosis</label>
                  <input type="text" value={rec.diagnosis} onChange={e=>setRec(r=>({...r, diagnosis:e.target.value}))} placeholder="Diagnosis..." className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-5 text-white text-lg font-black tracking-tight outline-none" />
                </div>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1"><label className="text-[10px] font-black uppercase text-zinc-500">Symptoms</label><button onClick={addSymptom} className="text-[10px] font-black text-indigo-400 uppercase">Add</button></div>
                    <div className="space-y-2">
                       {rec.symptoms.map((s, i) => (
                         <div key={i} className="flex gap-2">
                           <input type="text" value={s} onChange={e=>setSymptom(i, e.target.value)} className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 outline-none" />
                           {rec.symptoms.length > 1 && <button onClick={()=>removeSymptom(i)} className="text-zinc-700 hover:text-rose-500">✕</button>}
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-zinc-500 px-1">Institutional Notes</label>
                    <textarea value={rec.notes} onChange={e=>setRec(r=>({...r, notes:e.target.value}))} rows={4} placeholder="Notes..." className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-300 outline-none resize-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1"><label className="text-[10px] font-black uppercase text-zinc-500">Medication Regimen</label><button onClick={addMed} className="text-[10px] font-black text-cyan-400">Add</button></div>
                  <div className="grid gap-3">
                    {rec.medicines.map((m, i) => (
                      <div key={i} className="rounded-2xl border border-white/5 bg-zinc-950/30 p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-1 text-[10px] font-mono text-zinc-800">#{i+1}</div>
                        <div className="md:col-span-4"><input type="text" value={m.name} onChange={e=>setMed(i, 'name', e.target.value)} placeholder="Drug Name" className="w-full bg-transparent border-b border-zinc-800 py-1 text-sm text-white font-bold outline-none" /></div>
                        <div className="md:col-span-3"><input type="text" value={m.dosage} onChange={e=>setMed(i, 'dosage', e.target.value)} placeholder="Dosage" className="w-full bg-transparent border-b border-zinc-800 py-1 text-sm text-zinc-400 outline-none" /></div>
                        <div className="md:col-span-3"><input type="text" value={m.instructions} onChange={e=>setMed(i, 'instructions', e.target.value)} placeholder="Inst." className="w-full bg-transparent border-b border-zinc-800 py-1 text-sm text-zinc-500 outline-none" /></div>
                        <div className="md:col-span-1 text-right">{rec.medicines.length > 1 && <button onClick={()=>removeMed(i)} className="text-zinc-800 hover:text-rose-500">✕</button>}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button onClick={handleSync} disabled={loading} className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white h-16 px-12 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-500/20">
                    {loading ? 'Propagating...' : 'Synchronize Identity'} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
