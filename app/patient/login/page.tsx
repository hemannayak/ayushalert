'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as faceapi from 'face-api.js';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-panel p-10 z-10 border-t-4 border-t-indigo-500">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Home
          </Link>
        </div>
        <div className="text-center mb-8">
           <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner text-indigo-400">
             👤
           </div>
           <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Patient Security</h2>
           <p className="text-zinc-400 text-sm">Authenticate your identity to access the portal.</p>
        </div>
      
        {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}
        {success && <div className="bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 p-3 rounded-lg mb-6 text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>{success}</div>}
      
      <div className="space-y-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Patient ID</label>
          <input 
            required 
            placeholder="PAT_..."
            value={patientId}
            type="text" 
            onChange={(e) => setPatientId(e.target.value)} 
            disabled={otpSent}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-white text-center text-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition" 
          />
        </div>

        {/* Method Toggle */}
        {!otpSent && (
        <div className="flex bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800 mb-6">
           <button onClick={() => setLoginMethod('face')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginMethod === 'face' ? 'bg-zinc-800/80 shadow-md text-indigo-400 border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>FaceID Scan</button>
           <button onClick={() => { setLoginMethod('otp'); stopCamera(); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-zinc-800/80 shadow-md text-indigo-400 border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>Email Token</button>
        </div>
        )}

        {loginMethod === 'face' ? (
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 flex flex-col items-center min-h-[250px] justify-center relative overflow-hidden">
            {!modelsLoaded && <p className="text-sm text-zinc-500 italic">Initializing Local AI Models...</p>}
            
            {modelsLoaded && !cameraActive && (
                <button 
                  onClick={startCamera} 
                  disabled={!patientId.trim()}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-8 py-3 rounded-full font-semibold transition disabled:opacity-50 shadow-lg"
                 >
                  Initialize Camera
                </button>
            )}

            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className={`rounded-xl border border-indigo-500/30 object-cover shadow-2xl ${!cameraActive ? 'hidden' : ''}`}
                style={{ width: '100%', height: '200px' }}
            />

            {cameraActive && !loading && countdown === null && (
                <div className="absolute bottom-4 bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-full border border-zinc-700">
                  <p className="text-xs font-semibold text-indigo-400 animate-pulse">
                    Scanning geometry... Please look directly forward.
                  </p>
                </div>
            )}

            {countdown !== null && (
                <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center flex-col z-10">
                  <p className="text-sm font-bold text-white mb-2">Biometrics Acquired</p>
                  <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-bounce">
                    {countdown}
                  </div>
                </div>
            )}

            {loading && (
                <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <p className="text-sm font-bold text-indigo-400 animate-pulse bg-zinc-800 px-6 py-2 rounded-full border border-zinc-700">
                    Authenticating Match...
                  </p>
                </div>
            )}
        </div>
        ) : (
          <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 text-center">
             {!otpSent ? (
                <div>
                   <p className="text-sm text-zinc-400 mb-6 leading-relaxed">A secure 6-digit cryptographic token will be dispatched to your registered email.</p>
                   <button onClick={requestOtp} disabled={loading || !patientId.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] transition disabled:opacity-50">
                      {loading ? 'Transmitting...' : 'Request Auth Token'}
                   </button>
                </div>
             ) : (
                <div className="space-y-6">
                   <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 p-3 rounded-lg text-xs font-semibold">
                      ✅ Token securely transmitted.
                   </div>
                   <input
                     type="text"
                     placeholder="000000"
                     value={otp}
                     onChange={e => setOtp(e.target.value)}
                     className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-4 text-center text-white font-mono text-3xl tracking-[0.5em] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                     maxLength={6}
                   />
                   <button onClick={verifyOtp} disabled={loading || otp.length < 6} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition disabled:opacity-50">
                      {loading ? 'Verifying signature...' : 'Verify & Enter'}
                   </button>
                   <div className="flex justify-between items-center w-full pt-2 px-1">
                      <button onClick={requestOtp} disabled={loading} className="text-xs text-indigo-400 font-bold hover:text-indigo-300 transition uppercase tracking-widest flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                         Resend
                      </button>
                      <button onClick={() => { setOtpSent(false); setOtp(''); }} disabled={loading} className="text-xs text-zinc-500 font-bold hover:text-white transition uppercase tracking-widest text-right">
                         Change ID
                      </button>
                   </div>
                </div>
             )}
          </div>
        )}
      </div>
      </div>

      <div className="mt-8 text-center bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 px-6 py-3 rounded-full">
        <p className="text-sm text-zinc-400">
          Unregistered node? <Link href="/patient/register" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition">Register Identity</Link>
        </p>
      </div>
    </div>
  );
}
