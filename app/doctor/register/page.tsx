'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { ScannerOverlay } from '@/components/ScannerOverlay';
import { Shield, Stethoscope, ArrowLeft, Activity, Database, Fingerprint, Mail, Key, User } from 'lucide-react';

export default function DoctorRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    specialization: '',
    hospital_id: 'HOSP_DEMO',
    email: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Error loading face models:', err);
        setError('Failed to load facial recognition models.');
      }
    };
    loadModels();
    
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    if (!modelsLoaded) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // Auto-scan continuously when the camera is active
  useEffect(() => {
    let scanInterval: any;
    if (cameraActive && !faceDescriptor && !capturing) {
       scanInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.videoWidth === 0) return;
          
          setError(''); 
          try {
             const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4, inputSize: 416 });
             const detection = await faceapi.detectSingleFace(videoRef.current, options).withFaceLandmarks().withFaceDescriptor();

             if (detection) {
                clearInterval(scanInterval);
                setCapturing(true);
                
                setTimeout(async () => {
                    if (!videoRef.current) return;
                    const finalDetection = await faceapi.detectSingleFace(videoRef.current, options).withFaceLandmarks().withFaceDescriptor();
                    if (finalDetection) {
                        setFaceDescriptor(Array.from(finalDetection.descriptor));
                        stopCamera();
                    } else {
                        setError('Face not detected clearly. Try again.');
                    }
                    setCapturing(false);
                }, 1500);
             }
          } catch (e: any) {
             console.error("Face detection error:", e);
          }
       }, 500);
    }
    return () => clearInterval(scanInterval);
  }, [cameraActive, faceDescriptor, capturing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceDescriptor) {
      setError("Please capture your facial biometrics to register.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/doctor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, face_embedding: faceDescriptor }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('doctor_token', data.token);
      localStorage.setItem('doctor_id', data.doctor_id);
      
      setSuccess('Profile provisioned successfully. redirecting...');
      setTimeout(() => router.push('/doctor/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* ── BACKGROUND MESH LAYER ────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none select-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[160px]" />
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
             <BrandLogo variant="horizontal" size={24} />
          </Link>
          <Link href="/doctor/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition flex items-center gap-2 group">
             Portal Access <ArrowLeft size={12} className="rotate-180 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Clinical Authority */}
          <div className="lg:col-span-4 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                   <Activity size={12} strokeWidth={3} />
                   Institutional Enrollment
                </div>
                <h1 className="text-5xl font-extrabold tracking-tighter leading-[0.85] text-white">
                   Authority <br /> 
                   <span className="text-zinc-600">Onboarding.</span>
                </h1>
              </div>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                Connect your medical practice to the ayushalert infrastructure. registration requires valid medical license credentials and biometric signature.
              </p>
              <div className="space-y-4 pt-6">
                 <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                       <Database size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Standard</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-300 font-mono uppercase">ABDM V3.0 / ISO-27001</p>
                 </div>
                 <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                       <Shield size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Compliance</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-300 font-mono uppercase">End-to-End Cryptography</p>
                 </div>
              </div>
            </div>

          {/* Right Column: Enrollment Form */}
          <div className="lg:col-span-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-zinc-900/40 backdrop-blur-3xl p-8 md:p-10 border border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20" />
              
              {/* Alert Area */}
              {(error || success) && (
                <div className={`p-4 rounded-xl mb-8 border text-xs font-bold flex items-center gap-3 ${
                  error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${error ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                  {error || success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Clinical Metadata Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Clinical Data Nodes</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Full Provider Name</label>
                      <input required name="name" type="text" placeholder="Dr. Jane Doe" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500/40 transition shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Email Endpoint</label>
                      <input required name="email" type="email" placeholder="provider@hospital.hub" onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500/40 transition shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Medical License ID</label>
                      <input required name="license" type="text" placeholder="REG-000000" onChange={e => setFormData({...formData, license_number: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white text-sm font-mono uppercase tracking-widest focus:ring-2 focus:ring-emerald-500/40 transition shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Specialization Focus</label>
                      <div className="relative">
                         <select required onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500/40 transition appearance-none shadow-inner cursor-pointer">
                            <option value="">Select Specialization...</option>
                            <option value="General Physician">General Physician</option>
                            <option value="Cardiologist">Cardiologist</option>
                            <option value="Neurologist">Neurologist</option>
                            <option value="Orthopedic">Orthopedic</option>
                            <option value="Radiologist">Radiologist</option>
                         </select>
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                            <Activity size={14} />
                         </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Assigned Hospital node</label>
                      <input required name="hospital" type="text" value={formData.hospital_id} onChange={e => setFormData({...formData, hospital_id: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white text-sm font-mono tracking-widest focus:ring-2 focus:ring-emerald-500/40 transition shadow-inner" />
                    </div>
                  </div>
                </div>

                {/* Biometric Sector Section */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Verifiable Biometric signature</h3>
                  </div>

                  <div className="bg-zinc-950/50 border border-zinc-900 rounded-[32px] overflow-hidden shadow-inner flex flex-col items-center justify-center p-8 min-h-[320px] relative">
                     {!modelsLoaded && (
                        <div className="flex flex-col items-center gap-4">
                           <Activity className="text-emerald-500/30 animate-pulse" size={40} />
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Syncing AI Core...</p>
                        </div>
                     )}

                     {modelsLoaded && !cameraActive && !faceDescriptor && (
                        <button type="button" onClick={startCamera} className="group relative h-16 w-16 rounded-full bg-white text-zinc-950 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                           <Fingerprint size={32} className="group-hover:animate-pulse" />
                           <div className="absolute -inset-2 rounded-full border border-white/10 animate-ping opacity-20" />
                        </button>
                     )}

                     <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline
                        className={`w-full max-w-sm rounded-[24px] border border-emerald-500/20 object-cover shadow-2xl transition-all duration-700 ${!cameraActive ? 'hidden' : 'block'}`}
                        style={{ height: '240px' }}
                     />

                     {cameraActive && (
                        <ScannerOverlay 
                           status={capturing ? 'verifying' : faceDescriptor ? 'success' : 'scanning'}
                           label={capturing ? "Locking Geometry" : faceDescriptor ? "Seed Verified" : "Align to Grid"}
                        />
                     )}

                     {faceDescriptor && !cameraActive && (
                        <motion.div 
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="flex flex-col items-center gap-4"
                        >
                           <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                              <Shield size={24} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Signature Engraved</p>
                           <button 
                              type="button" 
                              onClick={() => { setFaceDescriptor(null); startCamera(); }}
                              className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition"
                           >
                              Recalibrate Signature
                           </button>
                        </motion.div>
                     )}
                  </div>
                </div>

                <button 
                  disabled={loading || !faceDescriptor} 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-16 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(16,185,129,0.3)] transition disabled:opacity-50 disabled:grayscale disabled:scale-100 active:scale-[0.98]"
                >
                  {loading ? 'Transmitting Data...' : 'Commit Provider Enrollment'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-12 px-6 border-t border-white/5 opacity-40">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
          AyushAlert Unified Health Infrastructure Protocol (AUHIP) v4.2.0
        </p>
      </footer>
    </div>
  );
}
