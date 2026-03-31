'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { Activity, Shield, Key, User, Camera, LogOut, RefreshCcw, LayoutDashboard, Database, Lock, CheckCircle2, AlertCircle, Search, ChevronRight, FileText } from 'lucide-react';
import * as faceapi from 'face-api.js';
import Link from 'next/link';

// ── TYPES ──────────────────────────────────────────────────────────────────
interface Record {
  record_id: string; document_type: string; uploaded_at: string;
  source: string; confidence_score: number; verified: boolean;
  data_origin: string; doctor?: string; file_url?: string;
  structured_data?: any;
}

// ── COMPONENTS ─────────────────────────────────────────────────────────────
function ScannerOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
      <motion.div initial={{ top: '10%' }} animate={{ top: '80%' }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute left-4 right-4 h-1 bg-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.6)] blur-[1px]" />
    </div>
  );
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualPatientId, setManualPatientId] = useState('');
  const [scannedPatientId, setScannedPatientId] = useState<string | null>(null);
  const [consentRequestId, setConsentRequestId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [patientRecords, setPatientRecords] = useState<Record[]>([]);
  const [viewRecord, setViewRecord] = useState<Record | null>(null);

  useEffect(() => {
    const dId = localStorage.getItem('doctor_id');
    const token = localStorage.getItem('doctor_token');
    if (!dId || !token) { router.push('/doctor/login'); return; }
    setDoctorId(dId);

    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (err) { console.error('Face models failed:', err); }
    };
    loadModels();
    return () => stopCamera();
  }, [router]);

  useEffect(() => {
    if (step === 3 && timeLeft > 0) {
      const iv = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(iv);
    } else if (step === 3 && timeLeft === 0) {
      alert("Session Expired"); setStep(1); setScannedPatientId(null); setTimeLeft(600);
    }
  }, [step, timeLeft]);

  const startCamera = async () => {
    if (!modelsLoaded) return;
    setCameraActive(true);
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && !videoRef.current.srcObject) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(() => setCameraActive(false));
    }
  }, [cameraActive]);

  useEffect(() => {
    let scanInterval: any;
    if (cameraActive && step === 1) {
      scanInterval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.videoWidth === 0) return;
        const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3, inputSize: 416 });
        const detection = await faceapi.detectSingleFace(videoRef.current, options).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
           clearInterval(scanInterval); stopCamera();
           try {
             const res = await fetch('/api/doctor/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ face_embedding: Array.from(detection.descriptor) }) });
             const data = await res.json();
             if (res.ok && data.success) handleRequestAccess(data.patient_id);
             else startCamera();
           } catch { startCamera(); }
        }
      }, 500);
    }
    return () => clearInterval(scanInterval);
  }, [cameraActive, step]);

  const handleRequestAccess = async (pid: string) => {
    if (!pid.trim()) return;
    const token = localStorage.getItem('doctor_token');
    try {
      const res = await fetch('/api/doctor/request-access', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ patient_id: pid }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScannedPatientId(pid); setConsentRequestId(data.request_id); setStep(2);
    } catch (err: any) { alert(err.message); }
  };

  useEffect(() => {
    let iv: any;
    if (step === 2 && consentRequestId) {
      const token = localStorage.getItem('doctor_token');
      iv = setInterval(async () => {
        try {
          const res = await fetch(`/api/doctor/check-consent?request_id=${consentRequestId}`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'approved') {
               const recRes = await fetch(`/api/doctor/records?patient_id=${scannedPatientId}&request_id=${consentRequestId}`, { headers: { Authorization: `Bearer ${token}` } });
               if (recRes.ok) setPatientRecords(await recRes.json());
               setStep(3); setTimeLeft(600);
            } else if (data.status === 'rejected') { setStep(1); }
          }
        } catch {}
      }, 2500);
    }
    return () => clearInterval(iv);
  }, [step, consentRequestId, scannedPatientId]);

  const stopCamera = () => { if (videoRef.current?.srcObject) { (videoRef.current.srcObject as MediaStream).getTracks().forEach(t=>t.stop()); setCameraActive(false); } };
  const handleLogout = () => { localStorage.removeItem('doctor_id'); localStorage.removeItem('doctor_token'); router.push('/doctor/login'); };
  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  if (!doctorId) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden text-white font-sans">
      {/* ── BACKGROUND ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-violet-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto w-full p-6 lg:p-10 space-y-8 flex-1 flex flex-col">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
           <div className="flex flex-col sm:flex-row items-center gap-6 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-14 h-14 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-indigo-500/10 shadow-2xl shrink-0">
                 <BrandLogo variant="icon" size={36} />
              </div>
              <div className="space-y-0.5 text-center sm:text-left">
                 <div className="flex flex-col sm:flex-row items-center gap-3">
                    <h1 className="text-xl font-extrabold tracking-tighter text-white">Clinical Command</h1>
                    {step === 3 && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE: {formatTime(timeLeft)}
                      </span>
                    )}
                 </div>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Node Verified: <span className="text-zinc-300 font-mono tracking-normal break-all">{doctorId}</span></p>
              </div>
           </div>
           <div className="flex flex-wrap items-center justify-center gap-4 w-full lg:w-auto">
              <Link href="/" className="px-5 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition flex-1 sm:flex-none text-center">Home</Link>
              <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition flex-1 sm:flex-none text-center">Dashboard</Link>
              <button onClick={handleLogout} className="px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition flex-1 sm:flex-none text-center">Terminate Session</button>
           </div>
        </motion.div>

        {/* STEP 1: AUTH GATE */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 grid lg:grid-cols-2 gap-8 items-stretch">
            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-10 flex flex-col justify-center space-y-10 group hover:bg-zinc-900/60 transition-all">
               <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"><Database size={28} /></div>
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Analog Resolver</h2>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">Direct entry of decentralized patient node identifiers to initiate institutional clinical mapping.</p>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Infrastructure Node ID</label>
                    <input type="text" placeholder="PAT_8801_XXXX" value={manualPatientId} onChange={e=>setManualPatientId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-white font-mono text-center outline-none focus:ring-2 focus:ring-indigo-500/40 transition placeholder-zinc-800" />
                  </div>
                  <button onClick={()=>handleRequestAccess(manualPatientId)} disabled={!manualPatientId.trim()} className="w-full bg-white text-black font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl transition shadow-xl shadow-white/5 active:scale-95 disabled:opacity-30">Initialize Request</button>
               </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-10 flex flex-col justify-center space-y-10 group hover:bg-zinc-900/60 transition-all">
               <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"><Camera size={28} /></div>
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Biometric Mapping</h2>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">Spatial facial vector analysis for multi-factor patient identity verification and automated data linking.</p>
               </div>
               <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 flex flex-col items-center justify-center">
                  {!cameraActive ? (
                    <button onClick={startCamera} className="px-8 py-4 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 flex items-center gap-3">Activate Optical Matrix <ChevronRight size={16} /></button>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <ScannerOverlay />
                      <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Syncing facial vectors with decentralized registry...</p>
                      </div>
                    </>
                  )}
               </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: HANDSHAKE */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex items-center justify-center">
             <div className="max-w-xl w-full rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5, repeat: Infinity }} className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]" /></div>
                <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin mx-auto scale-110" />
                <div className="space-y-2">
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Handshake Protocol Active</h2>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Target Node ID: <span className="text-indigo-400 font-mono tracking-normal">{scannedPatientId}</span></p>
                </div>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">Consent request transmitted. Awaiting patient biometric or OTP confirmation to establish sovereign clinical synchronization.</p>
                <button onClick={()=>setStep(1)} className="text-[10px] font-black text-zinc-700 uppercase tracking-widest hover:text-rose-500 transition border-b border-zinc-900 hover:border-rose-500/30 pb-1">Abort Synchronization</button>
             </div>
          </motion.div>
        )}

        {/* STEP 3: LIVE LEDGER */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col space-y-8">
             <div className="grid lg:grid-cols-4 gap-8 flex-1">
                <div className="lg:col-span-3 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-8 space-y-8 flex flex-col">
                   <div className="flex items-center justify-between border-b border-white/5 pb-6">
                      <div><h2 className="text-xl font-extrabold text-white uppercase tracking-tighter">Integrated Health Ledger</h2><p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Verified clinical synchronization successful</p></div>
                      <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest shadow-xl">Encrypted Session Secure</p></div>
                   </div>
                   <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                      {patientRecords.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[10px] text-zinc-700 font-black uppercase tracking-widest">Awaiting decentralized record resolution...</div>
                      ) : patientRecords.map((r,i) => (
                        <div key={i} className="group p-6 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-indigo-500/20 hover:bg-zinc-900/60 transition-all flex flex-col sm:flex-row items-center justify-between gap-6">
                           <div className="space-y-3 w-full text-center sm:text-left">
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                 <p className="text-sm font-black text-zinc-100 uppercase">{r.document_type || 'Uncategorized Block'}</p>
                                 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${r.verified ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-600'}`}>
                                    {r.data_origin === 'emr' ? 'Hospital Verified' : 'AI Extracted'}
                                 </span>
                              </div>
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
                                 <span className="flex items-center gap-2"><Activity size={10} className="text-zinc-800" /> {new Date(r.uploaded_at).toLocaleDateString()}</span>
                                 <span className="flex items-center gap-2"><Hash size={10} className="text-zinc-800" /> 0x{r.record_id.slice(0,8)}...</span>
                                 {r.doctor && <span className="text-zinc-500 normal-case font-sans">Attending: Dr. {r.doctor.replace('Dr. ', '')}</span>}
                              </div>
                           </div>
                           <button onClick={() => setViewRecord(r)} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">Decrypt Node</button>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-8 space-y-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"><Shield size={24} /></div>
                      <div className="space-y-2"><h3 className="text-sm font-black text-white uppercase tracking-widest">Governance Protocol</h3><p className="text-[11px] text-zinc-500 font-medium leading-relaxed">All synchronized vectors are governed by zero-knowledge frameworks. Clinical data is ingested via an intelligent extraction pipeline, preserving sovereign identity node integrity.</p></div>
                      <div className="pt-4 border-t border-white/5 space-y-2">
                         <div className="flex items-center justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest"><span>Integrity Score</span><span>100%</span></div>
                         <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden flex"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.4)]" /></div>
                      </div>
                   </div>
                   <div className="rounded-3xl border border-white/10 bg-indigo-600/5 p-8 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Infrastructure tier Verified</p>
                      <button onClick={()=>setStep(1)} className="text-[11px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition">Terminal Termination</button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* FOOTER */}
        <footer className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
           <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] max-w-xl text-center sm:text-left leading-relaxed">
              Institutional intelligence environment for authenticated clinical providers · Sovereign health identity Management enabled via decrypted infrastructure nodes.
           </p>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Lock size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">E2E Cryptographic Security</p></div>
              <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Identity Node Verified</p></div>
           </div>
        </footer>
      </div>

      {/* VIEW MODAL (Simplified logic for now) */}
      <AnimatePresence>
        {viewRecord && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8" onClick={()=>setViewRecord(null)}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl w-full h-[85vh] bg-zinc-950 rounded-[40px] border border-white/10 shadow-2xl flex flex-col overflow-hidden" onClick={e=>e.stopPropagation()}>
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Decrypted Data Vector</h3>
                      <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{viewRecord.record_id}</p>
                   </div>
                   <button onClick={()=>setViewRecord(null)} className="px-6 py-3 rounded-xl bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition">Close Terminal</button>
                </div>
                <div className="flex-1 flex flex-col xl:flex-row overflow-hidden overflow-y-auto xl:overflow-hidden">
                   <div className="w-full xl:flex-1 bg-black/50 xl:border-r border-white/5 flex items-center justify-center p-8 sm:p-12 relative min-h-[300px] xl:min-h-0">
                      <div className="absolute inset-0 flex items-center justify-center font-black text-[60px] sm:text-[120px] text-white/[0.02] rotate-12 select-none pointer-events-none tracking-widest">SOURCE_NODE</div>
                      {viewRecord.file_url ? (
                        <img src={viewRecord.file_url} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/5" />
                      ) : (
                        <div className="text-center space-y-4 relative z-10"><div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto text-zinc-700"><FileText size={32} /></div><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Original analog source mapped to EMR</p></div>
                      )}
                   </div>
                   <div className="w-full xl:w-1/2 p-8 sm:p-10 overflow-y-auto space-y-8 bg-zinc-950/20 xl:h-full">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-l-4 border-indigo-500 pl-4">Structured Identity Data</h4>
                      <div className="space-y-6">
                         {['diagnosis', 'symptoms', 'medicines', 'dosage'].map(f => (
                           viewRecord.structured_data?.[f] && (
                             <div key={f} className="space-y-3">
                                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{f}</p>
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 text-xs font-bold text-zinc-300 font-mono leading-relaxed">{viewRecord.structured_data[f].join(', ')}</div>
                             </div>
                           )
                         ))}
                      </div>
                      <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                         <div className="space-y-1"><p className="text-[8px] font-black text-zinc-700 uppercase">Integrity Confidence</p><p className="text-sm font-black text-indigo-400">{viewRecord.confidence_score}%</p></div>
                         <div className="space-y-1"><p className="text-[8px] font-black text-zinc-700 uppercase">Origin tier</p><p className="text-sm font-black text-zinc-400 uppercase tracking-tighter">{viewRecord.source}</p></div>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Hash({ size, className }: any) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>; }
