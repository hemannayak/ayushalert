'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as faceapi from 'face-api.js';

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  
  // States for flow
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 = scan face, 2 = wait for OTP, 3 = view records
  
  // Scanner states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  // Real Consent Flow States
  const [manualPatientId, setManualPatientId] = useState('');
  const [scannedPatientId, setScannedPatientId] = useState<string | null>(null);
  const [consentRequestId, setConsentRequestId] = useState<string | null>(null);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Live Records State
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [viewRecord, setViewRecord] = useState<any>(null);

  useEffect(() => {
    const dId = localStorage.getItem('doctor_id');
    if (!dId) {
      router.push('/doctor/login');
      return;
    }
    setDoctorId(dId);

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
      }
    };
    loadModels();
    
    return () => stopCamera();
  }, [router]);

  useEffect(() => {
     let interval: any;
     if (step === 3 && timeLeft > 0) {
         interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
         }, 1000);
     } else if (step === 3 && timeLeft === 0) {
         alert("Session Expired! Re-authentication required.");
         setStep(1);
         setScannedPatientId(null);
         setTimeLeft(600);
     }
     return () => clearInterval(interval);
  }, [step, timeLeft]);

  const startCamera = async () => {
    if (!modelsLoaded) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
        alert("Camera required for patient identification");
    }
  };

  useEffect(() => {
    let scanInterval: any;
    if (cameraActive && step === 1) {
       scanInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.videoWidth === 0) return;
          
            const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3, inputSize: 416 });
            const detection = await faceapi.detectSingleFace(videoRef.current, options).withFaceLandmarks().withFaceDescriptor();

            if (detection) {
                clearInterval(scanInterval);
                stopCamera();
                
                try {
                    const res = await fetch('/api/doctor/scan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ face_embedding: Array.from(detection.descriptor) })
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok && data.success) {
                        handleRequestAccess(data.patient_id);
                    } else {
                        alert(data.error || "No matching patient found in the secure database.");
                        startCamera(); // restart scanning
                    }
                } catch (err) {
                    console.error(err);
                    alert("Failed to connect to biometric database.");
                    startCamera();
                }
            }
         }, 500); 
      }
      return () => clearInterval(scanInterval);
    }, [cameraActive, step]);

    // Triggers the real API to create a consent request in MongoDB
    const handleRequestAccess = async (pid: string) => {
        if (!pid.trim()) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/doctor/request-access', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ patient_id: pid })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setScannedPatientId(pid);
            setConsentRequestId(data.request_id);
            setStep(2); // Move to Waiting for Patient screen
        } catch (err: any) {
            alert("Error requesting access: " + err.message);
        }
    };

    // Poll the Consent Status while on Step 2
    useEffect(() => {
        let pollInterval: any;
        if (step === 2 && consentRequestId) {
            const token = localStorage.getItem('token');
            pollInterval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/doctor/check-consent?request_id=${consentRequestId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === 'approved') {
                            // Patient approved via OTP! View records!
                            try {
                               const recordsData = await fetch(`/api/doctor/records?patient_id=${scannedPatientId}&request_id=${consentRequestId}`, {
                                   headers: { 'x-api-key': 'demo_hospital_key_2024' }
                               });
                               if (recordsData.ok) {
                                  const realRecords = await recordsData.json();
                                  setPatientRecords(realRecords);
                               }
                            } catch (e) {
                               console.error("Failed to fetch live records");
                            }
                            setStep(3);
                            setTimeLeft(600);
                        } else if (data.status === 'rejected') {
                            alert("The patient has rejected the access request.");
                            setStep(1);
                        }
                    }
                } catch (e) {
                    // silent ignore polling errors
                }
            }, 2500);
        }
        return () => clearInterval(pollInterval);
    }, [step, consentRequestId]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('doctor_id');
      router.push('/doctor/login');
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!doctorId) return null;

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-8 px-4 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="glass-panel p-6 border-t-4 border-t-emerald-500 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
           <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-emerald-400">🏥</span> Clinical Authorization Portal 
              {step === 3 && (
                 <span className="ml-4 bg-red-900/30 text-red-400 border border-red-500/50 text-sm px-4 py-1.5 rounded-full animate-pulse shadow-inner font-mono tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    LIVE ACCESS: {formatTime(timeLeft)}
                 </span>
              )}
           </h1>
           <p className="text-zinc-400 text-sm mt-2 font-mono">Authenticated Node: <span className="text-zinc-300 bg-zinc-900/50 px-2 py-0.5 rounded">{doctorId}</span></p>
        </div>
        <button onClick={handleLogout} className="relative z-10 bg-zinc-900/80 border border-zinc-700/80 hover:bg-zinc-800 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-inner">
           Terminate Session
        </button>
      </div>

      {/* STEP 1: SCAN PATIENT OR ENTER ID */}
      {step === 1 && (
         <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
            <div className="text-center max-w-2xl mx-auto mb-10">
               <h2 className="text-2xl font-bold text-white mb-2">Patient Verification Protocol</h2>
               <p className="text-zinc-400">Identify the target entity to request cryptographic access to their decentralized health records.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-start relative z-10">
                
                {/* MANUAL ID ENTRY */}
                <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800/80 hover:border-indigo-500/30 transition-colors flex flex-col h-full shadow-inner relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="font-bold text-indigo-400 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                       <span className="bg-indigo-900/30 text-indigo-300 w-6 h-6 rounded flex items-center justify-center border border-indigo-500/30">1</span> Analog Entry
                    </h3>
                    <div className="flex-1 flex flex-col justify-center gap-4">
                       <input 
                          type="text" 
                          placeholder="Enter Network ID (PAT_...)" 
                          value={manualPatientId} 
                          onChange={e => setManualPatientId(e.target.value)} 
                          className="w-full bg-zinc-950 border border-zinc-700/80 p-4 rounded-xl text-center font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner text-lg placeholder-zinc-600"
                       />
                       <button 
                          onClick={() => handleRequestAccess(manualPatientId)} 
                          disabled={!manualPatientId.trim()}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:shadow-none"
                       >
                          Initialize Authorization
                       </button>
                    </div>
                </div>

                {/* BIOMETRIC SCAN */}
                <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/30 transition-colors flex flex-col h-full shadow-inner relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="font-bold text-emerald-400 mb-6 uppercase tracking-widest text-sm flex items-center gap-2">
                       <span className="bg-emerald-900/30 text-emerald-300 w-6 h-6 rounded flex items-center justify-center border border-emerald-500/30">2</span> Identity Biometrics
                    </h3>
                    
                    <div className="flex-1 flex flex-col justify-center">
                       {!cameraActive ? (
                          <button onClick={startCamera} className="w-full bg-zinc-950 hover:bg-black text-white font-bold py-4 px-4 rounded-xl transition border border-zinc-700/80 shadow-inner group-hover:border-emerald-500/50 flex flex-col items-center gap-2">
                            <span className="text-3xl mb-1">👁️</span>
                            Activate Optics Matrix
                          </button>
                       ) : (
                          <div className="flex flex-col items-center relative overflow-hidden rounded-xl border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-black">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover origin-center max-h-[250px]" />
                            <div className="absolute bottom-0 left-0 w-full bg-emerald-900/80 backdrop-blur-md p-2 text-center border-t border-emerald-500/50">
                               <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest animate-pulse">Computing Facial Vectors...</p>
                            </div>
                          </div>
                       )}
                    </div>
                </div>

            </div>
         </div>
      )}

      {/* STEP 2: AWAITING PATIENT OTP APPROVAL */}
      {step === 2 && (
          <div className="glass-panel p-10 border-t-4 border-t-orange-500 text-center max-w-2xl mx-auto relative overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
              <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Authorization Transmitted</h2>
              <p className="text-2xl font-mono bg-orange-900/20 text-orange-400 border border-orange-500/30 inline-block px-6 py-3 rounded-xl font-bold mb-8 shadow-inner tracking-widest">{scannedPatientId}</p>
              
              <div className="border border-zinc-800/80 p-8 rounded-2xl bg-zinc-900/40 flex flex-col items-center justify-center relative z-10 shadow-inner">
                  <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-6" />
                  <h3 className="font-bold text-white mb-3 text-lg">Awaiting Cryptographic Handshake...</h3>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                     A live consent protocol has been triggered. The patient must review the request on their device and authenticate via a time-sensitive One-Time Password to temporarily unlock the required analog records.
                  </p>
              </div>

              <button onClick={() => setStep(1)} className="mt-8 text-sm text-zinc-500 font-bold hover:text-white uppercase tracking-widest transition border-b border-transparent hover:border-zinc-500 pb-1">
                 Abort Handshake
              </button>
          </div>
      )}

      {/* STEP 3: VIRTUAL HEALTH RECORD VIEW */}
      {step === 3 && (
          <div className="glass-panel p-8 md:p-10 border-t-4 border-t-emerald-500 animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800/80 pb-6 mb-8 gap-4">
                 <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Decentralized Health Records</h2>
                    <p className="text-zinc-400 mt-2 text-sm flex items-center gap-2">
                       Temporary authorization layer granted for node: 
                       <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700 text-emerald-400 shadow-inner">{scannedPatientId}</span>
                    </p>
                 </div>
                 <button onClick={() => setStep(1)} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold px-6 py-3 rounded-xl shrink-0 transition border border-red-900/50 shadow-inner w-full md:w-auto uppercase tracking-wider text-sm">
                    Sever Connection
                 </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 border border-zinc-800/80 rounded-2xl p-6 bg-zinc-900/30 shadow-inner">
                    <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-2 border-l-4 border-indigo-500 pl-3">
                       Live Patient Ledger
                    </h3>
                    <ul className="space-y-4">
                        {patientRecords.length === 0 ? (
                            <li className="text-zinc-500 text-sm italic py-4">No decentralized records located for this node.</li>
                        ) : patientRecords.map((record, idx) => (
                           <li key={idx} className="glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:-translate-y-1 transition-all border border-zinc-700/50 rounded-xl bg-zinc-900/60 shadow-inner">
                              <div>
                                 <div className="flex items-center gap-3">
                                   <p className="font-bold text-white text-lg">{record.document_type || 'Clinical Document'}</p>
                                   <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${record.verified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                      {record.verified ? 'Verified' : 'Unverified'}
                                   </span>
                                 </div>
                                 <div className="flex flex-wrap gap-4 mt-2 text-xs font-mono text-zinc-500">
                                     <span>TS: {new Date(record.uploaded_at).toLocaleDateString()}</span>
                                     <span>ID: {record.record_id}</span>
                                     <span className="text-indigo-400">SRC: {record.source.toUpperCase()}</span>
                                 </div>
                              </div>
                              <button onClick={() => setViewRecord(record)} className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-inner w-full sm:w-auto mt-3 sm:mt-0">
                                 Decrypt View
                              </button>
                           </li>
                        ))}
                    </ul>
                 </div>

                 <div className="border border-emerald-900/50 rounded-2xl p-8 bg-emerald-900/10 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                     <div className="w-20 h-20 bg-emerald-900/30 border border-emerald-500/30 rounded-full flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                        🛡️
                     </div>
                     <h3 className="font-bold text-emerald-400 mb-3 text-lg">ABDM & FHIR Compliance</h3>
                     <p className="text-sm text-emerald-200/60 leading-relaxed font-medium">All parameters rendered in this sandbox remain securely stored on decentralized protocols. Analog data is strictly <strong className="text-emerald-300">not cached</strong> by the hospital endpoint, strictly enforcing ABDM data locality directives.</p>
                 </div>
              </div>
          </div>
      )}

      {/* SECURE DECRYPTION MODAL */}
      {viewRecord && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={() => setViewRecord(null)}>
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] w-full max-w-5xl max-h-[95vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
              <div>
                 <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <span className="text-indigo-500">🔐</span> Secure Record Decryption: {viewRecord.document_type || 'Document'}
                 </h3>
                 <p className="text-zinc-500 text-xs font-mono mt-1">HASH: {viewRecord.record_id}</p>
              </div>
              <button onClick={() => setViewRecord(null)} className="text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold px-4 py-2 rounded-lg transition border border-zinc-800">Close Pipeline</button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-[75vh]">
               {/* Image Preview Side */}
               <div className="md:w-1/2 p-4 bg-black flex items-center justify-center overflow-auto border-r border-zinc-800 relative group">
                  <div className="text-zinc-700 absolute inset-0 flex items-center justify-center font-mono opacity-20 pointer-events-none select-none text-xl rotate-45">ENCRYPTED ORIGIN</div>
                  {viewRecord.file_url?.toLowerCase().includes('.pdf') || viewRecord.file_url?.toLowerCase().includes('.docx') || viewRecord.file_url?.toLowerCase().includes('.doc') ? (
                    <iframe src={viewRecord.file_url} className="w-full h-full rounded border border-zinc-800 relative z-10" />
                  ) : (
                    <img src={viewRecord.file_url} alt="Medical Record" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl relative z-10" />
                  )}
               </div>

               {/* Data Side */}
               <div className="md:w-1/2 p-6 bg-zinc-900/30 overflow-y-auto">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-sm mb-6 border-b border-emerald-900 pb-2">AI-Vectored Cryptographic Data</h4>
                  
                  {viewRecord.structured_data ? (
                     <div className="space-y-6">
                        {['diagnosis', 'symptoms', 'medicines', 'dosage'].map(field => {
                           const dataArr = viewRecord.structured_data[field];
                           if (!dataArr || dataArr.length === 0) return null;
                           return (
                              <div key={field} className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-4 shadow-inner">
                                 <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">{field}</span>
                                 <ul className="text-sm text-zinc-300 font-mono space-y-1">
                                    {dataArr.map((item: string, i: number) => (
                                       <li key={i} className="flex gap-2"><span className="text-indigo-500">▶</span> {item}</li>
                                    ))}
                                 </ul>
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="text-zinc-500 italic text-sm">No structured data vectors available for this record block.</div>
                  )}

                  <div className="mt-8 pt-4 border-t border-zinc-800 text-xs text-zinc-500 font-mono space-y-1">
                     <p>Neural Confidence: <span className="text-white">{viewRecord.confidence_score}%</span></p>
                     <p>Source Node: <span className="text-white">{viewRecord.source.toUpperCase()}</span></p>
                     <p>Verification Status: <span className={viewRecord.verified ? 'text-emerald-400' : 'text-yellow-400'}>{viewRecord.verified ? 'HUMAN VERIFIED' : 'AI UNVERIFIED'}</span></p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
