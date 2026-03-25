'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as faceapi from 'face-api.js';

export default function DoctorLogin() {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
                      
                      if (!videoRef.current) {
                          setError("Camera not found.");
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

      localStorage.setItem('token', data.token);
      localStorage.setItem('doctor_id', data.doctor_id);
      
      router.push('/doctor/dashboard');
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
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('doctor_id', data.doctor_id);
      router.push('/doctor/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl mt-20 border border-zinc-800/80 shadow-emerald-500/5">
      <h2 className="text-2xl font-extrabold mb-6 text-center text-white">Doctor Secure Login</h2>
      
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm font-semibold">{error}</div>}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 font-semibold mb-1">Doctor ID</label>
          <input 
            required 
            placeholder="DOC_..."
            value={doctorId}
            type="text" 
            onChange={(e) => setDoctorId(e.target.value)} 
            disabled={otpSent}
            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl shadow-sm p-3 text-center text-lg font-mono outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:bg-zinc-800 disabled:text-zinc-500" 
          />
        </div>

        {/* Method Toggle */}
        {!otpSent && (
        <div className="flex bg-black/40 p-1 rounded-xl border border-zinc-800/80 mt-4">
           <button onClick={() => setLoginMethod('face')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${loginMethod === 'face' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>FaceID</button>
           <button onClick={() => { setLoginMethod('otp'); stopCamera(); }} className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${loginMethod === 'otp' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Email OTP</button>
        </div>
        )}

        {loginMethod === 'face' ? (
        <div className="bg-black/40 border border-zinc-800/80 p-6 rounded-xl flex flex-col items-center mt-4">
            {!modelsLoaded && <p className="text-sm text-zinc-500 italic">Initializing Facial Model...</p>}
            
            {modelsLoaded && !cameraActive && (
                <button 
                  onClick={startCamera} 
                  disabled={!doctorId.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2 rounded-xl transition disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                 >
                  Turn on Camera
                </button>
            )}

            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className={`rounded-lg border-2 border-emerald-300 mt-3 shadow ${!cameraActive ? 'hidden' : ''}`}
                style={{ width: '100%', maxWidth: '300px' }}
            />

            {cameraActive && !loading && countdown === null && (
                <p className="mt-4 text-sm font-bold text-emerald-400 animate-pulse">
                   Scanning for your face... Please look forward.
                </p>
            )}

            {countdown !== null && (
                <p className="mt-4 text-sm font-bold border border-emerald-500/50 bg-emerald-500/10 p-3 rounded-lg text-emerald-400 animate-pulse text-center">
                   Face detected! Auto-logging in in <span className="text-xl mx-1">{countdown}</span> seconds...
                </p>
            )}

            {loading && (
                <p className="mt-4 text-sm font-bold text-emerald-500 animate-pulse">
                   Authenticating...
                </p>
            )}
        </div>
        ) : (
          <div className="mt-4 bg-black/40 p-6 rounded-xl border border-zinc-800/80 text-center">
             {!otpSent ? (
                <div>
                   <p className="text-sm text-zinc-400 mb-4">A secure 6-digit code will be sent to your registered clinic email.</p>
                   <button onClick={requestOtp} disabled={loading || !doctorId.trim()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition disabled:opacity-50">
                      {loading ? 'Generating...' : 'Send Login Code'}
                   </button>
                </div>
             ) : (
                <div className="space-y-4">
                   <p className="text-sm text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg">✅ Secure code sent!</p>
                   <input
                     type="text"
                     placeholder="Enter 6-digit OTP"
                     value={otp}
                     onChange={e => setOtp(e.target.value)}
                     className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                     maxLength={6}
                   />
                   <button onClick={verifyOtp} disabled={loading || otp.length < 6} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify & Enter Portal'}
                   </button>
                   <div className="flex justify-between items-center w-full pt-2 px-1">
                      <button onClick={requestOtp} disabled={loading} className="text-xs text-emerald-400 font-bold hover:text-emerald-300 transition uppercase tracking-widest flex items-center gap-1">
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

      <p className="mt-8 text-center text-sm text-zinc-500 border-t border-zinc-800/50 pt-4">
        Don&apos;t have an account? <Link href="/doctor/register" className="text-emerald-500 hover:text-emerald-400 font-medium transition">Register here</Link>
      </p>
    </div>
  );
}
