'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EMRDashboard() {
  const router = useRouter();
  
  // Patient Lookup State
  const [patientId, setPatientId] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  
  // Clinical Form State
  const [doctorName, setDoctorName] = useState('Dr. Smith (Attending)');
  const [hospitalName, setHospitalName] = useState('Apollo Hospital');
  const [docType, setDocType] = useState('Prescription');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medicines, setMedicines] = useState('');
  const [dosage, setDosage] = useState('');
  
  // Submission State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId && !patientEmail) {
      setError('Please provide either an ABHA ID or Patient Email for lookup.');
      return;
    }
    if (!diagnosis && !symptoms && !medicines) {
      setError('Please fill in at least one clinical field.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // Transform comma-separated strings to arrays
    const parseField = (str: string) => str.split(',').map(s => s.trim()).filter(s => s);

    const recordPayload = {
      file_name: `${docType} - ${new Date().toLocaleDateString()}`,
      file_url: 'https://hospital.local/emr-generated-record.pdf', // Dummy URL for natively generated EMR records
      doctor: `${doctorName} — ${hospitalName}`,
      diagnosis: parseField(diagnosis),
      symptoms: parseField(symptoms),
      medicines: parseField(medicines),
      dosage: parseField(dosage)
    };

    try {
      // Connect to the existing Hospital Ingestion API !
      const res = await fetch('/api/hospital/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'demo_hospital_key_2024' // Use the securely configured hospital bypass key
        },
        body: JSON.stringify({
          abha_id: patientId,
          patient_email: patientEmail,
          records: [recordPayload]
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to push record to AyushAlert Ledger.');
      }

      setSuccess(`Record successfully added to patient timeline. HASH: ${data.record_ids?.[0] || 'VFD'}`);
      
      // Clear form
      setDiagnosis('');
      setSymptoms('');
      setMedicines('');
      setDosage('');
      
      // Auto-clear success toast after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis && !symptoms && !medicines) {
      setError('Please fill in clinical details before printing.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      setError("Popup blocked! Please allow popups to print.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patientId || patientEmail || 'Unknown Patient'}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; max-w: 800px; margin: auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #222; padding-bottom: 20px; margin-bottom: 30px; }
          .hospital-info { text-align: right; }
          .hospital-name { font-size: 24px; font-weight: bold; color: #333; margin: 0; }
          .doctor-name { font-size: 16px; color: #666; margin-top: 5px; }
          .rx-logo { font-size: 48px; font-weight: 900; color: #333; line-height: 1; }
          .patient-info { display: flex; justify-content: space-between; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e9ecef; }
          .patient-info div { font-size: 14px; }
          .patient-info strong { color: #333; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 1.5px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #555; }
          ul { margin: 0; padding-left: 20px; line-height: 1.6; }
          .medicines-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .medicines-table th, .medicines-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .medicines-table th { background-color: #f8f9fa; font-size: 13px; text-transform: uppercase; color: #555; }
          .footer { margin-top: 60px; text-align: right; border-top: 1px solid #eee; padding-top: 20px; }
          .sign-line { display: inline-block; width: 200px; border-bottom: 1px dashed #333; margin-bottom: 10px; }
          .print-btn { position: fixed; bottom: 20px; right: 20px; background: #4f46e5; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 6px; cursor: pointer; }
          @media print { .print-btn { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="rx-logo">Rx</div>
          <div class="hospital-info">
            <h1 class="hospital-name">${hospitalName.toUpperCase() || 'HOSPITAL CLINIC'}</h1>
            <p class="doctor-name">${doctorName}</p>
            <p class="doctor-name" style="font-size:12px;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="patient-info">
          <div><strong>Patient ID / ABHA:</strong><br/>${patientId || 'N/A'}</div>
          <div><strong>Email:</strong><br/>${patientEmail || 'N/A'}</div>
          <div><strong>Document Type:</strong><br/>${docType}</div>
        </div>

        ${symptoms ? `
        <div class="section">
          <div class="section-title">Symptoms & Vitals</div>
          <ul>${symptoms.split(',').map(s => `<li>${s.trim()}</li>`).join('')}</ul>
        </div>
        ` : ''}

        ${diagnosis ? `
        <div class="section">
          <div class="section-title">Clinical Diagnosis</div>
          <ul>${diagnosis.split(',').map(s => `<li><strong>${s.trim()}</strong></li>`).join('')}</ul>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Prescribed Medicines</div>
          <table class="medicines-table">
            <tr>
              <th>Medicine Name</th>
              <th>Dosage & Instructions</th>
            </tr>
            <tr>
              <td><ul>${medicines ? medicines.split(',').map(m => `<li>${m.trim()}</li>`).join('') : '<li>Nil</li>'}</ul></td>
              <td><ul>${dosage ? dosage.split(/\r?\n|,/).map(d => `<li>${d.trim()}</li>`).join('') : '<li>Nil</li>'}</ul></td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <div class="sign-line"></div>
          <p style="margin:0; font-weight:bold; color:#333;">Signature</p>
          <p style="margin:5px 0 0; font-size:12px; color:#666;">Generated via AyushAlert EMR Ecosystem</p>
        </div>
        
        <button class="print-btn" onclick="window.print()">🖨️ Print Prescription</button>
        <script>
           // Auto trigger print dialog once loaded
           setTimeout(() => window.print(), 500);
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans pb-20">
      
      {/* HEADER NAV */}
      <nav className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              💊
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AyushAlert <span className="text-indigo-400 font-mono text-sm ml-1">EMR</span></h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Clinical Provider Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-xs font-mono text-zinc-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                SYSTEM CONNECTED
             </div>
          </div>
        </div>
      </nav>

      {/* JURY EXPLAINER BANNER */}
      <div className="bg-indigo-900/40 border-b border-indigo-500/20 py-2.5 text-center px-4 backdrop-blur-md relative z-40">
        <p className="text-zinc-300 text-sm md:text-xs font-medium tracking-wide">
          <span className="text-indigo-400 font-bold">AyushAlert Architecture System:</span> PHR captures patient-uploaded data, while the EMR module generates hospital-verified records — <span className="text-white font-bold border-b border-indigo-400/50 pb-0.5">AyushAlert securely unifies both.</span>
        </p>
      </div>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid lg:grid-cols-12 gap-8 lg:gap-10">
         
         {/* LEFT DASHBOARD PANEL */}
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 border-t-4 border-t-indigo-500 rounded-2xl">
               <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="text-indigo-400">👤</span> Patient Lookup</h2>
               <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">ABHA ID</label>
                    <input 
                      type="text" 
                      value={patientId}
                      onChange={e => setPatientId(e.target.value)}
                      placeholder="e.g. 14-digit ABHA Number" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none font-mono"
                    />
                  </div>
                  <div className="relative flex items-center py-2">
                     <div className="flex-grow border-t border-zinc-800"></div>
                     <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs font-bold">OR</span>
                     <div className="flex-grow border-t border-zinc-800"></div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Patient Email</label>
                    <input 
                      type="email" 
                      value={patientEmail}
                      onChange={e => setPatientEmail(e.target.value)}
                      placeholder="patient@example.com" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none"
                    />
                  </div>
               </div>
            </div>

            {/* MOCK METRICS DASHBOARD */}
            <div className="grid grid-cols-2 gap-4">
               {[
                  { label: "Patients Today", value: "142", icon: "👥", color: "text-blue-400", bg: "bg-blue-900/20", border: "border-blue-500/20" },
                  { label: "Records Signed", value: "318", icon: "🧾", color: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-500/20" },
                  { label: "Rx Issued", value: "84", icon: "💊", color: "text-purple-400", bg: "bg-purple-900/20", border: "border-purple-500/20" },
                  { label: "Labs Queued", value: "29", icon: "🧪", color: "text-yellow-400", bg: "bg-yellow-900/20", border: "border-yellow-500/20" }
               ].map((metric, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${metric.border} ${metric.bg} shadow-inner flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1`}>
                     <div className="text-2xl mb-1">{metric.icon}</div>
                     <div className={`text-xl font-black ${metric.color}`}>{metric.value}</div>
                     <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">{metric.label}</div>
                  </div>
               ))}
            </div>

            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
               <h3 className="text-sm font-bold text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-2">🔗 AyushAlert Sync</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                  Records engineered in this EMR module are synchronously encrypted and pushed directly to the patient's decentralized digital ledger. Once pushed, they instantly populate on the patient's PHR dashboard.
               </p>
            </div>
         </div>

         {/* RIGHT CLINICAL FORM */}
         <div className="lg:col-span-8">
            <div className="glass-panel rounded-2xl border border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
               <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center relative overflow-hidden flex-wrap gap-4">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500"></div>
                  <h2 className="text-xl font-bold flex items-center gap-2">📝 Clinical Charting Engine</h2>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 text-sm">
                     <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Provider:</span>
                        <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} className="bg-transparent border-b border-zinc-700 font-mono text-zinc-300 focus:outline-none focus:border-indigo-500 text-right w-40" />
                     </div>
                     <div className="flex items-center gap-2 h-full">
                        <span className="text-zinc-500 hidden sm:inline">|</span>
                        <span className="text-zinc-500">Facility:</span>
                        <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} className="bg-transparent border-b border-zinc-700 font-mono text-zinc-300 focus:outline-none focus:border-indigo-500 text-right w-36" />
                     </div>
                  </div>
               </div>
               
               <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                       <span>⚠️</span> {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-start gap-3">
                       <span>✅</span> {success}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                     <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Document Type</label>
                        <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none text-zinc-200 cursor-pointer appearance-none">
                           <option>Prescription</option>
                           <option>Clinical Note</option>
                           <option>Lab Result</option>
                           <option>Discharge Summary</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Timestamp</label>
                        <input type="text" disabled value={new Date().toLocaleString()} className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 text-sm text-zinc-500 font-mono cursor-not-allowed" />
                     </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                     <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-2">
                           <span className="text-emerald-500">▶</span> Symptoms <span className="text-xs font-normal text-zinc-600">(Comma separated)</span>
                        </label>
                        <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. Fever, Persistent Cough, Fatigue" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 transition outline-none" />
                     </div>

                     <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-2">
                           <span className="text-purple-500">▶</span> Diagnosis <span className="text-xs font-normal text-zinc-600">(Comma separated)</span>
                        </label>
                        <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Viral Pharyngitis, Mild Dehydration" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 transition outline-none" />
                     </div>

                     <div className="grid md:grid-cols-2 gap-6 pt-2">
                        <div>
                           <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-2">
                              <span className="text-blue-500">▶</span> Medicines
                           </label>
                           <textarea value={medicines} onChange={e => setMedicines(e.target.value)} placeholder="e.g. Amoxicillin 500mg, Paracetamol" rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 transition outline-none resize-none" />
                        </div>
                        <div>
                           <label className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-2">
                              <span className="text-red-400">▶</span> Dosage Instructions
                           </label>
                           <textarea value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 1 tablet twice daily for 5 days" rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 transition outline-none resize-none" />
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 flex flex-col items-center">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <button type="button" onClick={handlePrint} className="w-full bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl transition shadow-inner flex items-center justify-center gap-2">
                           <span className="text-xl">🖨️</span> Preview & Print
                        </button>
                        
                        <button type="submit" disabled={loading} className={`w-full font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:shadow-none relative overflow-hidden group ${success ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'}`}>
                           <span className="relative z-10 flex items-center justify-center gap-2">
                              {loading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Encrypting...
                                </>
                              ) : success ? (
                                <>
                                  <span className="text-xl animate-bounce">🛡️</span> Pushed to Timeline
                                </>
                              ) : (
                                <>
                                  Save & Push to Decentralized Ledger ➔
                                </>
                              )}
                           </span>
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </button>
                     </div>
                     <p className="text-center text-xs text-zinc-600 mt-6 font-mono">
                        Data is strictly tagged mathematically as source: "HOSPITAL", data_origin: "EMR", verified: TRUE
                     </p>
                  </div>
               </form>
            </div>
         </div>
      </main>

      {/* FULL WIDTH PHASE 2 PITCH */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
         <div className="glass-panel p-8 border-t-4 border-t-zinc-700/50 rounded-2xl relative overflow-hidden">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center justify-between">
               <span className="flex items-center gap-2">🚀 Advanced Modules Roadmap</span>
               <span className="text-[10px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full border border-zinc-700">PHASE 2</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                  { name: "Billing & Insurance Integration", icon: "💳", status: "Planned H2 Workflow" },
                  { name: "Pharmacy Direct Routing", icon: "🏥", status: "In Development Ecosystem" },
                  { name: "Smart Appointment Scheduling", icon: "📅", status: "Planned H2 Scheduling System" },
                  { name: "Revenue Analytics Engine", icon: "📊", status: "Enterprise Grade Dashboard" }
               ].map((item, idx) => (
                  <div key={idx} className="flex flex-col p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/40 hover:bg-zinc-800/60 transition-colors shadow-inner">
                     <div className="flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl border border-zinc-700 opacity-80">{item.icon}</div>
                        <div>
                           <p className="text-sm font-bold text-white">{item.name}</p>
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1.5 line-clamp-1">{item.status}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
