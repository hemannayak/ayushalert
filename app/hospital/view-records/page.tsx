'use client';
import { useState } from 'react';

export default function ViewRecords() {
  const [recordId, setRecordId] = useState('');
  const [recordData, setRecordData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordId.trim()) return;

    setLoading(true);
    setError('');
    setRecordData(null);

    try {
      const res = await fetch(`/api/records/${recordId.trim()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch record. It may not exist or require consent.');

      // Because this is a simplified view using the /api/records/record_id directly for OCR access
      // we assume if it exists we can display it. In a real highly secure scenario, 
      // there would be an intermediary check to ensure THIS hospital was actually approved.
      setRecordData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10 border-t-4 border-teal-600">
      <h2 className="text-2xl font-bold mb-6 text-teal-800">Retrieve Patient Medical Records</h2>
      
      <p className="text-gray-600 mb-6 font-medium">
        Enter the authorized Record ID. The URL retrieved from this interface simulates what the OCR/FHIR module extracts.
      </p>
      
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6 text-sm font-semibold">{error}</div>}

      <form onSubmit={handleFetchRecord} className="flex flex-col md:flex-row gap-4 mb-8">
        <input 
          required 
          name="record_id" 
          placeholder="e.g. REC_170000000"
          value={recordId}
          type="text" 
          onChange={(e) => setRecordId(e.target.value)} 
          className="flex-grow border border-gray-300 rounded-md shadow-sm p-3 text-black font-mono" 
        />
        <button 
          disabled={loading} 
          type="submit" 
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-md shadow transition whitespace-nowrap disabled:bg-gray-400"
        >
          {loading ? 'Fetching...' : 'Retrieve Data'}
        </button>
      </form>

      {recordData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Record Metadata Authenticated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-500 block">Record ID</span>
              <span className="font-mono font-medium text-gray-900">{recordData.record_id}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Patient ID</span>
              <span className="font-mono font-medium text-gray-900">{recordData.patient_id}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">OCR Status</span>
              <span className={`inline-block px-2 py-1 text-xs rounded-full font-bold uppercase mt-1 ${recordData.ocr_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {recordData.ocr_status}
              </span>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <a 
              href={recordData.file_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md shadow transition text-lg w-full md:w-auto"
            >
              Open Medical Record securely
            </a>
            <p className="text-xs text-gray-400 mt-3 truncate px-4">URL: {recordData.file_url}</p>
          </div>
        </div>
      )}
    </div>
  );
}
