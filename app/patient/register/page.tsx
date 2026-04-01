'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { ScannerOverlay } from '@/components/ScannerOverlay';
import { Shield, UserPlus, ArrowLeft, Activity, Database, Fingerprint } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', gender: '', dob: '', abha_id: '', password: '', pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Face recognition states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facialDescriptor, setFacialDescriptor] = useState<number[] | null>(null);
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
    
    return () => {
      stopCamera();
    };
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
        console.error('Camera error:', err);
        setError("Unable to access camera. Please allow permissions.");
    }
  };

  // Auto-scan continuously when the camera is active
  useEffect(() => {
    let scanInterval: any;
    if (cameraActive && !facialDescriptor && !capturing) {
       scanInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.videoWidth === 0) return;
          
          setError(''); // clear lingering errors
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
                        setFacialDescriptor(Array.from(finalDetection.descriptor));
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
       }, 500); // Check every half second
    }
    return () => clearInterval(scanInterval);
  }, [cameraActive, facialDescriptor, capturing]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facialDescriptor) {
      setError('Facial recognition scan is required to register securely!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reqBody = {
        ...formData,
        face_embedding: facialDescriptor
      };

      const res = await fetch('/api/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSuccess(`Registration successful! Your ABHA ID (Health ID) is: ${data.abha_id}. Your Patient ID is: ${data.patient_id}. Please save these details. You can now login using your face.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative">
      {/* ── BACKGROUND MESH LAYER ────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none select-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[160px]" />
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
             <BrandLogo variant="horizontal" size={24} textSize={18} />
          </Link>
          <Link href="/patient/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition flex items-center gap-2 group">
             Existing Identity <ArrowLeft size={12} className="rotate-180 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Context & Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                <Activity size={12} strokeWidth={3} />
                Sovereign Identity Hub
              </div>
              <h1 className="text-5xl font-extrabold tracking-tighter leading-[0.85] text-white">
                Enrollment <br /> 
                <span className="text-zinc-600">Terminal.</span>
              </h1>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                Connect your health data to the global infrastructure. Registration creates a decentralized biometric key unique to your physiology.
              </p>
            </div>

            <div className="space-y-4 pt-6">
               <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                     <Database size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Protocol</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-300 font-mono">Decentralized Asset Hub (DAH) v4.0</p>
               </div>
               <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                     <Shield size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Privacy</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-300 font-mono">Zero-Knowledge Biometric Proof</p>
               </div>
            </div>
          </div>

          {/* Right Column: Enrollment Form */}
          <div className="lg:col-span-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-panel p-8 md:p-10 border-t-4 border-t-indigo-500 shadow-2xl relative"
            >
              {/* Alert Area */}
              {(error || success) && (
                <div className={`p-4 rounded-xl mb-8 border text-xs font-bold flex items-center gap-3 ${
                  error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${error ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                  {error || success}
                </div>
              )}

              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Personal Nodes Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Personal Data Nodes</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Legal Full Name</label>
                        <input required name="name" type="text" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition shadow-inner" placeholder="Johnathan Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Email Terminal</label>
                        <input required name="email" type="email" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition shadow-inner" placeholder="identity@protocol.io" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Mobile Uplink</label>
                        <input required name="mobile" type="text" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition shadow-inner" placeholder="+91 00000 00000" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Integrity Key (Password)</label>
                        <input required name="password" type="password" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition shadow-inner" placeholder="••••••••••••" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Gender Node</label>
                        <div className="relative">
                           <select required name="gender" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition appearance-none shadow-inner cursor-pointer">
                              <option value="">Select Protocol</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                              <Activity size={14} />
                           </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Date of Genesis (DOB)</label>
                        <input required name="dob" type="date" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition shadow-inner" style={{ colorScheme: 'dark' }} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Regional Anchor (Pincode)</label>
                        <input name="pincode" type="text" placeholder="e.g. 500032" onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition shadow-inner" />
                      </div>
                    </div>
                  </div>

                  {/* Biometric Scan Section */}
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Biometric Seed Generation</h3>
                    </div>

                    <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center p-8 min-h-[320px] relative">
                       {!modelsLoaded && (
                          <div className="flex flex-col items-center gap-4">
                             <Activity className="text-indigo-500/30 animate-pulse" size={40} />
                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Syncing AI Core...</p>
                          </div>
                       )}

                       {modelsLoaded && !cameraActive && !facialDescriptor && (
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
                          className={`w-full max-w-sm rounded-xl border border-indigo-500/20 object-cover shadow-2xl transition-all duration-700 ${!cameraActive ? 'hidden' : 'block'}`}
                          style={{ height: '240px' }}
                       />

                       {cameraActive && (
                          <ScannerOverlay 
                             status={capturing ? 'verifying' : facialDescriptor ? 'success' : 'scanning'}
                             label={capturing ? "Locking Geometry" : facialDescriptor ? "Seed Verified" : "Align to Grid"}
                          />
                       )}

                       {facialDescriptor && !cameraActive && (
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
                                onClick={() => { setFacialDescriptor(null); startCamera(); }}
                                className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition"
                             >
                                Recalibrate Signature
                             </button>
                          </motion.div>
                       )}
                    </div>
                  </div>

                  <button 
                    disabled={loading || !facialDescriptor} 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(79,70,229,0.3)] transition disabled:opacity-50 disabled:grayscale disabled:scale-100 active:scale-[0.98]"
                  >
                    {loading ? 'Encrypting Node Identity...' : 'Execute Enrollment'}
                  </button>
                </form>
              ) : (
                <div className="py-12 space-y-10 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                     <BrandLogo variant="horizontal" size={32} />
                     <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400">Institutional Onboarding</span>
                  </div>
                  <div className="space-y-4">
                     <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                        <Fingerprint size={40} />
                     </div>
                     <h3 className="text-2xl font-black text-white">Enrollment Successful</h3>
                     <p className="text-zinc-500 max-w-sm mx-auto text-sm font-medium">Your identity is now established within the AyushAlert infrastructure.</p>
                  </div>
                  
                  <button 
                    onClick={() => router.push('/patient/login')} 
                    className="w-full bg-white text-zinc-950 h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,255,255,0.1)] transition hover:bg-zinc-200"
                  >
                    Access Your Identity Node
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-12 px-6 border-t border-white/5 opacity-40">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
          AyushAlert Unified Identity Infrastructure Protocol (AUIIP) v4.2.0
        </p>
      </footer>
    </div>
  );
}
