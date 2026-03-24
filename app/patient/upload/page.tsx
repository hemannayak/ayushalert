'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    return () => stopCamera(); // Cleanup camera on unmount
  }, [token, router]);

  // ─── CAMERA CAPTURE LOGIC ───
  const startCamera = async () => {
    setUseCamera(true);
    setFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setError('Camera access denied or unavailable: ' + err.message);
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setUseCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob(blob => {
        if (blob) {
          const newFile = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFile(newFile);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  // ─── STEP 1: Upload file ───
  const handleUpload = async () => {
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      const res = await fetch('/api/records/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadedRecord(data);
      
      // Auto-trigger extraction immediately after upload completes
      handleProcess(data.record_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ─── STEP 2: Run OCR / NLP ───
  const handleProcess = async (directRecordId?: string) => {
    const targetId = directRecordId || uploadedRecord?.record_id;
    if (!targetId) return;
    
    setError('');
    setProcessing(true);

    try {
      const res = await fetch('/api/records/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          record_id:    targetId,
          demo_bypass:  useDemoBypass
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Processing failed');

      setExtractedData(data);
      setEditedData({ ...data.structured_data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // ─── STEP 3: Human confirms & saves ───
  const handleVerify = async () => {
    if (!uploadedRecord || !editedData) return;
    
    // Dosage is only strictly required for Prescriptions
    if (uploadedRecord.document_type === 'Prescription') {
      if (!editedData.dosage || editedData.dosage.length === 0 || editedData.dosage[0].trim() === '') {
        setError('Dosage information is strictly required for clinical safety on Prescriptions. Please fill in the dosage.');
        return;
      }
    }
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/records/process', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          record_id:      uploadedRecord.record_id,
          confirmed_data: editedData
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setSavedOk(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      [key]: value.split('\n').filter(Boolean)
    }));
  };

  return (
    <div className={`mx-auto mt-10 space-y-8 animate-in fade-in duration-500 px-4 pb-20 pt-4 ${extractedData && !savedOk ? 'max-w-7xl' : 'max-w-3xl'}`}>
      
      {/* HEADER SECTION */}
      <div className="glass-panel p-8 md:p-10 border-t-4 border-t-emerald-500 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Neural Scan Pipeline</h2>
        <p className="text-zinc-400 text-sm">Ingest unstructured clinical analog data. The core engine will extract and vectorize medical parameters for your verification before cryptographic sealing.</p>
        
        {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-xl mt-6 text-sm font-semibold shadow-inner">{error}</div>}

        {savedOk && (
          <div className="bg-emerald-900/30 text-emerald-300 p-6 rounded-2xl mt-6 text-base font-medium border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-white tracking-wide">Record Verified & Encrypted</p>
                <p className="text-sm text-emerald-400/80">Authoritatively committed to your decentralized timeline.</p>
              </div>
            </div>
            <Link href="/patient/dashboard" className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-lg transition whitespace-nowrap shadow">
               Return to Identity Node
            </Link>
          </div>
        )}
      </div>

      {/* UPLOAD & PROCESSING STEPS */}
      {!extractedData && !savedOk && (
        <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
          {!uploadedRecord ? (
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-zinc-300 uppercase tracking-widest">Input Source Stream</label>
                <div className="flex gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800 shadow-inner">
                   <button onClick={() => { setUseCamera(false); stopCamera(); setFile(null); }} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${!useCamera ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>📁 Disk File</button>
                   <button onClick={startCamera} className={`px-4 py-2 text-xs font-bold rounded-lg transition ${useCamera ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>📷 Optics</button>
                </div>
              </div>

              {!useCamera ? (
                 <div className="border-2 border-dashed border-zinc-700/50 rounded-2xl p-8 bg-zinc-900/30 hover:bg-zinc-900/50 transition flex flex-col items-center justify-center text-center relative group">
                   <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform shadow-inner">
                     ↑
                   </div>
                   <p className="text-white font-semibold mb-1">Drag and drop or browse</p>
                   <p className="text-sm text-zinc-500 mb-4">Support PDF, JPG, PNG parameters</p>
                   <input
                     type="file"
                     accept=".png,.jpg,.jpeg,.pdf"
                     onChange={e => setFile(e.target.files?.[0] || null)}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   {file && <div className="text-emerald-400 text-sm font-medium bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-500/30 mt-2 z-10 pointer-events-none">Volume Loaded: {file.name}</div>}
                 </div>
              ) : (
                 <div className="border border-zinc-700 rounded-2xl p-4 bg-zinc-950 flex flex-col items-center justify-center relative min-h-[300px] overflow-hidden shadow-inner">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-2xl pointer-events-none z-10" />
                    <video ref={videoRef} className="w-full max-h-[400px] object-contain rounded-xl" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    <button onClick={captureImage} className="absolute bottom-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] transition z-20 focus:ring-4 focus:ring-indigo-500/30">
                       📸 Extract Frame
                    </button>
                 </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                 <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-widest">Document Classification</label>
                    <select
                      value={documentType}
                      onChange={e => setDocumentType(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl p-3.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="Prescription">Prescription Script</option>
                      <option value="Lab Report">Pathology Lab Report</option>
                      <option value="Scan">Imaging Scan / Radiology</option>
                      <option value="Diagnosis">Clinical Diagnosis</option>
                      <option value="Other">Unclassified Data</option>
                    </select>
                 </div>
                 
                 <div className="flex flex-col justify-end">
                    <div className="flex items-start gap-4 bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl">
                      <input
                        id="demo_bypass"
                        type="checkbox"
                        checked={useDemoBypass}
                        onChange={e => setUseDemoBypass(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-yellow-600 focus:ring-yellow-600 focus:ring-offset-zinc-900"
                      />
                      <label htmlFor="demo_bypass" className="text-yellow-500 font-medium text-sm cursor-pointer leading-tight">
                        <span className="block text-yellow-400 font-bold mb-0.5 tracking-wide">Demo Inference Override</span>
                        Simulate neural response with predefined fallback JSON block instead of live inference.
                      </label>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-zinc-800/50 mt-8">
                 <button
                   onClick={handleUpload}
                   disabled={!file || uploading}
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:shadow-none text-lg tracking-wide"
                 >
                   {uploading ? 'Transmitting to Cloud Node...' : 'Initialize Secure Ingestion'}
                 </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center py-16 relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <h3 className="text-2xl font-bold text-white tracking-wide">Executing Neural Evaluation</h3>
              <p className="text-zinc-400 max-w-md mx-auto leading-relaxed text-sm">The Vision Language Model is currently segmenting the unstructured image data into cryptographic clinical parameters.</p>
              <div className="bg-zinc-900/80 border border-zinc-700/50 py-2 px-4 rounded-lg inline-flex flex-col items-center mt-6 shadow-inner">
                 <span className="text-xs uppercase font-bold text-zinc-500 mb-1 tracking-widest">Active File Reference</span>
                 <span className="text-sm text-indigo-400 font-mono tracking-wider">{uploadedRecord.record_id}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VERIFICATION STEP (Side-by-Side View) */}
      {extractedData && !savedOk && editedData && (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* LEFT: Document Preview */}
          <div className="glass-panel p-6 sticky top-8 flex flex-col h-[800px]">
             <h3 className="font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/80 pb-3">
               <span className="text-blue-400">📄</span> Source Artifact Optics
             </h3>
             <div className="bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-hidden flex-1 relative group shadow-inner flex items-center justify-center p-4">
                <img 
                   src={uploadedRecord?.file_url?.toLowerCase().endsWith('.pdf') ? uploadedRecord.file_url.replace(/\.pdf$/i, '.jpg') : uploadedRecord?.file_url} 
                   alt="Source Artifact Optics" 
                   className="w-full h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.02]" 
                />
             </div>
          </div>

          {/* RIGHT: Extraction Form */}
          <div className="glass-panel p-6 md:p-8 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-zinc-800/80 pb-4">
               <h3 className="font-bold text-white text-lg flex items-center gap-2">
                 <span className="text-indigo-400">🧠</span> Verified Data Parameters
               </h3>
               <div className="flex items-center gap-2 bg-indigo-900/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg shadow-inner">
                 <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                 <span className="text-xs font-mono text-indigo-300 tracking-wider">CONF: {extractedData.confidence_score}%</span>
               </div>
            </div>
            
            <div className="bg-blue-900/20 border-l-4 border-l-blue-500 p-4 rounded-r-lg text-sm text-blue-200 mb-8 leading-relaxed shadow-inner">
              <span className="font-bold text-white mb-1 block">Human-in-the-Loop Protocol</span>
              Please visually cross-check the AI-vectored arrays against the source artifact before committing cryptographically.
              {extractedData.demo_bypass && <span className="block mt-2 text-yellow-400 font-bold bg-yellow-900/30 px-2 py-1 inline-block rounded border border-yellow-700/50">⚠️ Simulated Inference Fallback Engaged</span>}
            </div>

            <div className="space-y-6 flex-1">
              {(['medicines', 'dosage', 'symptoms', 'diagnosis'] as const).map(field => (
                <div key={field} className="relative group">
                  <label className="flex justify-between items-end mb-2">
                     <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{field} Array</span>
                     {field === 'dosage' && documentType === 'Prescription' && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/50">REQUIRED</span>
                     )}
                  </label>
                  <textarea
                    rows={field === 'symptoms' || field === 'medicines' ? 3 : 2}
                    value={(editedData[field] || []).join('\n')}
                    onChange={e => updateField(field, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner font-mono resize-y"
                    placeholder={`[Enter array block here]`}
                  />
                  <div className="absolute top-0 right-0 -m-1 w-3 h-3 bg-indigo-500 rounded-full blur-[4px] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>

            <div className="pt-8 mt-6 top-8 sticky border-t border-zinc-800/50">
               <button
                 onClick={handleVerify}
                 disabled={saving}
                 className="w-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-extrabold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition disabled:opacity-50 text-lg uppercase tracking-wide border border-emerald-500/50"
               >
                 {saving ? 'Committing to Blockchain...' : '✓ Authorize & Commit'}
               </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
