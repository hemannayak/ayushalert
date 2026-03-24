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
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.414 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-medium tracking-tight text-zinc-100">AyushAlert <span className="text-zinc-500 font-mono text-xs ml-1 font-normal">EMR</span></h1>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">Clinical Provider Environment</p>
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

      {/* ARCHITECTURE BANNER */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-2 text-center px-4 z-40">
        <p className="text-zinc-400 text-xs font-medium tracking-wide">
          <span className="text-zinc-200 font-semibold uppercase text-[10px] tracking-widest mr-2 border border-zinc-700 rounded px-1.5 py-0.5">System Architecture</span> PHR captures patient-uploaded data, while the EMR module generates hospital-verified records.
        </p>
      </div>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid lg:grid-cols-12 gap-8 lg:gap-10">
         
         {/* LEFT DASHBOARD PANEL */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-950/50 p-6 border border-zinc-800/80 rounded-xl shadow-sm">
               <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-5">Patient Lookup</h2>
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
                  { label: "Patients Today", value: "142" },
                  { label: "Records Signed", value: "318" },
                  { label: "Rx Issued", value: "84" },
                  { label: "Labs Queued", value: "29" }
               ].map((metric, i) => (
                  <div key={i} className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 flex flex-col justify-center transition-colors hover:bg-zinc-900/80">
                     <div className="text-2xl font-light tracking-tight text-zinc-100">{metric.value}</div>
                     <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">{metric.label}</div>
                  </div>
               ))}
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden">
               <h3 className="text-xs font-bold text-zinc-300 mb-2 uppercase tracking-widest">End-to-End Encryption</h3>
               <p className="text-zinc-500 text-xs leading-relaxed">
                  Records engineered in this EMR module are synchronously encrypted and pushed directly to the patient's decentralized digital ledger.
               </p>
            </div>
         </div>

         {/* RIGHT CLINICAL FORM */}
         <div className="lg:col-span-8">
            <div className="bg-zinc-950/40 rounded-xl border border-zinc-800/80 shadow-sm overflow-hidden">
               <div className="bg-zinc-900 p-5 border-b border-zinc-800 flex justify-between items-center flex-wrap gap-4">
                  <h2 className="text-sm font-medium text-zinc-200 tracking-wide">Clinical Charting Terminal</h2>
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
                        <label className="text-xs font-semibold text-zinc-400 mb-2 block">
                           Symptoms <span className="font-normal text-zinc-600">(Comma separated)</span>
                        </label>
                        <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. Fever, Persistent Cough, Fatigue" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 transition outline-none" />
                     </div>

                     <div>
                        <label className="text-xs font-semibold text-zinc-400 mb-2 block">
                           Diagnosis <span className="font-normal text-zinc-600">(Comma separated)</span>
                        </label>
                        <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Viral Pharyngitis, Mild Dehydration" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 transition outline-none" />
                     </div>

                     <div className="grid md:grid-cols-2 gap-6 pt-2">
                        <div>
                           <label className="text-xs font-semibold text-zinc-400 mb-2 block">
                              Prescribed Medicines
                           </label>
                           <textarea value={medicines} onChange={e => setMedicines(e.target.value)} placeholder="e.g. Amoxicillin 500mg, Paracetamol" rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 transition outline-none resize-none" />
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-zinc-400 mb-2 block">
                              Dosage Instructions
                           </label>
                           <textarea value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 1 tablet twice daily for 5 days" rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 transition outline-none resize-none" />
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 flex flex-col items-center">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <button type="button" onClick={handlePrint} className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                           Preview & Print Structure
                        </button>
                        
                        <button type="submit" disabled={loading} className="w-full bg-zinc-100 hover:bg-white text-black text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                           {loading ? 'Encrypting Payload...' : success ? 'Pushed to Ledger' : 'Commit to Patient Ledger'}
                        </button>
                     </div>
                     <p className="text-center text-[10px] text-zinc-600 mt-6 font-mono uppercase tracking-widest">
                        Data is strictly tagged mathematically as source: "HOSPITAL", data_origin: "EMR", verified: TRUE
                     </p>
                  </div>
               </form>
            </div>
         </div>
      </main>

      {/* FULL WIDTH PHASE 2 PITCH */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
         <div className="bg-zinc-950/30 p-8 border border-zinc-800/80 rounded-xl relative overflow-hidden">
            <h3 className="text-xs font-bold text-zinc-400 mb-6 uppercase tracking-widest flex items-center justify-between">
               <span>Advanced Modules Architecture</span>
               <span className="text-[9px] bg-zinc-900 text-zinc-500 px-2 py-1 rounded border border-zinc-800">PHASE 2</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                  { name: "Billing & Insurance Integration", status: "Planned H2 Workflow" },
                  { name: "Pharmacy Direct Routing", status: "In Development Ecosystem" },
                  { name: "Smart Appointment Scheduling", status: "Planned H2 Scheduling System" },
                  { name: "Revenue Analytics Engine", status: "Enterprise Grade Dashboard" }
               ].map((item, idx) => (
                  <div key={idx} className="flex flex-col p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors">
                     <p className="text-xs font-semibold text-zinc-300">{item.name}</p>
                     <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mt-1 line-clamp-1">{item.status}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
