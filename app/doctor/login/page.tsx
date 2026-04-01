'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { ScannerOverlay } from '@/components/ScannerOverlay';
import { Stethoscope, Lock, Mail, Fingerprint, Activity, Database } from "lucide-react";

export default function DoctorLogin() {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login Method Toggle
  const [loginMethod, setLoginMethod] = useState<'face' | 'otp'>('face');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // Face recognition states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

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
    if (!doctorId.trim()) {
      setError("Please enter your Doctor ID first before scanning.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
        setError("Unable to access camera permissions.");
    }
  };

  useEffect(() => {
    let scanInterval: any;
    if (cameraActive && doctorId.trim() && !loading && countdown === null) {
       scanInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.videoWidth === 0) return;
          
          const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3, inputSize: 416 });
          const detection = await faceapi.detectSingleFace(videoRef.current, options).withFaceLandmarks().withFaceDescriptor();

          if (detection) {
              clearInterval(scanInterval);
              
              let timeRemaining = 3;
              setCountdown(timeRemaining);
              
              const countdownInterval = setInterval(async () => {
                  timeRemaining -= 1;
                  setCountdown(timeRemaining);
                  
                  if (timeRemaining <= 0) {
                      clearInterval(countdownInterval);
                      setCountdown(null);
                      setLoading(true);
                      
                      if (!videoRef.current) {
                          setError("Camera not found.");
                          setLoading(false);
                          return;
                      }
                      
                      const finalDetection = await faceapi.detectSingleFace(videoRef.current, options).withFaceLandmarks().withFaceDescriptor();
                      if (finalDetection) {
                          captureAndLogin(Array.from(finalDetection.descriptor));
                      } else {
                          setError("Face lost during capture. Please try again.");
                      }
                  }
              }, 1000);
          }
       }, 500);
    }
    return () => clearInterval(scanInterval);
  }, [cameraActive, doctorId, loading, countdown]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const captureAndLogin = async (facialDescriptor: number[]) => {
    if (!doctorId.trim()) return;

    setLoading(true);
    setError('');
    stopCamera();

    try {
      const res = await fetch('/api/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            doctor_id: doctorId,
            face_embedding: facialDescriptor
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Face Login failed');

      localStorage.setItem('doctor_token', data.token);
      localStorage.setItem('doctor_id', data.doctor_id);
      
      setSuccess('Identity verified. Entering dashboard...');
      
      setTimeout(() => {
          router.push('/doctor/dashboard');
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    if (!doctorId.trim()) { setError('Please enter Doctor ID first'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/doctor/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: doctorId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!doctorId.trim() || !otp.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/doctor/login-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: doctorId, otp: otp.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      localStorage.setItem('doctor_token', data.token);
      localStorage.setItem('doctor_id', data.doctor_id);
      router.push('/doctor/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row relative overflow-hidden">
      {/* ── BACKGROUND MESH LAYER ────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.3] pointer-events-none select-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-zinc-600/10 rounded-full blur-[160px]" />
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      {/* ── LEFT PANEL: CLINICAL AUTHORITY ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative z-10 border-r border-white/5 bg-zinc-950">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <BrandLogo variant="horizontal" size={32} />
          </Link>
        </motion.div>

        <div className="space-y-8 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
                <Stethoscope size={12} strokeWidth={3} />
                Secure Login
              </div>
              <h1 className="text-5xl font-extrabold tracking-tighter leading-[0.85] text-white uppercase">
                Doctor <br /> 
                <span className="text-zinc-600">Login.</span>
              </h1>
            </div>
          </motion.div>

          <motion.p 
            className="text-lg text-zinc-500 font-medium leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Access your dashboard to manage patients, view medical records, and connect with other specialists securely.
          </motion.p>
        </div>

        <motion.div 
          className="flex items-center gap-12 pt-8 border-t border-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: 'Network', value: 'Secure' },
            { label: 'Uptime', value: '99.99%' },
            { label: 'Standard', value: 'Verified' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{stat.label}</p>
              <p className="text-sm font-bold text-zinc-400 font-mono">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: THE COMMAND INTERFACE ─────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 relative z-10 overflow-y-auto min-h-screen lg:min-h-0">
        <div className="w-full max-w-[440px] space-y-10">
          
          {/* Mobile UI */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <BrandLogo variant="horizontal" size={32} />
              <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-black uppercase tracking-widest text-violet-400">Doctor Portal</span>
            </div>
          </div>

          <div className="space-y-3">
             <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                Secure Login
                <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2 py-1 rounded">V4.0</span>
             </h2>
             <p className="text-zinc-500 text-sm font-medium font-mono uppercase tracking-tight">System: Secure Login</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key="doctor-login-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Alert Area */}
              {(error || success) && (
                <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-3 ${
                  error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${error ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                  {error || success}
                </div>
              )}

              {/* ID INPUT */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-cyan-500/5 blur-2xl group-focus-within:bg-cyan-500/10 transition-colors" />
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-2 px-1">Your Doctor ID</label>
                    <input 
                      required 
                      placeholder="DOC_••••••••"
                      value={doctorId}
                      type="text" 
                      onChange={(e) => setDoctorId(e.target.value)} 
                      disabled={otpSent || loading}
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 text-white text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none disabled:opacity-50 transition shadow-2xl" 
                    />
                  </div>
                </div>

                {!otpSent && (
                  <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800/80 shadow-inner">
                    <button onClick={() => setLoginMethod('face')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${loginMethod === 'face' ? 'bg-zinc-800 text-cyan-400 shadow-xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}>
                      <Fingerprint size={14} /> Face Scan
                    </button>
                    <button onClick={() => { setLoginMethod('otp'); stopCamera(); }} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${loginMethod === 'otp' ? 'bg-zinc-800 text-cyan-400 shadow-xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}>
                      <Mail size={14} /> Login Code
                    </button>
                  </div>
                )}
              </div>

              {/* AUTH AREA */}
              <div className="relative min-h-[260px]">
                {loginMethod === 'face' ? (
                  <div className="aspect-video w-full bg-zinc-900/40 rounded-2xl border border-zinc-800/80 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                    {!modelsLoaded && (
                      <div className="flex flex-col items-center gap-3">
                        <Activity className="text-indigo-400 animate-pulse" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Loading...</p>
                      </div>
                    )}
                    
                    {modelsLoaded && !cameraActive && (
                      <button 
                        onClick={startCamera} 
                        className="h-16 w-16 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                      >
                        <Fingerprint size={32} />
                      </button>
                    )}

                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      playsInline
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${!cameraActive ? 'opacity-0' : 'opacity-100'}`}
                    />

                    {cameraActive && (
                      <ScannerOverlay 
                        status={loading ? 'verifying' : countdown !== null ? 'verifying' : 'scanning'}
                        countdown={countdown}
                        label={loading ? "Verifying..." : "Align your face"} 
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 text-center space-y-8 shadow-2xl">
                    {!otpSent ? (
                      <div className="space-y-6">
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed uppercase tracking-wide">Enter your Doctor ID to get a 6-digit login code.</p>
                        <button 
                          onClick={requestOtp} 
                          disabled={loading || !doctorId.trim()} 
                          className="w-full bg-white text-zinc-950 h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                        >
                          {loading ? 'Sending code...' : 'Get Code'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        <input
                          type="text"
                          placeholder="000000"
                          value={otp}
                          onChange={e => setOtp(e.target.value)}
                          className="w-full bg-transparent border-b-4 border-zinc-800 text-center text-white font-mono text-5xl tracking-[0.4em] outline-none focus:border-cyan-500 transition-all placeholder-zinc-900"
                          maxLength={6}
                        />
                        <button 
                          onClick={verifyOtp} 
                          disabled={loading || otp.length < 6} 
                          className="w-full bg-cyan-500 text-zinc-950 h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all"
                        >
                          {loading ? 'Verifying...' : 'Login'}
                        </button>
                        
                        <div className="flex justify-between items-center w-full px-2">
                          <button onClick={requestOtp} disabled={loading} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition">Resend</button>
                          <button onClick={() => { setOtpSent(false); setOtp(''); }} disabled={loading} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition">Reset ID</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pt-10 text-center space-y-6">
            <Link 
              href="/doctor/register" 
              className="group inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-cyan-400 transition-colors"
            >
              New to AyushAlert? <span className="text-zinc-400 group-hover:text-cyan-300 border-b border-zinc-800 group-hover:border-cyan-900 pb-0.5 transition-all">Sign Up Now</span>
            </Link>
            
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700 leading-loose">
              SECURE DOCTOR PORTAL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
