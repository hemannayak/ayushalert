'use client';
import { useState } from 'react';

const HOSPITAL_API_KEY = 'demo_hospital_key_2024';

const DEMO_RECORDS = [
  {
    medicines: ['Azithromycin 500mg', 'Paracetamol 500mg', 'ORS Sachets'],
    dosage: ['Azithromycin: 1 tablet daily for 3 days', 'Paracetamol: 1 tablet TDS', 'ORS: after every loose motion'],
    symptoms: ['Diarrhea', 'Vomiting', 'Fever', 'Dehydration'],
    diagnosis: ['Acute Gastroenteritis (possibly Cholera)'],
    doctor: 'Dr. Suresh Mehta',
    date: new Date().toISOString().split('T')[0]
  },
  {
    medicines: ['Doxycycline 100mg', 'Paracetamol 650mg', 'Cetirizine 10mg'],
    dosage: ['Doxycycline: 1 tablet BD for 7 days', 'Paracetamol: SOS for fever', 'Cetirizine: 1 at night'],
    symptoms: ['High Fever', 'Rash', 'Joint pain', 'Headache'],
    diagnosis: ['Dengue Fever (NS1 Positive)'],
    doctor: 'Dr. Priya Nair',
    date: new Date().toISOString().split('T')[0]
  }
];

export default function HospitalMockPortal() {
  const [abha_id, setAbhaId] = useState('');
  const [patient_email, setEmail] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleIngest = async () => {
    if (!abha_id && !patient_email) {
      setError('Please provide ABHA ID or Patient Email.');
      return;
    }
    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const res = await fetch('/api/hospital/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': HOSPITAL_API_KEY
        },
        body: JSON.stringify({
          abha_id:      abha_id || undefined,
          patient_email: patient_email || undefined,
          records: [DEMO_RECORDS[selectedRecord]]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ingest failed');
      setStatus(`✅ ${data.message}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 animate-in fade-in duration-500 px-4 pb-20">
      <div className="bg-[#3b3b3b] rounded-xl p-8 shadow-xl text-white font-sans border border-[#444]">
        
        <div className="mb-8 border-b border-[#555] pb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
             <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
             Clinical EHR Push Terminal
          </h2>
          <p className="text-zinc-500 text-[10px] mt-2 font-mono leading-relaxed">
             <span className="text-zinc-400 font-bold">SIMULATOR NODE:</span> Use this secure portal to forcefully push structured digital records directly into a target patient's decentralized ledger via ABDM/FHIR standards.
          </p>
        </div>

        <div>
          {status && (
             <div className="bg-emerald-950/30 text-emerald-400 p-3 rounded-lg mb-6 text-sm font-semibold border border-emerald-900/50 flex flex-row items-center gap-3">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               {status}
             </div>
          )}
          {error && (
             <div className="bg-red-950/30 text-[#ff004f] p-3 rounded-lg mb-6 text-sm font-semibold border border-[#ff004f]/30 flex flex-row items-center gap-3">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               {error}
             </div>
          )}

          <div className="space-y-6">
            <div className="bg-[#303030] p-6 rounded-xl border border-[#444]">
               <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-5 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#ff004f]" /> TARGET IDENTIFICATION
               </h3>
               
               <div className="flex flex-col md:flex-row gap-4 items-stretch">
                 <div className="flex-1">
                   <label className="block text-[9px] font-bold text-zinc-400 mb-2 uppercase tracking-wider">Patient ABHA ID</label>
                   <input
                     type="text"
                     placeholder="12-3456-7890-1234"
                     value={abha_id}
                     onChange={e => setAbhaId(e.target.value)}
                     className="w-full bg-[#111111] border border-[#222] rounded-lg px-4 py-3 text-white text-xs focus:ring-1 focus:ring-[#ff004f] focus:border-[#ff004f] transition font-mono placeholder-zinc-600 outline-none"
                   />
                 </div>
                 
                 <div className="flex items-center justify-center py-2 md:py-0">
                    <span className="bg-[#222222] text-zinc-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#333]">Logical Or</span>
                 </div>
                 
                 <div className="flex-1">
                   <label className="block text-[9px] font-bold text-zinc-400 mb-2 uppercase tracking-wider">Patient Email</label>
                   <input
                     type="email"
                     placeholder="target@network.local"
                     value={patient_email}
                     onChange={e => setEmail(e.target.value)}
                     className="w-full bg-[#111111] border border-[#222] rounded-lg px-4 py-3 text-white text-xs focus:ring-1 focus:ring-[#ff004f] focus:border-[#ff004f] transition font-mono placeholder-zinc-600 outline-none"
                   />
                 </div>
               </div>
            </div>

            <div className="bg-[#303030] p-6 rounded-xl border border-[#444]">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-5 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> PAYLOAD SELECTION
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {DEMO_RECORDS.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedRecord(i)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${selectedRecord === i ? 'border-[#ff004f] bg-[#3a2028]' : 'border-[#222] bg-[#111111] hover:border-[#ff004f]/50'}`}
                  >
                    <p className="font-bold text-zinc-100 text-sm mb-2 leading-tight">{r.diagnosis[0]}</p>
                    <div className="space-y-1 text-[10px] font-mono text-zinc-500 mt-2">
                       <p><span className="text-zinc-400">SYM:</span> {r.symptoms.slice(0, 2).join(', ')}...</p>
                       <p><span className="text-zinc-400">DOC:</span> {r.doctor}</p>
                    </div>
                    {selectedRecord === i && (
                       <div className="mt-3 inline-block bg-[#ff004f] text-[9px] text-white font-bold uppercase tracking-widest px-2 py-0.5 rounded">Active Payload</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
               <button
                 onClick={handleIngest}
                 disabled={loading}
                 className="w-full bg-[#ff004f] hover:bg-[#e60047] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 shadow-[0_4px_14px_0_rgba(255,0,79,0.39)] text-sm tracking-wide border border-[#ff004f] uppercase disabled:shadow-none"
               >
                 {loading ? 'Transmitting to Blockchain...' : 'Deploy Cryptographic Record'}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
