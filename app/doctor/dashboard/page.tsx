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
    if (!modelsLoaded) {
      alert('Optics models warming up, please wait a moment.');
      return;
    }
    setCameraActive(true);
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && !videoRef.current.srcObject) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          alert("Camera required for patient identification");
          setCameraActive(false);
        });
    }
  }, [cameraActive]);

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
      <div className="glass-panel p-6 border-b border-zinc-800/80 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/50">
        <div className="relative z-10">
           <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-3">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Clinical Authorization Portal
              {step === 3 && (
                 <span className="ml-4 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full font-mono tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                <div className="bg-zinc-950/40 p-8 rounded-2xl border border-zinc-800/80 hover:bg-zinc-900/50 transition-colors flex flex-col h-full relative group">
                    <h3 className="font-semibold text-zinc-300 mb-6 text-sm flex items-center gap-2">
                       <span className="bg-zinc-800 text-zinc-400 w-6 h-6 rounded flex items-center justify-center text-xs">1</span> Analog Entry
                    </h3>
                    <div className="flex-1 flex flex-col justify-center gap-4">
                       <input 
                          type="text" 
                          placeholder="Enter Network ID (PAT_...)" 
                          value={manualPatientId} 
                          onChange={e => setManualPatientId(e.target.value)} 
                          className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center font-mono text-zinc-200 outline-none focus:border-zinc-600 transition text-sm placeholder-zinc-600 mb-4"
                       />
                       <button 
                          onClick={() => handleRequestAccess(manualPatientId)} 
                          disabled={!manualPatientId.trim()}
                          className="w-full bg-zinc-100 hover:bg-white text-black font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                       >
                          Initialize Authorization
                       </button>
                    </div>
                </div>

                {/* BIOMETRIC SCAN */}
                <div className="bg-zinc-950/40 p-8 rounded-2xl border border-zinc-800/80 hover:bg-zinc-900/50 transition-colors flex flex-col h-full relative group">
                    <h3 className="font-semibold text-zinc-300 mb-6 text-sm flex items-center gap-2">
                       <span className="bg-zinc-800 text-zinc-400 w-6 h-6 rounded flex items-center justify-center text-xs">2</span> Identity Biometrics
                    </h3>
                    
                    <div className="flex-1 flex flex-col justify-center">
                       {!cameraActive ? (
                          <button onClick={startCamera} className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300 font-medium py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Activate Optics Matrix
                          </button>
                       ) : (
                          <div className="flex flex-col items-center relative overflow-hidden rounded-xl border border-zinc-700 bg-black">
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover origin-center max-h-[250px]" />
                            <div className="absolute bottom-0 left-0 w-full bg-zinc-950/80 backdrop-blur-md p-2 text-center border-t border-zinc-800">
                               <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest animate-pulse">Computing Facial Vectors...</p>
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
          <div className="glass-panel p-10 border border-zinc-800/80 bg-zinc-950/40 text-center max-w-2xl mx-auto relative overflow-hidden animate-in zoom-in-95 duration-500 mt-12 rounded-2xl">
              <h2 className="text-2xl font-semibold text-zinc-100 mb-4 tracking-tight">Authorization Transmitted</h2>
              <p className="text-lg font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 inline-block px-5 py-2 rounded-lg font-semibold mb-8">{scannedPatientId}</p>
              
              <div className="border border-zinc-800/50 p-8 rounded-2xl bg-zinc-900/30 flex flex-col items-center justify-center relative z-10 transition-colors">
                  <div className="w-10 h-10 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin mb-6" />
                  <h3 className="font-semibold text-zinc-200 mb-3 text-sm">Awaiting Cryptographic Handshake...</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
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
                           <li key={idx} className="bg-zinc-950/40 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-900/60 transition-colors border border-zinc-800/80 rounded-xl">
                              <div>
                                 <div className="flex items-center gap-3">
                                   <p className="font-medium text-zinc-200 text-sm">{record.document_type || 'Clinical Document'}</p>
                                   {record.data_origin === 'emr' ? (
                                      <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/50 flex items-center gap-1">
                                         Hospital Verified (EMR)
                                      </span>
                                   ) : (
                                      <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${record.verified ? 'bg-zinc-800 text-zinc-300 border border-zinc-700/50' : 'bg-zinc-900/50 text-zinc-500 border border-zinc-800/50'} flex items-center gap-1`}>
                                         AI Extracted (PHR)
                                      </span>
                                   )}
                                 </div>
                                 <div className="flex flex-wrap gap-4 mt-2 text-xs font-mono text-zinc-500">
                                     <span>TS: <span className="text-zinc-400">{new Date(record.uploaded_at).toLocaleString()}</span></span>
                                     <span>ID: <span className="text-zinc-400">{record.record_id}</span></span>
                                     {record.doctor && <span className="text-zinc-400 font-sans flex items-center gap-1">Dr. {record.doctor.replace('Dr. ', '')}</span>}
                                 </div>
                              </div>
                              <button onClick={() => setViewRecord(record)} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors w-full sm:w-auto mt-3 sm:mt-0">
                                 Decrypt View
                              </button>
                           </li>
                        ))}
                    </ul>
                 </div>

                 <div className="border border-zinc-800/80 rounded-2xl p-8 bg-zinc-950/30 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                     <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                        <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                     </div>
                     <h3 className="font-semibold text-zinc-200 mb-3 text-sm">ABDM & FHIR Compliance</h3>
                     <p className="text-xs text-zinc-500 leading-relaxed font-medium">All parameters rendered in this sandbox remain securely stored on decentralized ledgers. Analog data is strictly <strong className="text-zinc-400">not cached</strong> by the hospital endpoint, enforcing stateless ABDM locality.</p>
                 </div>
              </div>
          </div>
      )}

      {/* SECURE DECRYPTION MODAL */}
      {viewRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={() => setViewRecord(null)}>
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/80">
               <div>
                 <h3 className="font-semibold text-zinc-100 text-base flex items-center gap-2">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" /></svg>
                    Secure Decryption: {viewRecord.document_type || 'Document'}
                 </h3>
                 <p className="text-zinc-600 text-xs font-mono mt-1 uppercase tracking-widest">{viewRecord.record_id}</p>
              </div>
              <div className="flex gap-3 items-center">
                 {viewRecord.data_origin === 'emr' && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-[10px] font-semibold tracking-widest uppercase">
                       EMR Source Node
                    </div>
                 )}
                 <button onClick={() => setViewRecord(null)} className="text-zinc-400 hover:text-white font-medium text-xs px-3 transition-colors">Close</button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-[75vh]">
               {/* Image/Document Preview Side */}
               <div className="md:w-1/2 p-4 bg-zinc-950 flex items-center justify-center overflow-auto border-r border-zinc-800 relative group">
                  <div className="text-zinc-800/50 absolute inset-0 flex items-center justify-center font-mono select-none text-xl rotate-45">ENCRYPTED ORIGIN</div>
                  {viewRecord.data_origin === 'emr' ? (
                     <div className="relative z-10 text-center space-y-4">
                        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-zinc-400 shadow-sm">
                           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h4 className="text-zinc-200 font-semibold text-sm">Hospital EMR Record</h4>
                        <p className="text-zinc-500 text-xs max-w-xs mx-auto leading-relaxed">This record was generated securely within an authorized hospital Electronic Medical Record system. No analog source document exists to process.</p>
                     </div>
                  ) : (() => {
                    const url = viewRecord.file_url || '';
                    const lowerUrl = url.toLowerCase();
                    if (lowerUrl.includes('.docx') || lowerUrl.includes('.doc')) {
                       return <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`} className="w-full h-full rounded border border-zinc-800 relative z-10 bg-white" />;
                    } else if (lowerUrl.includes('.pdf')) {
                       return <img src={url.replace(/\.pdf$/i, '.jpg')} alt="Medical Document Vector" className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-zinc-800 relative z-10" />;
                    } else {
                       return <img src={url} alt="Medical Record" className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-zinc-800 relative z-10" />;
                    }
                  })()}
               </div>

               {/* Data Side */}
               <div className="md:w-1/2 p-6 bg-zinc-950/50 overflow-y-auto">
                  <h4 className="font-semibold text-zinc-400 uppercase tracking-widest text-[10px] mb-6 border-b border-zinc-800/80 pb-2">Structured Ledger Data</h4>
                  
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

                  <div className="mt-8 pt-4 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono space-y-1.5 uppercase tracking-widest">
                     <p>Created: <span className="text-zinc-300">{new Date(viewRecord.uploaded_at).toLocaleString()}</span></p>
                     <p>Confidence: <span className="text-zinc-300">{viewRecord.confidence_score}%</span></p>
                     <p>Origin: <span className="text-zinc-300">{viewRecord.source}</span></p>
                     <p>Verified: <span className={viewRecord.verified ? 'text-zinc-300' : 'text-zinc-500'}>{viewRecord.verified ? 'TRUE' : 'FALSE'}</span></p>
                     {viewRecord.doctor && <p className="mt-2 text-zinc-400 font-sans normal-case tracking-normal">Attending: Dr. {viewRecord.doctor.replace('Dr. ', '')}</p>}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
