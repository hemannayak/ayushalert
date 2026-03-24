'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as faceapi from 'face-api.js';

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

      setSuccess(`Registration successful! Your Patient ID is: ${data.patient_id}. Please save this ID. You can now login using your face.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-4xl glass-panel p-8 md:p-12 z-10 border-t-4 border-t-indigo-500">
        <div className="text-center mb-10">
           <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner text-indigo-400">
             ✨
           </div>
           <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Patient Registration</h2>
           <p className="text-zinc-400 text-sm">Create your biometric identity for the healthcare network.</p>
        </div>
      
        {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}
        {success && <div className="bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg mb-6 text-sm font-medium">{success}</div>}
      
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
              <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
                  <input required name="name" type="text" onChange={handleChange} className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                  <input required name="email" type="email" onChange={handleChange} className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Mobile</label>
                  <input required name="mobile" type="text" onChange={handleChange} className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Password (Fallback)</label>
                  <input required name="password" type="password" onChange={handleChange} className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Gender</label>
                <select required name="gender" onChange={handleChange} className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none shadow-inner">
                  <option value="" className="bg-zinc-800 text-zinc-400">Select Gender</option>
                  <option value="Male" className="bg-zinc-800">Male</option>
                  <option value="Female" className="bg-zinc-800">Female</option>
                  <option value="Other" className="bg-zinc-800">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Date of Birth</label>
                <input required name="dob" type="date" onChange={handleChange} className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner" style={{ colorScheme: 'dark' }} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-1">Region Pincode</label>
                <input name="pincode" type="text" placeholder="e.g. 500032" onChange={handleChange} className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner" />
              </div>
            </div>
  
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center relative overflow-hidden shadow-inner">
               <h3 className="font-bold text-white mb-2 tracking-tight text-lg">Biometric Signature</h3>
               <p className="text-zinc-400 text-sm mb-6">Your unique facial geometry serves as your primary cryptographic key.</p>
               
               {!modelsLoaded && <p className="text-zinc-500 italic text-sm">Waking up Neural Engine...</p>}
               
               {modelsLoaded && !cameraActive && !facialDescriptor && (
                  <button type="button" onClick={startCamera} className="bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-full transition shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                    Initialize Scanner
                  </button>
               )}
  
               <div className="flex justify-center mt-4">
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     muted 
                     playsInline
                     className={`rounded-xl border border-indigo-500/30 object-cover shadow-2xl ${!cameraActive ? 'hidden' : ''}`}
                     style={{ width: '320px', height: '240px' }}
                   />
               </div>
  
               {cameraActive && !facialDescriptor && !capturing && (
                   <p className="mt-6 text-sm font-semibold text-indigo-400 animate-pulse bg-indigo-900/20 inline-block px-4 py-2 rounded-full border border-indigo-500/20">
                     Position your face clearly for geometry scan...
                   </p>
               )}
  
               {cameraActive && !facialDescriptor && capturing && (
                   <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center flex-col z-10">
                     <p className="text-sm font-bold text-white mb-2">Acquiring Biometrics</p>
                     <p className="text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-bounce">
                       Hold Still
                     </p>
                   </div>
               )}
  
               {facialDescriptor && (
                   <div className="mt-6 p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                      <p className="font-semibold text-emerald-400 flex items-center justify-center">
                         ✅ Cryptographic Signature Captured 
                      </p>
                      <button 
                         type="button" 
                         onClick={() => { setFacialDescriptor(null); startCamera(); }}
                         className="mt-3 text-xs text-zinc-400 hover:text-white transition uppercase tracking-wider font-semibold"
                      >
                         Retake Scan
                      </button>
                   </div>
               )}
            </div>
  
            <button disabled={loading || !facialDescriptor} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition disabled:opacity-50 disabled:shadow-none mt-4 text-lg tracking-wide">
              {loading ? 'Encrypting Identity...' : 'Finalize Registration'}
            </button>
          </form>
        )}
  
        {success && (
          <button onClick={() => router.push('/patient/login')} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition text-lg tracking-wide">
            Proceed to Secure Login
          </button>
        )}
      </div>
      
      <div className="mt-8 text-center bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 px-6 py-3 rounded-full">
        <p className="text-sm text-zinc-400">
          Already registered? <Link href="/patient/login" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition">Login here</Link>
        </p>
      </div>
    </div>
  );
}
