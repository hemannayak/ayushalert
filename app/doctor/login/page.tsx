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
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-20 border-t-4 border-emerald-600">
      <h2 className="text-2xl font-bold mb-6 text-center text-emerald-800">Doctor Secure Login</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-semibold">{error}</div>}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-semibold mb-1">Doctor ID</label>
          <input 
            required 
            placeholder="DOC_..."
            value={doctorId}
            type="text" 
            onChange={(e) => setDoctorId(e.target.value)} 
            disabled={otpSent}
            className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-black text-center text-lg font-mono focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100" 
          />
        </div>

        {/* Method Toggle */}
        {!otpSent && (
        <div className="flex bg-gray-100 p-1 rounded-lg">
           <button onClick={() => setLoginMethod('face')} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${loginMethod === 'face' ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}>FaceID</button>
           <button onClick={() => { setLoginMethod('otp'); stopCamera(); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${loginMethod === 'otp' ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}>Email OTP</button>
        </div>
        )}

        {loginMethod === 'face' ? (
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
            {!modelsLoaded && <p className="text-sm text-gray-500 italic">Initializing Facial Model...</p>}
            
            {modelsLoaded && !cameraActive && (
                <button 
                  onClick={startCamera} 
                  disabled={!doctorId.trim()}
                  className="bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-full transition disabled:opacity-50"
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
                <p className="mt-4 text-sm font-bold text-emerald-600 animate-pulse">
                   Scanning for your face... Please look forward.
                </p>
            )}

            {countdown !== null && (
                <p className="mt-4 text-sm font-bold border border-green-300 bg-green-50 p-3 rounded text-green-700 animate-pulse text-center">
                   Face detected! Auto-logging in in <span className="text-xl mx-1">{countdown}</span> seconds...
                </p>
            )}

            {loading && (
                <p className="mt-4 text-sm font-bold text-green-600 animate-pulse">
                   Authenticating...
                </p>
            )}
        </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
             {!otpSent ? (
                <div>
                   <p className="text-sm text-gray-600 mb-4">A secure 6-digit code will be sent to your registered clinic email.</p>
                   <button onClick={requestOtp} disabled={loading || !doctorId.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow transition disabled:opacity-50">
                      {loading ? 'Generating...' : 'Send Login Code'}
                   </button>
                </div>
             ) : (
                <div className="space-y-4">
                   <p className="text-sm text-green-700 font-semibold bg-green-100 p-2 rounded">✅ Secure code sent!</p>
                   <input
                     type="text"
                     placeholder="Enter 6-digit OTP"
                     value={otp}
                     onChange={e => setOtp(e.target.value)}
                     className="w-full border border-gray-300 rounded px-3 py-3 text-center text-black font-mono text-2xl tracking-[0.5em]"
                     maxLength={6}
                   />
                   <button onClick={verifyOtp} disabled={loading || otp.length < 6} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify & Enter Portal'}
                   </button>
                   <button onClick={() => { setOtpSent(false); setOtp(''); }} className="text-sm text-emerald-600 font-medium hover:underline mt-2">
                      Use a different Doctor ID?
                   </button>
                </div>
             )}
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
        Don&apos;t have an account? <Link href="/doctor/register" className="text-emerald-600 hover:underline font-medium">Register here</Link>
      </p>
    </div>
  );
}
