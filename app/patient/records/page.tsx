'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientRecords() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      const token = localStorage.getItem('token');
      const patient_id = localStorage.getItem('patient_id');

      if (!token || !patient_id) {
        router.push('/patient/login');
        return;
      }

      try {
        const res = await fetch(`/api/patient/records?patient_id=${patient_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            router.push('/patient/login');
          }
          throw new Error('Failed to fetch records');
        }
        
        const data = await res.json();
        setRecords(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [router]);

  const handleDelete = async (record_id: string) => {
    if (!confirm('Are you certain you want to permanently delete this medical record? This cannot be undone.')) return;
    
    setIsDeleting(record_id);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/patient/records?record_id=${record_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete record');
      
      // Remove successfully deleted record from local state
      setRecords(prev => prev.filter(r => r.record_id !== record_id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-600">Loading your medical records...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 animate-in fade-in duration-500">
      <div className="mb-8 border-b border-zinc-800/80 pb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="text-indigo-400">📚</span> Health Atlas Library
        </h2>
        <p className="text-zinc-400 mt-2">Manage your cryptographically stored medical artifacts and AI-extracted clinical vectors.</p>
      </div>
      
      {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 font-semibold shadow-inner">{error}</div>}

      {records.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-4xl mb-6 shadow-inner text-blue-400 border border-blue-500/20">
            📂
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Initialize Your Health Atlas</h3>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">Your decentralized timeline is currently empty. Ingest clinical parameters to establish your cryptographic medical history.</p>
          <button 
            onClick={() => router.push('/patient/upload')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition shadow-[0_0_20px_rgba(79,70,229,0.3)] text-lg"
          >
            Ingest Analog Data
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(
            records.reduce((acc, r) => {
              const type = r.document_type || 'Prescription';
              if (!acc[type]) acc[type] = [];
              acc[type].push(r);
              return acc;
            }, {} as Record<string, any[]>)
          ).map(([type, grpRecords]: any) => (
            <div key={type} className="animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2 border-l-4 border-indigo-500 pl-4 bg-gradient-to-r from-indigo-900/20 to-transparent py-2 rounded-r-xl">
                {type} Parameters <span className="text-sm font-mono font-normal text-indigo-400 bg-indigo-900/40 px-2 py-0.5 rounded ml-2 border border-indigo-500/30">{grpRecords.length} Nodes</span>
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grpRecords.map((record: any) => (
                  <div key={record.record_id} className="glass-card flex flex-col hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-5 border-b border-zinc-800/60 bg-zinc-900/40 flex justify-between items-start gap-4 z-10">
                      <h3 className="font-semibold text-white truncate" title={record.file_name}>
                        {record.file_name}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full whitespace-nowrap border shadow-inner tracking-widest ${record.ocr_status === 'pending' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50' : 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50'}`}>
                        {record.ocr_status === 'pending' ? 'Syncing' : 'Verified'}
                      </span>
                    </div>
                    
                    <div className="p-5 space-y-4 flex-1 z-10">
                      <div>
                        <span className="block text-xs uppercase tracking-widest text-zinc-500 mb-1">Global Address ID</span>
                        <span className="font-mono text-xs bg-zinc-950 px-2 py-1.5 rounded-md text-zinc-300 border border-zinc-800 shadow-inner block truncate text-center">{record.record_id}</span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/50">
                        <span className="text-xs uppercase tracking-widest text-zinc-500">Ingested Timeline</span>
                        <span className="text-sm text-zinc-300 font-medium">{new Date(record.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-zinc-900/50 border-t border-zinc-800/60 flex gap-3 z-10">
                      <button 
                        onClick={() => setViewRecord(record)}
                        className="flex-1 text-center bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-bold py-2.5 rounded-lg border border-indigo-500/30 transition shadow-inner"
                      >
                        👁️ Optics Review
                      </button>
                      <button 
                        onClick={() => handleDelete(record.record_id)}
                        disabled={isDeleting === record.record_id}
                        className="text-center bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold py-2.5 px-4 rounded-lg border border-red-900/50 transition disabled:opacity-50"
                        title="Obliterate Record"
                      >
                        {isDeleting === record.record_id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record View Modal - Cinematic Dark Mode */}
      {viewRecord && (
        <div className="fixed inset-0 bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setViewRecord(null)}>
          <div className="glass-panel overflow-hidden shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-zinc-700/50 transform transition-all" onClick={e => e.stopPropagation()}>
            
            <div className="p-5 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-900/50 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                 <h3 className="font-extrabold text-white text-xl truncate max-w-sm" title={viewRecord.file_name}>{viewRecord.file_name}</h3>
                 <div className="flex gap-2 items-center">
                    <p className="text-xs text-indigo-400 bg-indigo-900/30 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">ID: {viewRecord.record_id}</p>
                    <span className="text-[10px] text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-bold tracking-widest flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> CONF {viewRecord.confidence_score}%
                    </span>
                 </div>
              </div>
              <button onClick={() => setViewRecord(null)} className="text-zinc-500 hover:text-white font-bold p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition border border-zinc-700 shadow flex shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            
            <div className="overflow-hidden flex-1 grid md:grid-cols-2 relative">
               {/* LEFT: Target Document Preview */}
               <div className="p-6 flex items-center justify-center overflow-auto bg-zinc-950 border-r border-zinc-800/80 relative group h-full">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                  <img 
                     src={viewRecord.file_url.toLowerCase().endsWith('.pdf') ? viewRecord.file_url.replace(/\.pdf$/i, '.jpg') : viewRecord.file_url} 
                     alt="Record Optics" 
                     className="max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] border border-zinc-800" 
                     style={{ maxHeight: '100%' }}
                  />
               </div>

               {/* RIGHT: Extracted Clinical VLM Data */}
               <div className="p-8 bg-zinc-900/30 overflow-y-auto h-full flex flex-col">
                   <h4 className="font-bold border-b border-zinc-800/80 pb-4 mb-6 text-white flex items-center gap-3 text-lg">
                       <span className="text-indigo-400">🧠</span> Neural Engine VLM Output
                   </h4>
                   
                   {!viewRecord.structured_data ? (
                       <div className="bg-yellow-900/20 text-yellow-500 p-6 rounded-xl border border-yellow-700/50 text-sm font-medium flex items-center gap-3 shadow-inner">
                           <span className="text-2xl animate-spin">🔄</span> Awaiting neural processing blocks...
                       </div>
                   ) : (
                       <div className="space-y-6 flex-1">
                           {['medicines', 'dosage', 'symptoms', 'diagnosis'].map(field => {
                               const data = viewRecord.structured_data[field];
                               if (!data || data.length === 0 || (data.length === 1 && !data[0].trim())) return null;
                               
                               return (
                                   <div key={field} className="bg-zinc-950 p-5 rounded-xl border border-zinc-800/80 shadow-inner group transition-colors hover:border-indigo-500/30">
                                       <h5 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3 group-hover:text-indigo-400 transition-colors">{field} Vectors</h5>
                                       <ul className="space-y-2">
                                           {data.map((item: string, idx: number) => (
                                               <li key={idx} className="text-sm font-mono text-zinc-300 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-indigo-500 before:rounded-full">
                                                  {item}
                                               </li>
                                           ))}
                                       </ul>
                                   </div>
                               );
                           })}
                           
                           <div className="mt-8 pt-6 border-t border-zinc-800/80">
                               <h5 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Cryptographic Context</h5>
                               <div className="bg-zinc-950 p-4 rounded-xl font-mono text-xs leading-relaxed text-zinc-400 border border-zinc-800/80 shadow-inner">
                                   <div className="flex justify-between mb-1">
                                     <span className="text-zinc-600">ORIGIN:</span>
                                     <span className="text-emerald-400">{viewRecord.data_origin.toUpperCase()}</span>
                                   </div>
                                   <div className="flex justify-between mb-1">
                                     <span className="text-zinc-600">TIMESTAMP:</span>
                                     <span className="text-zinc-300">{new Date(viewRecord.uploaded_at).toLocaleString()}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-zinc-600">FHIR SYNC:</span>
                                     <span className={viewRecord.fhir_status === 'pending' ? 'text-yellow-500' : 'text-indigo-400'}>
                                       {viewRecord.fhir_status === 'pending' ? 'PENDING' : 'VALIDATED'}
                                     </span>
                                   </div>
                               </div>
                           </div>
                       </div>
                   )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
