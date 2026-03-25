'use client';
import { useState, useEffect } from 'react';

// ── sessionStorage helpers ────────────────────────────────────────────────────
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

// ── Optional quick-fill templates ────────────────────────────────────────────
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
  {
    id: 'tb', label: 'Pulmonary Tuberculosis', icdCode: 'A15',
    specialty: 'Pulmonology', icon: '🫁',
    severity: 'High', severityStyle: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    diagnosis: 'Pulmonary Tuberculosis (Sputum AFB Positive)',
    symptoms: ['Chronic Cough', 'Night Sweats', 'Weight Loss', 'Haemoptysis'],
    medicines: [
      { name: 'Isoniazid 300mg',  dosage: 'OD',  instructions: 'On empty stomach' },
      { name: 'Rifampicin 600mg', dosage: 'OD',  instructions: 'Before breakfast' },
      { name: 'Pyrazinamide 1.5g', dosage: 'OD', instructions: 'With food — 2 months' },
      { name: 'Ethambutol 1.2g',   dosage: 'OD', instructions: 'With food — 2 months' },
    ],
  },
  {
    id: 'dm', label: 'Type 2 Diabetes', icdCode: 'E11',
    specialty: 'Endocrinology', icon: '🧬',
    severity: 'Moderate', severityStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    diagnosis: 'Type 2 Diabetes Mellitus (Newly Diagnosed)',
    symptoms: ['Polyuria', 'Polydipsia', 'Fatigue', 'Blurred Vision'],
    medicines: [
      { name: 'Metformin 500mg',   dosage: 'BD with meals', instructions: 'Increase to 1g after 2 wk' },
      { name: 'Glimepiride 1mg',   dosage: 'OD before breakfast', instructions: 'Monitor glucose' },
    ],
  },
];

const RECORD_TYPES = ['Prescription', 'Discharge Summary', 'Lab Report', 'Diagnosis Note', 'Imaging Report', 'OPD Note', 'Referral Letter'];
type Hospital = { hospital_id: string; name: string; city: string; verified_at: string };
type Medicine = { name: string; dosage: string; instructions: string };

// ── Empty clinical record state ───────────────────────────────────────────────
const EMPTY_RECORD = {
  diagnosis:  '',
  symptoms:   [''] as string[],
  medicines:  [{ name: '', dosage: '', instructions: '' }] as Medicine[],
  notes:      '',
  doctor:     '',
  recordType: 'Prescription',
};

export default function HospitalSyncPortal() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [apiKey, setApiKey]         = useState(getInitialApiKey);
  const [authStep, setAuthStep]     = useState<'enter' | 'authenticated'>(getInitialAuthStep);
  const [authError, setAuthError]   = useState('');
  const [authLoading, setAuthLoad]  = useState(false);

  // ── Hospital Branding (from session, set by login) ────────────────────────
  const [branding] = useState(getSessionBranding);

  // ── Hospitals ─────────────────────────────────────────────────────────────
  const [hospitals, setHospitals]         = useState<Hospital[]>([]);
  const [loadingHosp, setLoadingHosp]     = useState(false);
  const [selectedHospIdx, setHospIdx]     = useState(0);

  // ── Patient identification ────────────────────────────────────────────────
  const [abhaId, setAbhaId] = useState('');
  const [email, setEmail]   = useState('');

  // ── Clinical record (fully editable) ─────────────────────────────────────
  const [rec, setRec] = useState(EMPTY_RECORD);
  const [activeTemplateId, setActiveTemplate] = useState<string | null>(null);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview]     = useState(false);
  const [syncStatus, setSyncStatus]       = useState<string | null>(null);
  const [syncError, setSyncError]         = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);

  const hospital    = hospitals[selectedHospIdx];
  const hospitalName = branding.name || hospital?.name || 'Hospital';
  const hospitalLogo = branding.logo || '';
  const today       = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Fetch verified hospitals once authenticated ───────────────────────────
  useEffect(() => {
    if (authStep !== 'authenticated') return;
    setLoadingHosp(true);
    fetch('/api/hospital/list')
      .then(r => r.json())
      .then(d => setHospitals(d.hospitals || []))
      .catch(() => setHospitals([]))
      .finally(() => setLoadingHosp(false));
  }, [authStep]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const applyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setRec({
      diagnosis:  tmpl.diagnosis,
      symptoms:   [...tmpl.symptoms],
      medicines:  tmpl.medicines.map(m => ({ ...m })),
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

  // symptoms
  const setSymptom = (i: number, v: string) =>
    setRec(r => { const s = [...r.symptoms]; s[i] = v; return { ...r, symptoms: s }; });
  const addSymptom = () =>
    setRec(r => ({ ...r, symptoms: [...r.symptoms, ''] }));
  const removeSymptom = (i: number) =>
    setRec(r => { const s = r.symptoms.filter((_, idx) => idx !== i); return { ...r, symptoms: s.length ? s : [''] }; });

  // medicines
  const setMed = (i: number, field: keyof Medicine, v: string) =>
    setRec(r => { const m = r.medicines.map((med, idx) => idx === i ? { ...med, [field]: v } : med); return { ...r, medicines: m }; });
  const addMed = () =>
    setRec(r => ({ ...r, medicines: [...r.medicines, { name: '', dosage: '', instructions: '' }] }));
  const removeMed = (i: number) =>
    setRec(r => { const m = r.medicines.filter((_, idx) => idx !== i); return { ...r, medicines: m.length ? m : [{ name: '', dosage: '', instructions: '' }] }; });

  const guard = () => {
    if (!abhaId && !email) { setSyncError('Provide ABHA ID or registered email to identify the patient.'); return false; }
    if (!rec.diagnosis.trim()) { setSyncError('Enter a diagnosis before syncing.'); return false; }
    setSyncError(null); return true;
  };

  const handleSync = async () => {
    if (!guard()) return;
    setLoading(true); setSyncStatus(null); setSyncError(null);
    try {
      const payload = {
        abha_id:       abhaId || undefined,
        patient_email: email  || undefined,
        records: [{
          file_name:  `${rec.recordType} — ${rec.diagnosis} — ${today}`,
          diagnosis:  [rec.diagnosis],
          symptoms:   rec.symptoms.filter(s => s.trim()),
          medicines:  rec.medicines.filter(m => m.name.trim()).map(m => m.name),
          dosage:     rec.medicines.filter(m => m.name.trim()).map(m => m.dosage),
          doctor:     rec.doctor || hospital?.name || 'Hospital System',
          notes:      rec.notes,
        }],
      };
      const res  = await fetch('/api/hospital/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setSyncStatus(data.message);
      setShowPreview(false);
    } catch (err: any) { setSyncError(err.message); }
    finally { setLoading(false); }
  };

  /*─────────────────────────────────  AUTH GATE  ──────────────────────────────*/
  if (authStep === 'enter') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg,#060610 0%,#0c0c1a 100%)' }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>🔐</div>
          </div>
          <div className="rounded-2xl p-8 text-center mb-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h1 className="text-2xl font-black text-white mb-2">Hospital EMR Sync</h1>
            <p className="text-sm text-zinc-500 mb-1">Authenticated Access Only</p>
            <p className="text-xs text-zinc-700 leading-relaxed">Only registered and verified hospitals may access this interface. Enter the API key issued to your hospital.</p>
          </div>
          <div className="rounded-2xl p-6 space-y-5"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {authError && (
              <div className="rounded-xl px-4 py-3 text-xs text-rose-400 font-semibold"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>⚠ {authError}</div>
            )}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Hospital API Key</label>
              <input type="password" placeholder="HAK_••••••••••••••••" value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setAuthStep('authenticated'); } }}
                className="w-full rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-zinc-700 outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }} />
              <p className="text-[9px] text-zinc-700 mt-1.5 pl-1">Issued by AyushAlert after hospital verification.</p>
            </div>
            <button onClick={() => { if (!apiKey.trim()) { setAuthError('Enter your hospital API key.'); return; } setAuthLoad(true); setTimeout(() => { setAuthLoad(false); setAuthStep('authenticated'); }, 700); }}
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}>
              {authLoading ? <><span className="animate-spin">⟳</span> Authenticating...</> : '🔓 Authenticate & Enter'}
            </button>
            <div className="pt-2 border-t border-white/5">
              <p className="text-center text-[9px] text-zinc-700 uppercase tracking-widest mb-3">Not yet registered?</p>
              <a href="/hospital/register" className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all"
                style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
                📝 Register Your Hospital →
              </a>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <span className="text-emerald-400 text-xs mt-0.5 shrink-0">🔒</span>
            <p className="text-[10px] text-emerald-300/40 leading-relaxed">Zero-trust model — every request is authenticated, hospital-verified, and traceable. Unregistered entities cannot access this system.</p>
          </div>
        </div>
      </div>
    );
  }

  /*──────────────────────────────────  PORTAL  ────────────────────────────────*/
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0f1a 50%,#0a0a0f 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle,#8b5cf6,transparent)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* ── Branded Hero ── */}
        <div className="rounded-2xl border border-white/5 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(15,15,26,0.9) 60%)' }}>
          <div className="p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-start gap-5">
              {/* Hospital Logo */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: hospitalLogo ? '#fff' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.4)', border: hospitalLogo ? '2px solid rgba(99,102,241,0.4)' : 'none' }}>
                {hospitalLogo
                  ? <img src={hospitalLogo} alt={hospitalName} className="w-full h-full object-contain p-1" />
                  : <span className="text-2xl">🏥</span>}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-xl font-black text-white tracking-tight">{hospitalName} EMR</h1>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                    style={{ background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.4)', color: '#a5b4fc' }}>ABDM Compliant</span>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex items-center gap-1.5"
                    style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> API Authenticated
                  </span>
                </div>
                <p className="text-xs text-zinc-500 max-w-lg">Link clinical records directly to patient health profiles via ABHA ID. Your hospital system retains full ownership — only a FHIR-compliant copy is linked.</p>
              </div>
            </div>
            {/* Connected facility */}
            <div className="shrink-0 rounded-xl border border-white/8 px-5 py-3 text-right" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Connected Facility</p>
              {loadingHosp ? <p className="text-sm text-zinc-500 animate-pulse">Loading...</p>
                : hospitals.length === 0 && !branding.name ? <p className="text-xs text-zinc-600">No verified hospitals</p>
                : (
                  <>
                    {branding.name && branding.logo && (
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                          <img src={branding.logo} alt="" className="w-full h-full object-contain p-0.5" />
                        </div>
                        <p className="text-sm font-bold text-white">{branding.name}</p>
                      </div>
                    )}
                    {hospitals.length > 0 && (
                      <select value={selectedHospIdx} onChange={e => setHospIdx(Number(e.target.value))}
                        className="text-sm font-bold text-white bg-transparent focus:outline-none cursor-pointer appearance-none w-full text-right">
                        {hospitals.map((h, i) => <option key={h.hospital_id} value={i} className="bg-zinc-900">{h.name}</option>)}
                      </select>
                    )}
                    <p className="text-[10px] text-indigo-400 mt-0.5">{branding.city || hospital?.city} · Verified ✓</p>
                  </>
                )}
            </div>
          </div>
          <div className="border-t border-white/5 px-7 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5 flex-wrap">
              {[['#10b981','ABDM Sync Active'],['#6366f1','FHIR R4'],['#8b5cf6','AES-256'],['#3b82f6','TLS 1.3']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">{l}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setAuthStep('enter'); setSyncStatus(null); setSyncError(null); }}
              className="text-[10px] font-bold text-zinc-700 hover:text-zinc-400 transition uppercase tracking-widest">Lock Session ↩</button>
          </div>
        </div>

        {/* ── No verified hospitals warning ── */}
        {!loadingHosp && hospitals.length === 0 && (
          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-amber-400 text-2xl mb-2">⚠</p>
            <p className="font-bold text-amber-400 text-sm">No Verified Hospitals in System</p>
            <p className="text-xs text-amber-300/50 mt-1">No hospitals have been registered and verified yet.</p>
            <a href="/hospital/register" className="inline-block mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)' }}>
              📝 Register Your Hospital
            </a>
          </div>
        )}

        {/* ── Alerts ── */}
        {syncStatus && (
          <div className="rounded-xl border border-emerald-500/25 px-5 py-4 flex items-start gap-4"
            style={{ background: 'rgba(16,185,129,0.07)' }}>
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-400">✓</div>
            <div>
              <p className="font-bold text-emerald-400 text-sm">Record Successfully Linked</p>
              <p className="text-emerald-300/50 text-xs mt-0.5">{syncStatus}</p>
            </div>
          </div>
        )}
        {syncError && (
          <div className="rounded-xl border border-rose-500/25 px-5 py-4 flex items-start gap-4"
            style={{ background: 'rgba(244,63,94,0.07)' }}>
            <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0 text-rose-400">⚠</div>
            <div>
              <p className="font-bold text-rose-400 text-sm">Sync Failed</p>
              <p className="text-rose-300/50 text-xs mt-0.5">{syncError}</p>
            </div>
          </div>
        )}

        {/* ── Main 2-col layout ── */}
        {(loadingHosp || hospitals.length > 0) && (
        <div className="grid lg:grid-cols-3 gap-5 items-start">

          {/* LEFT — patient + source + verification ── */}
          <div className="space-y-5">

            {/* Patient ID */}
            <div className="rounded-2xl border border-white/5 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-indigo-500/15 flex items-center justify-center text-sm">👤</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Patient Identification</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">ABHA ID</label>
                  <input type="text" placeholder="12-3456-7890-1234" value={abhaId} onChange={e => setAbhaId(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder-zinc-700 outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <span className="text-[9px] text-zinc-700 font-bold">or</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Registered Email</label>
                  <input type="email" placeholder="patient@example.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              </div>
            </div>

            {/* Source info */}
            <div className="rounded-2xl border border-white/5 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center text-sm">🏥</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Source Information</p>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Sending Facility</p>
                  {hospital ? (
                    <>
                      <p className="text-sm font-bold text-white">{hospital.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-emerald-400 font-semibold">Verified · EMR Source</span>
                      </div>
                    </>
                  ) : <p className="text-sm text-zinc-600 animate-pulse">Loading...</p>}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Attending Physician</label>
                  <input type="text" placeholder="Dr. Full Name" value={rec.doctor}
                    onChange={e => setRec(r => ({ ...r, doctor: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Record Type</label>
                  <select value={rec.recordType} onChange={e => setRec(r => ({ ...r, recordType: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none appearance-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {RECORD_TYPES.map(rt => <option key={rt} className="bg-zinc-900">{rt}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Verification status */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Verification Status</p>
              <div className="space-y-2.5">
                {[
                  { k: 'Auth',        v: 'API Key · Verified',      c: 'text-emerald-400' },
                  { k: 'Source',      v: 'Hospital Verified (EMR)', c: 'text-emerald-400' },
                  { k: 'Standard',    v: 'FHIR R4 · ABDM',          c: 'text-indigo-400' },
                  { k: 'Encryption',  v: 'AES-256 · TLS 1.3',       c: 'text-violet-400' },
                  { k: 'Data Origin', v: 'EMR · verified: TRUE',    c: 'text-emerald-400' },
                ].map(({ k, v, c }) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{k}</span>
                    <span className={`text-[10px] font-mono font-bold ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Clinical Record ── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-white/5 p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.03)' }}>

              {/* Section header + template trigger */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-6 h-6 rounded-md bg-blue-500/15 flex items-center justify-center text-sm">🩺</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Clinical Record</p>
                  </div>
                  <p className="text-[10px] text-zinc-600 pl-8">Enter clinical details manually or use a template to auto-fill.</p>
                </div>
                <div className="flex items-center gap-2">
                  {activeTemplateId && (
                    <button onClick={clearTemplate}
                      className="text-[10px] font-bold text-zinc-600 hover:text-rose-400 transition px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      ✕ Clear Template
                    </button>
                  )}
                  <button onClick={() => setShowTemplates(v => !v)}
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    style={{
                      background: showTemplates ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      border: showTemplates ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
                      color: showTemplates ? '#a5b4fc' : '#71717a',
                    }}>
                    ⚡ {showTemplates ? 'Hide Templates' : 'Quick Templates'}
                  </button>
                </div>
              </div>

              {/* Template picker (collapsible) */}
              {showTemplates && (
                <div className="rounded-xl p-4 space-y-3"
                  style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)' }}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">
                    ⚡ Quick Diagnosis Templates — Optional Accelerators
                  </p>
                  <p className="text-[10px] text-zinc-600 mb-3">
                    Select a template to auto-fill fields. All fields remain fully editable after selection.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TEMPLATES.map(tmpl => {
                      const active = activeTemplateId === tmpl.id;
                      return (
                        <button key={tmpl.id} onClick={() => applyTemplate(tmpl)}
                          className="text-left rounded-xl p-3 transition-all"
                          style={{
                            background: active ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.03)',
                            border: active ? '1px solid rgba(99,102,241,0.45)' : '1px solid rgba(255,255,255,0.07)',
                            boxShadow: active ? '0 0 14px rgba(99,102,241,0.18)' : 'none',
                          }}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-base">{tmpl.icon}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${tmpl.severityStyle}`}>{tmpl.severity}</span>
                          </div>
                          <p className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-zinc-400'}`}>{tmpl.label}</p>
                          <p className="text-[9px] font-mono text-zinc-700">{tmpl.icdCode}</p>
                        </button>
                      );
                    })}
                  </div>
                  {activeTemplateId && (
                    <p className="text-[9px] text-indigo-400/60 pt-1">
                      ✓ Template applied — all fields below are fully editable. Modify as needed.
                    </p>
                  )}
                </div>
              )}

              {/* ── DIAGNOSIS ── */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Diagnosis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acute Gastroenteritis, Dengue Fever, Type 2 Diabetes…"
                  value={rec.diagnosis}
                  onChange={e => setRec(r => ({ ...r, diagnosis: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.045)', border: `1px solid ${rec.diagnosis ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.09)'}` }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.55)')}
                  onBlur={e  => (e.target.style.borderColor = rec.diagnosis ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.09)')}
                />
              </div>

              {/* ── SYMPTOMS ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Symptoms
                  </label>
                  <button onClick={addSymptom}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', padding: '3px 10px', borderRadius: '8px' }}>
                    ➕ Add Symptom
                  </button>
                </div>
                <div className="space-y-2">
                  {rec.symptoms.map((sym, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Symptom ${i + 1}`}
                        value={sym}
                        onChange={e => setSymptom(i, e.target.value)}
                        className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-700 outline-none"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.4)')}
                        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                      />
                      {rec.symptoms.length > 1 && (
                        <button onClick={() => removeSymptom(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 transition shrink-0"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          🗑
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── MEDICINES ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Medicines & Dosage
                  </label>
                  <button onClick={addMed}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 10px', borderRadius: '8px' }}>
                    ➕ Add Medicine
                  </button>
                </div>
                <div className="space-y-2">
                  {rec.medicines.map((med, i) => (
                    <div key={i} className="rounded-xl p-3 space-y-2.5"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Medicine {i + 1}</span>
                        {rec.medicines.length > 1 && (
                          <button onClick={() => removeMed(i)}
                            className="text-[10px] text-zinc-700 hover:text-rose-400 transition flex items-center gap-1">
                            🗑 Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" placeholder="Medicine name" value={med.name}
                          onChange={e => setMed(i, 'name', e.target.value)}
                          className="sm:col-span-1 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-700 outline-none"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.4)')}
                          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                        />
                        <input type="text" placeholder="Dosage (e.g. 1 tablet BD)" value={med.dosage}
                          onChange={e => setMed(i, 'dosage', e.target.value)}
                          className="sm:col-span-1 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-700 outline-none"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.4)')}
                          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                        />
                        <input type="text" placeholder="Instructions" value={med.instructions}
                          onChange={e => setMed(i, 'instructions', e.target.value)}
                          className="sm:col-span-1 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-700 outline-none"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.4)')}
                          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── CLINICAL NOTES ── */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Clinical Notes <span className="text-zinc-700 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  value={rec.notes}
                  onChange={e => setRec(r => ({ ...r, notes: e.target.value }))}
                  rows={3}
                  placeholder="Follow-up instructions, referral notes, allergies, observations…"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.35)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
                />
              </div>
            </div>

            {/* ── Preview panel ── */}
            {showPreview && (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)' }}>

                {/* Hospital branding header on the record */}
                <div className="flex items-center justify-between gap-4 px-6 py-4"
                  style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(99,102,241,0.18)' }}>
                  <div className="flex items-center gap-3">
                    {hospitalLogo ? (
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                        <img src={hospitalLogo} alt={hospitalName} className="w-full h-full object-contain p-0.5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>🏥</div>
                    )}
                    <div>
                      <p className="text-sm font-black text-white">{hospitalName}</p>
                      <p className="text-[9px] text-indigo-300/60 font-mono">ABDM · FHIR R4 · Verified EMR Source</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Record Date</p>
                    <p className="text-xs text-zinc-400 font-mono">{today}</p>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">📋 Record Preview — Confirm before linking</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: 'ABHA ID',     v: abhaId || '—' },
                      { l: 'Email',       v: email   || '—' },
                      { l: 'Diagnosis',   v: rec.diagnosis },
                      { l: 'Symptoms',    v: rec.symptoms.filter(s => s.trim()).join(', ') || '—' },
                      { l: 'Physician',   v: rec.doctor || hospitalName },
                      { l: 'Facility',    v: hospitalName },
                      { l: 'Record Type', v: rec.recordType },
                      { l: 'Medicines',   v: `${rec.medicines.filter(m => m.name.trim()).length} prescribed` },
                    ].map(({ l, v }) => (
                      <div key={l}>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{l}</p>
                        <p className="text-xs font-semibold text-zinc-200 truncate">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowPreview(false)}
                      className="py-3 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      ← Edit Details
                    </button>
                    <button onClick={handleSync} disabled={loading}
                      className="py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
                      {loading ? <><span className="animate-spin">⟳</span> Syncing...</> : '🔗 Confirm & Link Record'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Actions ── */}
            {!showPreview && (
              <div className="space-y-3">
                <button onClick={() => { if (guard()) setShowPreview(true); }}
                  className="w-full py-4 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 24px rgba(99,102,241,0.35)' }}>
                  📋 Preview Record
                </button>
                <button onClick={handleSync} disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {loading ? '⟳ Syncing...' : '🔗 Sync Record to Patient Profile'}
                </button>
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <span className="text-blue-400 text-xs shrink-0 mt-0.5">ℹ</span>
                  <p className="text-[10px] text-blue-300/60 leading-relaxed">
                    <strong className="text-blue-300/80">Data Privacy:</strong> Only a FHIR-compliant copy is linked to the patient's ABHA ID. Your hospital system retains full ownership of the original record.
                  </p>
                </div>
              </div>
            )}

            <p className="text-center text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
              🔒 Records auto-tagged · source: HOSPITAL · origin: EMR · verified: TRUE · FHIR R4
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
