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
    <div className="max-w-3xl mx-auto mt-12 animate-in fade-in duration-500 px-4 pb-20">
      <div className="glass-panel p-8 md:p-12 border-t-4 border-t-rose-600 relative overflow-hidden shadow-[0_0_50px_rgba(225,29,72,0.1)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mb-8 pb-6 border-b border-zinc-800/80">
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
             <span className="text-rose-500">🏥</span> Clinical EHR Push Terminal
          </h2>
          <p className="text-zinc-400 text-sm mt-3 font-mono leading-relaxed">
             <span className="text-rose-400 font-bold">SIMULATOR NODE:</span> Use this secure portal to forcefully push structured digital records directly into a target patient's decentralized ledger via ABDM/FHIR standards.
          </p>
        </div>

        <div className="relative z-10">
          {status && (
             <div className="bg-emerald-900/30 text-emerald-400 p-4 rounded-xl mb-6 text-sm font-semibold border border-emerald-500/30 flex items-center gap-3 shadow-inner">
               <span className="text-xl">✓</span> {status}
             </div>
          )}
          {error && (
             <div className="bg-rose-900/40 text-rose-200 p-4 rounded-xl mb-6 text-sm font-semibold border border-rose-500/50 shadow-inner flex items-center gap-3">
               <span className="text-xl">⚠️</span> {error}
             </div>
          )}

          <div className="space-y-8">
            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 shadow-inner">
               <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Target Identification
               </h3>
               <div className="grid md:grid-cols-2 gap-6 items-center">
                 <div>
                   <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Patient ABHA ID</label>
                   <input
                     type="text"
                     placeholder="12-3456-7890-1234"
                     value={abha_id}
                     onChange={e => setAbhaId(e.target.value)}
                     className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition shadow-inner font-mono placeholder-zinc-600"
                   />
                 </div>
                 <div className="relative flex flex-col items-center justify-center">
                    <div className="absolute inset-y-0 w-px bg-zinc-800 hidden md:block" />
                    <span className="bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-zinc-800 relative z-10 my-4 md:my-0">Logical Or</span>
                    <div className="absolute inset-x-0 h-px bg-zinc-800 md:hidden" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Patient Email</label>
                   <input
                     type="email"
                     placeholder="target@network.local"
                     value={patient_email}
                     onChange={e => setEmail(e.target.value)}
                     className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition shadow-inner font-mono placeholder-zinc-600"
                   />
                 </div>
               </div>
            </div>

            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80 shadow-inner">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-indigo-500" /> Payload Selection
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {DEMO_RECORDS.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedRecord(i)}
                    className={`cursor-pointer p-5 rounded-xl border transition-all ${selectedRecord === i ? 'border-rose-500 bg-rose-900/20 shadow-[0_0_15px_rgba(225,29,72,0.15)] transform scale-[1.02]' : 'border-zinc-700/50 bg-zinc-950 hover:border-rose-500/50 hover:bg-zinc-900'}`}
                  >
                    <p className="font-bold text-white mb-2">{r.diagnosis[0]}</p>
                    <div className="space-y-1 text-xs font-mono">
                       <p className="text-zinc-500"><span className="text-zinc-400">SYM:</span> {r.symptoms.slice(0, 2).join(', ')}...</p>
                       <p className="text-zinc-500"><span className="text-zinc-400">DOC:</span> {r.doctor}</p>
                    </div>
                    {selectedRecord === i && (
                       <div className="mt-3 inline-block bg-rose-600/90 text-[10px] text-white font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow">Active Payload</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
               <button
                 onClick={handleIngest}
                 disabled={loading}
                 className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 shadow-[0_0_20px_rgba(225,29,72,0.3)] disabled:shadow-none text-lg tracking-wide border border-rose-500/50 uppercase"
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
