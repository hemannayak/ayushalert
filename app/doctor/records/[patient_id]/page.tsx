'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DoctorRecordsView() {
  const params = useParams();
  const router = useRouter();
  const patient_id = params?.patient_id as string;
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewRecord, setViewRecord] = useState<any>(null);

  useEffect(() => {
    if (!patient_id) return;

    const fetchRecords = async () => {
      try {
        const res = await fetch(`/api/doctor/records?patient_id=${patient_id}`, {
          headers: { 'x-api-key': 'demo_hospital_key_2024' }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load records');
        setRecords(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [patient_id]);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading patient records...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🗂️ Patient Health Timeline</h1>
          <p className="text-sm text-gray-500">Patient ID: <span className="font-mono">{patient_id}</span></p>
        </div>
        <button onClick={() => router.push('/doctor/search')} className="text-sm text-blue-600 hover:underline">← Search Another</button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</div>}

      {records.length === 0 && !error && (
        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-400">No records found for this patient.</div>
      )}

      {records.length > 0 && (
        <div className="space-y-8">
          {Object.entries(
            records.reduce((acc, r) => {
              const type = r.document_type || 'Prescription';
              if (!acc[type]) acc[type] = [];
              acc[type].push(r);
              return acc;
            }, {} as Record<string, any[]>)
          ).map(([type, grpRecords]: any) => (
            <div key={type}>
              <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                📁 {type}s <span className="text-sm font-normal text-gray-400">({grpRecords.length})</span>
              </h3>
              <div className="space-y-4">
                {grpRecords.map((record: any) => (
                  <div key={record.record_id} className="bg-white p-6 rounded-xl shadow border-l-4 border-green-400 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">{record.file_name}</p>
                        <p className="text-xs text-gray-400 font-mono">{record.record_id}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${record.source === 'hospital' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {record.source === 'hospital' ? '🏥 Hospital' : '📋 PHR'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${record.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {record.verified ? '✅ Verified' : '⚠️ Unverified'}
                        </span>
                      </div>
                    </div>

                    {record.structured_data && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {['diagnosis', 'symptoms', 'medicines', 'dosage'].map(field => (
                          record.structured_data[field]?.length > 0 && (
                            <div key={field} className="bg-gray-50 rounded p-3">
                              <p className="text-xs font-bold uppercase text-gray-500 mb-1">{field}</p>
                              <ul className="text-sm text-gray-700 space-y-0.5">
                                {record.structured_data[field].map((item: string, i: number) => (
                                  <li key={i}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t mt-3">
                      <div className="space-x-3">
                        <span>Confidence: <strong>{record.confidence_score}%</strong></span>
                        <span>|</span>
                        <span>Date: {new Date(record.uploaded_at).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => setViewRecord(record)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-4 py-1.5 rounded transition"
                      >
                        👁️ View Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setViewRecord(null)}>
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">{viewRecord.file_name}</h3>
              <button onClick={() => setViewRecord(null)} className="text-gray-500 hover:text-red-500 font-bold px-3 py-1 bg-gray-200 rounded">Close</button>
            </div>
            <div className="p-4 overflow-auto flex-1 bg-gray-100 flex items-center justify-center">
              {viewRecord.file_url.includes('.pdf') ? (
                <iframe src={viewRecord.file_url} className="w-full h-[70vh] rounded border" />
              ) : (
                <img src={viewRecord.file_url} alt="Record" className="max-w-full max-h-[70vh] object-contain rounded shadow" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
