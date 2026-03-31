'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { ScannerOverlay } from '@/components/ScannerOverlay';
import { Shield, Mail, ArrowLeft, Fingerprint, Activity } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [patientId, setPatientId] = useState('');
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

  // Auto-scan continuously when the camera is active
  useEffect(() => {
    let scanInterval: any;
    if (cameraActive && patientId.trim() && !loading && countdown === null) {
       scanInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.videoWidth === 0) return;
          
          const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3, inputSize: 416 });
          const detection = await faceapi.detectSingleFace(videoRef.current, options).withFaceLandmarks().withFaceDescriptor();

          if (detection) {
              clearInterval(scanInterval);
              
              // Start the 3-second countdown
              let timeRemaining = 3;
              setCountdown(timeRemaining);
              
              const countdownInterval = setInterval(async () => {
                  timeRemaining -= 1;
                  setCountdown(timeRemaining);
                  
                  if (timeRemaining <= 0) {
                      clearInterval(countdownInterval);
                      setCountdown(null);
                      setLoading(true); // Prevent race condition by immediately freezing scanner
                      
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
       }, 500); // Check every half second
    }
    return () => clearInterval(scanInterval);
  }, [cameraActive, patientId, loading, countdown]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // Triggers the API directly without waiting for a second button click
  const captureAndLogin = async (facialDescriptor: number[]) => {
    if (!patientId.trim()) return;

    setLoading(true);
    setError('');
    stopCamera();

    try {
      const res = await fetch('/api/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            patient_id: patientId,
            face_embedding: facialDescriptor
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Face Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('patient_id', data.patient_id);
      
      setSuccess('Biometric Access Verified. Entering portal...');
      
      setTimeout(() => {
         router.push('/patient/dashboard');
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
      // Wait for the user to fix the patient ID or manually retry to prevent infinite API call loops
    }
  };

  const requestOtp = async () => {
    if (!patientId.trim()) { setError('Please enter Patient ID first'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/patient/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId })
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
    if (!patientId.trim() || !otp.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/patient/login-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, otp: otp.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('patient_id', data.patient_id);
      router.push('/patient/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row relative overflow-hidden">
      {/* ── BACKGROUND MESH LAYER ────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none select-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[160px]" />
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* ── LEFT PANEL: THE PROTOCOL IDENTITY (DESKTOP ONLY) ───────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative z-10 border-r border-white/5 overflow-hidden">
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
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400"
          >
            <Shield size={12} strokeWidth={3} />
            Sovereign Access Protocol
          </motion.div>
          
          <motion.h1 
            className="text-6xl font-black tracking-tighter leading-[0.85] text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Authenticate <br /> 
            <span className="text-zinc-600">Your Identity.</span>
          </motion.h1>

          <motion.p 
            className="text-lg text-zinc-500 font-medium leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Access your unified health records via biometric orchestration or secure cryptographic tokens. Your data, your sovereignty.
          </motion.p>
        </div>

        <motion.div 
          className="flex items-center gap-12 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: 'Latency', value: '42ms' },
            { label: 'Integrity', value: 'Verified' },
            { label: 'Security', value: 'AES-256' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{stat.label}</p>
              <p className="text-sm font-bold text-zinc-300 font-mono">{stat.value}</p>
            </div>
          ))}
        </motion.div>
        
        {/* Subtle decorative grid in left panel */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 border border-white/[0.03] rounded-full" />
      </div>

      {/* ── RIGHT PANEL: THE FUNCTIONAL TERMINAL ───────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 relative z-10 overflow-y-auto min-h-screen lg:min-h-0">
        <div className="w-full max-w-[420px] space-y-10">
          
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <BrandLogo variant="horizontal" size={32} />
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-400">Institutional Hub</span>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-white">Sovereign Point</h2>
                <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition flex items-center gap-2 group">
                   <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                   Back
                </Link>
             </div>
             <p className="text-zinc-500 text-sm font-medium">Verify your decentralized identifier to enter.</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key="login-form-container"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Alert Area */}
              {(error || success) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-3 ${
                    error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${error ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                  {error || success}
                </motion.div>
              )}

              {/* ID INPUT */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-cyan-500/5 blur-xl group-focus-within:bg-cyan-500/10 transition-colors" />
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-2 px-1">Patient Identity Identifier (PII)</label>
                    <input 
                      required 
                      placeholder="PAT_••••••••"
                      value={patientId}
                      type="text" 
                      onChange={(e) => setPatientId(e.target.value)} 
                      disabled={otpSent || loading}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-white text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none disabled:opacity-50 transition shadow-2xl" 
                    />
                  </div>
                </div>

                {/* Method Toggle */}
                {!otpSent && (
                  <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800/80 shadow-inner">
                    <button onClick={() => setLoginMethod('face')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${loginMethod === 'face' ? 'bg-zinc-800 text-cyan-400 shadow-xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}>
                      <Fingerprint size={14} /> Biometrics
                    </button>
                    <button onClick={() => { setLoginMethod('otp'); stopCamera(); }} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${loginMethod === 'otp' ? 'bg-zinc-800 text-cyan-400 shadow-xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}>
                      <Mail size={14} /> Auth Token
                    </button>
                  </div>
                )}
              </div>

              {/* AUTHENTICATION AREA */}
              <div className="relative">
                {loginMethod === 'face' ? (
                  <div className="aspect-video w-full bg-zinc-900/50 rounded-2xl border border-zinc-800/80 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
                    {!modelsLoaded && (
                      <div className="flex flex-col items-center gap-3">
                        <Activity className="text-cyan-500/40 animate-pulse" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Local Neural Engine Calibrating...</p>
                      </div>
                    )}
                    
                    {modelsLoaded && !cameraActive && (
                      <button 
                        onClick={startCamera} 
                        disabled={!patientId.trim()}
                        className="relative z-30 group/btn h-14 w-14 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:grayscale disabled:opacity-30 disabled:scale-100 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                      >
                        <Fingerprint size={28} className="group-hover/btn:animate-pulse" />
                      </button>
                    )}

                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      playsInline
                      className={`w-full h-full object-cover transition-opacity duration-700 ${!cameraActive ? 'opacity-0' : 'opacity-100'}`}
                    />

                    {cameraActive && (
                      <ScannerOverlay 
                        status={loading ? 'verifying' : countdown !== null ? 'verifying' : 'scanning'}
                        countdown={countdown}
                        label={loading ? "Verifying Signature" : countdown !== null ? "Geometry Fixed" : "Live Scan: Active"} 
                      />
                    )}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 text-center space-y-6 shadow-2xl"
                  >
                    {!otpSent ? (
                      <div className="space-y-6">
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed uppercase tracking-wide">A unique 6-digit cryptographic token will be dispatched to your decentralized repository contact.</p>
                        <button 
                          onClick={requestOtp} 
                          disabled={loading || !patientId.trim()} 
                          className="w-full bg-white text-zinc-950 h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                        >
                          {loading ? 'Transmitting...' : 'Dispatch Protocol Token'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        <input
                          type="text"
                          placeholder="000000"
                          value={otp}
                          onChange={e => setOtp(e.target.value)}
                          className="w-full bg-transparent border-b-4 border-zinc-800 text-center text-white font-mono text-5xl tracking-[0.4em] outline-none focus:border-cyan-500 focus:text-cyan-400 transition-all placeholder-zinc-800"
                          maxLength={6}
                        />
                        <button 
                          onClick={verifyOtp} 
                          disabled={loading || otp.length < 6} 
                          className="w-full bg-cyan-500 text-zinc-950 h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-[0.98]"
                        >
                          {loading ? 'Verifying Integrity...' : 'Establish Handshake'}
                        </button>
                        
                        <div className="flex justify-between items-center w-full px-2">
                          <button onClick={requestOtp} disabled={loading} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition">Resend</button>
                          <button onClick={() => { setOtpSent(false); setOtp(''); }} disabled={loading} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition">Reset Identifier</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Footer Branding */}
          <div className="pt-20 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4 px-8 leading-loose">
              By authenticating, you acknowledge the sovereignty of your health data under the AyushAlert Unified Infrastructure Protocol.
            </p>
            <p className="text-xs font-bold text-zinc-500">
              New to the protocol? <Link href="/patient/register" className="text-cyan-400 hover:text-cyan-300 transition-colors ml-1 uppercase tracking-widest">Register Identity</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
