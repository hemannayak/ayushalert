'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Upload, Camera, Database, Shield, BrainCircuit, CheckCircle2, AlertCircle, ChevronLeft, Eye, Disc, Cpu, Activity, RefreshCcw, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

// ── COMPONENTS ─────────────────────────────────────────────────────────────
function ScannerOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
      <motion.div initial={{ top: '10%' }} animate={{ top: '90%' }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute left-4 right-4 h-1 bg-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.6)] blur-[1px]" />
    </div>
  );
}

// ── MAIN UPLOAD PAGE ────────────────────────────────────────────────────────
export default function PatientUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedRecord, setUploadedRecord] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState('');
  const [useDemoBypass, setUseDemoBypass] = useState(false);
  const [documentType, setDocumentType] = useState('Prescription');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) router.push('/patient/login');
    return () => stopCamera();
  }, [token, router]);

  const startCamera = async () => {
    setUseCamera(true); setFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch (err: any) { setError('Camera optics failed: ' + err.message); setUseCamera(false); }
  };

  const stopCamera = () => { if (videoRef.current?.srcObject) { (videoRef.current.srcObject as MediaStream).getTracks().forEach(t=>t.stop()); setUseCamera(false); } };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth; canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      canvasRef.current.toBlob(blob => { if (blob) { setFile(new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' })); stopCamera(); } }, 'image/jpeg', 0.9);
    }
  };

  const handleUpload = async () => {
    if (!file) return; setError(''); setUploading(true);
    try {
      const formData = new FormData(); formData.append('file', file); formData.append('document_type', documentType);
      const res = await fetch('/api/records/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ingestion failed');
      setUploadedRecord(data); handleProcess(data.record_id);
    } catch (err: any) { setError(err.message); }
    finally { setUploading(false); }
  };

  const handleProcess = async (directRecordId?: string) => {
    const targetId = directRecordId || uploadedRecord?.record_id; if (!targetId) return;
    setError(''); setProcessing(true);
    try {
      const res = await fetch('/api/records/process', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ record_id: targetId, demo_bypass: useDemoBypass }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vectorization failed');
      setExtractedData(data); setEditedData({ ...data.structured_data });
    } catch (err: any) { setError(err.message); }
    finally { setProcessing(false); }
  };

  const handleVerify = async () => {
    if (!uploadedRecord || !editedData) return;
    if (uploadedRecord.document_type === 'Prescription') {
      if (!editedData.dosage || editedData.dosage.length === 0 || editedData.dosage[0].trim() === '') { setError('Clinical safety: Dosage parameter required for prescriptions.'); return; }
    }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/records/process', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ record_id: uploadedRecord.record_id, confirmed_data: editedData }) });
      if (!res.ok) throw new Error('Sealing failed');
      setSavedOk(true);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const updateField = (key: string, value: string) => setEditedData((prev: any) => ({ ...prev, [key]: value.split('\n').filter(Boolean) }));

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden text-white font-sans">
      {/* ── BACKGROUND ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.2] pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full p-6 lg:p-10 space-y-8 flex-1 flex flex-col">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
           <div className="flex items-center gap-6">
              <Link href="/patient/dashboard" className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition shadow-xl"><ChevronLeft size={20} /></Link>
              <div>
                 <h1 className="text-2xl font-black tracking-tighter uppercase">Neural Scan</h1>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Ingestion & Extraction Pipeline</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                 <Cpu size={12} className="animate-pulse" /> VLM-Engine: Connected
              </div>
           </div>
        </motion.div>

        {error && <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-black uppercase flex items-center gap-3"><AlertCircle size={18} /> {error}</div>}

        <AnimatePresence mode="wait">
          {savedOk ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex items-center justify-center">
               <div className="max-w-xl w-full rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-xl"><CheckCircle2 size={40} /></div>
                  <div className="space-y-2">
                     <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Record Sealed</h2>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Authoritatively committed to your timeline</p>
                  </div>
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">Your clinical profile has been updated with the verified parameters. All data is now encrypted and accessible via your sovereign identity node.</p>
                  <Link href="/patient/dashboard" className="inline-flex items-center gap-3 px-10 py-5 rounded-3xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/20 active:scale-95">Return to Node <ArrowRight size={18} /></Link>
               </div>
            </motion.div>
          ) : !extractedData ? (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 grid lg:grid-cols-12 gap-8 items-start">
               <div className="lg:col-span-12 rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-10 lg:p-16 space-y-12 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                  
                  <div className="text-center space-y-4 max-w-2xl mx-auto relative z-10">
                     <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto group-hover:scale-110 transition-transform"><BrainCircuit size={32} /></div>
                     <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Neural Ingestion</h2>
                     <p className="text-sm text-zinc-500 font-medium">Upload or scan unstructured analog clinical data to initialize high-fidelity extraction.</p>
                  </div>

                  {!uploadedRecord ? (
                    <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                       <div className="flex justify-center mb-6">
                          <div className="flex p-1.5 rounded-2xl bg-zinc-950 border border-white/5 space-x-2">
                             <button onClick={()=>{setUseCamera(false); stopCamera();}} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!useCamera ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}>📁 Local Matrix</button>
                             <button onClick={startCamera} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${useCamera ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}>📷 Optical Scan</button>
                          </div>
                       </div>

                       {useCamera ? (
                         <div className="relative aspect-video max-w-2xl mx-auto rounded-3xl overflow-hidden bg-black border border-zinc-800 flex flex-col items-center justify-center shadow-2xl group">
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <ScannerOverlay />
                            <canvas ref={canvasRef} className="hidden" />
                            <button onClick={captureImage} className="absolute bottom-8 px-10 py-5 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-2xl shadow-indigo-500/40 active:scale-95 z-30">Terminate Scan & Ingest</button>
                         </div>
                       ) : (
                         <div className="group relative border-2 border-dashed border-zinc-800 rounded-[40px] p-20 bg-zinc-950/40 hover:bg-zinc-900/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer">
                            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                            <p className="text-lg font-black text-white uppercase tracking-tighter">Initialize Protocol</p>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">VLM-Ready Patterns Only (PDF, JPG, PNG)</p>
                            <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            {file && <div className="mt-8 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95">{file.name} Loaded</div>}
                         </div>
                       )}

                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Artifact Classification</label>
                             <select value={documentType} onChange={e=>setDocumentType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-5 text-[11px] font-black text-white uppercase outline-none cursor-pointer hover:bg-zinc-900 transition appearance-none">
                                <option>Prescription</option><option>Lab Report</option><option>Imaging Scan</option><option>Clinical Note</option>
                             </select>
                          </div>
                          <div className="flex items-center gap-6 p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800">
                             <input type="checkbox" id="dbg" checked={useDemoBypass} onChange={e=>setUseDemoBypass(e.target.checked)} className="w-5 h-5 rounded bg-zinc-900 border-zinc-700 text-indigo-500 focus:ring-0 cursor-pointer" />
                             <label htmlFor="dbg" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest cursor-pointer leading-relaxed">Override Engine <span className="text-indigo-400">(demo bypass fallback)</span></label>
                          </div>
                       </div>

                       <div className="pt-10 flex justify-center">
                          <button onClick={handleUpload} disabled={!file || uploading} className="w-full max-w-xl py-6 rounded-3xl bg-indigo-500 text-white text-[12px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-2xl shadow-indigo-500/30 active:scale-95 disabled:opacity-30">
                             {uploading ? 'Transmitting to Cloud Node...' : 'Initialize Secure Extraction'}
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-pulse text-center">
                       <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-2xl" />
                       <div className="space-y-2">
                          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Fragmenting Unstructured Data</h3>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Applying neural Clinical Parameters v3.4</p>
                       </div>
                       <div className="px-6 py-3 rounded-xl bg-zinc-900/80 border border-white/5 text-[9px] font-mono text-indigo-400 uppercase tracking-widest">Node ref: {uploadedRecord.record_id}</div>
                    </div>
                  )}
               </div>
            </motion.div>
          ) : (
            <motion.div key="verify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 grid lg:grid-cols-2 gap-10 items-start">
               {/* PREVIEW */}
               <div className="rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-8 space-y-6 sticky top-10 flex flex-col h-[85vh] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                     <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-3"><Eye size={16} className="text-indigo-400" /> Source Visualization</h3>
                     <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">Analog Origin</span>
                  </div>
                  <div className="flex-1 bg-black rounded-3xl border border-white/5 overflow-hidden p-6 relative group flex items-center justify-center">
                     <div className="absolute inset-0 flex items-center justify-center font-black text-[120px] text-white/[0.02] rotate-12 select-none pointer-events-none tracking-widest">SOURCE</div>
                     <img src={uploadedRecord?.file_url} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5 relative z-10 transition-transform duration-700 group-hover:scale-[1.03]" />
                  </div>
               </div>

               {/* EXTRACTION */}
               <div className="rounded-[40px] border border-white/5 bg-zinc-900/40 backdrop-blur-xl p-10 space-y-8 shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                     <div><h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Neural Verification</h2><p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1.5">Authorize extracted health parameters</p></div>
                     <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400">Engine Conf: {extractedData.confidence_score}%</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 space-y-2">
                     <div className="flex items-center gap-3 text-indigo-400"><Activity size={16} /><p className="text-[10px] font-black uppercase tracking-widest">Human-in-the-Loop Protocol</p></div>
                     <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">Cross-validate the AI-vectored values against the source optics before committing cryptographically. Correct any segmentation gaps below.</p>
                  </div>

                  <div className="space-y-8 flex-1">
                     {(['medicines', 'dosage', 'symptoms', 'diagnosis'] as const).map(f => (
                       <div key={f} className="space-y-3 group">
                          <div className="flex items-center justify-between px-1">
                             <label className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">{f} Data Array</label>
                             {f === 'dosage' && documentType === 'Prescription' && <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Sync Critical</span>}
                          </div>
                          <div className="relative">
                             <textarea value={(editedData[f] || []).join('\n')} onChange={e=>updateField(f, e.target.value)} rows={f==='medicines'||f==='symptoms'?4:2} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-sm font-bold text-zinc-200 font-mono outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-inner resize-none group-hover:border-indigo-500/20" />
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="pt-8 border-t border-white/5">
                     <button onClick={handleVerify} disabled={saving} className="w-full py-6 rounded-3xl bg-emerald-500 text-white text-[12px] font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-2xl shadow-emerald-500/30 active:scale-95 disabled:opacity-50">
                        {saving ? 'Encrypting & Sealing...' : 'Vouch & Securely Commit'}
                     </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
           <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] max-w-xl text-center sm:text-left leading-relaxed">
              Unified health data framework for sovereign identity management · extraction pipeline governed by infrastructure-tier VLM engines.
           </p>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Disc size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Optical Node Verified</p></div>
              <div className="flex items-center gap-2"><Activity size={12} className="text-zinc-800" /><p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Neural extraction Active</p></div>
           </div>
        </footer>
      </div>
    </div>
  );
}
