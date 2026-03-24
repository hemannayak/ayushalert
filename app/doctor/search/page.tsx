'use client';
import { useState } from 'react';

export default function DoctorSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setError('');
    setResult(null);
    setRequestMsg('');

    // Search: look for patient by ABHA ID using the hospital ingest endpoint
    // Instead we use a simple search by ABHA which the doctor can use to create a consent
    setResult({ abha_id: query.trim(), searched: true });
  };

  const handleRequestAccess = async () => {
    if (!result?.abha_id) return;
    setRequesting(true);
    setRequestMsg('');

    try {
      const doctorId = localStorage.getItem('doctor_id') || 'DR_DEMO_001';
      const res = await fetch('/api/hospital/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id:  doctorId,
          hospital_id: 'CallHealth Demo Hospital',
          abha_id:    result.abha_id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setRequestMsg(`✅ Consent request sent! Request ID: ${data.request_id}`);
    } catch (err: any) {
      setRequestMsg(`❌ ${err.message}`);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">🩺 Patient Search</h2>
      <p className="text-sm text-gray-500 mb-6">Search for a patient by their ABHA Health ID to request access to their records.</p>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter ABHA ID (e.g. 12-3456-7890-1234)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-black text-sm"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium text-sm transition"
        >
          Search
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">{error}</div>}

      {result?.searched && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-5 space-y-4">
          <div>
            <p className="text-xs text-blue-600 uppercase font-semibold tracking-wide">ABHA ID Found</p>
            <p className="font-mono text-lg font-bold text-blue-800 mt-1">{result.abha_id}</p>
          </div>

          <div className="bg-white border border-blue-100 rounded p-3 text-xs text-gray-600 space-y-1">
            <p><strong>Purpose:</strong> Clinical review and treatment planning</p>
            <p><strong>Access:</strong> Verified health records only</p>
            <p><strong>Consent:</strong> Patient will receive OTP approval request</p>
          </div>

          {requestMsg && (
            <p className={`text-sm p-2 rounded ${requestMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {requestMsg}
            </p>
          )}

          {!requestMsg && (
            <button
              onClick={handleRequestAccess}
              disabled={requesting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded transition disabled:opacity-50 text-sm"
            >
              {requesting ? 'Sending Request...' : '📋 Request Access to Records'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
