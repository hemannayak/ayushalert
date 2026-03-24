'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';

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
       }, 500); // Check every half second
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

      localStorage.setItem('token', data.token);
      localStorage.setItem('doctor_id', data.doctor_id);
      
      router.push('/doctor/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!modelsLoaded) {
     return <div className="text-center mt-20 text-gray-500">Loading AI Models...</div>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10 border-t-4 border-emerald-600">
      <h2 className="text-2xl font-bold mb-6 text-center text-emerald-800">Register as a Doctor</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-semibold">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required type="text" onChange={e => setFormData({...formData, name: `Dr. ${e.target.value}`})} className="w-full border rounded-md p-2" />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input required type="text" onChange={e => setFormData({...formData, license_number: e.target.value})} className="w-full border rounded-md p-2 uppercase" />
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select required onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full border rounded-md p-2">
                    <option value="">Select...</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                </select>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital ID</label>
            <input required type="text" value={formData.hospital_id} onChange={e => setFormData({...formData, hospital_id: e.target.value})} className="w-full border rounded-md p-2 font-mono" />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-md p-2" />
        </div>

        {/* Biometric Sector */}
        <div className="border-t border-gray-200 mt-6 pt-6 bg-gray-50 rounded p-4 text-center">
             <h3 className="font-semibold text-gray-800 mb-2">Secure Facial Registration</h3>
             
             {!modelsLoaded && <p className="text-gray-500 italic text-sm">Downloading AI models...</p>}
             
             {modelsLoaded && !cameraActive && !faceDescriptor && (
                <button type="button" onClick={startCamera} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded transition">
                  Enable Camera
                </button>
             )}

             <div className="flex justify-center mt-4">
                 <video 
                   ref={videoRef} 
                   autoPlay 
                   muted 
                   playsInline
                   className={`rounded-lg border-2 border-emerald-300 shadow max-w-full ${!cameraActive ? 'hidden' : ''}`}
                   style={{ width: '300px' }}
                 />
             </div>

             {cameraActive && !faceDescriptor && !capturing && (
                 <p className="mt-4 text-sm font-bold text-emerald-600 animate-pulse">
                   Position your face clearly in the camera frame to Auto-Capture...
                 </p>
             )}

             {cameraActive && !faceDescriptor && capturing && (
                 <p className="mt-4 text-sm font-bold text-emerald-600 animate-pulse">
                   Hold still... Capturing in 1.5s
                 </p>
             )}

             {faceDescriptor && (
                 <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded shadow-inner border border-emerald-200">
                    <p className="font-semibold flex items-center justify-center">
                       ✅ Facial Signature Captured Successfully 
                    </p>
                    <button 
                       type="button" 
                       onClick={() => { setFaceDescriptor(null); startCamera(); }}
                       className="mt-3 text-sm text-emerald-600 hover:text-emerald-800 underline font-medium"
                    >
                       Not looking directly? Retake Scan
                    </button>
                 </div>
             )}
        </div>

        <button 
          type="submit" 
          disabled={loading || !faceDescriptor} 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded transition mt-4 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Doctor Profile'}
        </button>
      </form>
    </div>
  );
}
