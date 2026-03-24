'use client';
import { useState } from 'react';

export default function HospitalRequestAccess() {
  const [formData, setFormData] = useState({ hospital_id: '', patient_id: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const res = await fetch('/api/hospital/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create request');

      setSuccess({
        message: data.message,
        request_id: data.request_id
      });
      setFormData({ hospital_id: '', patient_id: '', reason: '' }); // clear form

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10 border-t-4 border-teal-600">
      <h2 className="text-2xl font-bold mb-6 text-teal-800">Request Patient Access</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      {success && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6 border border-green-200">
          <p className="font-semibold">{success.message}</p>
          <p className="mt-1">Request ID: <span className="font-mono bg-white px-1 py-0.5 rounded">{success.request_id}</span></p>
          <p className="text-sm mt-2">The patient must approve this request from their portal before you can view records.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hospital ID</label>
          <input 
            required 
            name="hospital_id" 
            placeholder="e.g. HOSP_001"
            value={formData.hospital_id}
            type="text" 
            onChange={handleChange} 
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-3 text-black" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Patient ID</label>
          <input 
            required 
            name="patient_id" 
            placeholder="e.g. PAT_..."
            value={formData.patient_id}
            type="text" 
            onChange={handleChange} 
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-3 text-black" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Reason for Request</label>
          <textarea 
            required 
            name="reason" 
            rows={3}
            placeholder="Please specify why access is required..."
            value={formData.reason}
            onChange={handleChange} 
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-3 text-black" 
          />
        </div>
        <button 
          disabled={loading} 
          type="submit" 
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 mt-4 rounded-md shadow transition disabled:bg-gray-400"
        >
          {loading ? 'Submitting Request...' : 'Send Access Request'}
        </button>
      </form>
    </div>
  );
}
