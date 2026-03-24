'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientConsents() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // OTP Flow States
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const patient_id = localStorage.getItem('patient_id');

    if (!token || !patient_id) {
      router.push('/patient/login');
      return;
    }

    try {
      // 1. Fetch consent requests
      const reqRes = await fetch('/api/patient/consent-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!reqRes.ok) throw new Error('Failed to fetch consent requests');
      const reqData = await reqRes.json();
      setRequests(reqData);

      // 2. Fetch patient's available records to select from during approval
      const recRes = await fetch(`/api/patient/records?patient_id=${patient_id}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      if (recRes.ok) {
          const recData = await recRes.json();
          setRecords(recData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (recordId: string) => {
    setSelectedRecords(prev => 
       prev.includes(recordId) ? prev.filter(id => id !== recordId) : [...prev, recordId]
    );
  };

  const initiateApproval = async (request_id: string) => {
      if (selectedRecords.length === 0) {
          alert('Please select at least one record to share before approving.');
          return;
      }
      
      setProcessingId(request_id);
      const token = localStorage.getItem('token');
      
      try {
          const res = await fetch('/api/patient/consent-otp', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ request_id }),
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          
          setActiveRequest(request_id);
          setOtpSent(true);
      } catch (err: any) {
          alert(`Error initiating OTP: ${err.message}`);
      } finally {
          setProcessingId(null);
      }
  };

  const submitOTPApproval = async () => {
      if (!otp.trim() || otp.length < 6) {
          alert("Please enter the 6-digit OTP sent to your email.");
          return;
      }

      setProcessingId(activeRequest);
      const token = localStorage.getItem('token');

      try {
        const res = await fetch('/api/patient/consent-action', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            request_id: activeRequest, 
            action: 'approve',
            approved_records: selectedRecords,
            otp: otp
          }),
        });
        const data = await res.json();
  
        if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
        
        // Reset states
        setActiveRequest(null);
        setOtpSent(false);
        setOtp('');
        setSelectedRecords([]);
        fetchData(); // Refresh list

      } catch (err: any) {
        alert(err.message);
      } finally {
        setProcessingId(null);
      }
  };

  const handleReject = async (request_id: string) => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    
    setProcessingId(request_id);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/patient/consent-action', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ request_id, action: 'reject' }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to reject request');
      
      fetchData(); // Refresh list
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-600">Loading consents...</div>;

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Hospital Access Consents</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 text-orange-600 border-b pb-2">Pending Requests</h3>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-4 rounded text-center">No pending requests.</p>
        ) : (
          <div className="space-y-6">
            {pendingRequests.map(req => (
              <div key={req.request_id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 relative">
                  
                  {/* OTP MODAL OVERLAY */}
                  {activeRequest === req.request_id && otpSent && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-6 flex flex-col justify-center items-center rounded-xl border border-gray-200 shadow-inner">
                          <h4 className="text-xl font-bold text-gray-800 mb-2">Verify Your Identity</h4>
                          <p className="text-sm text-gray-600 mb-4 text-center">We have sent a 6-digit OTP to your registered email.<br/>(For this demo, check the Next.js Terminal console!)</p>
                          <input 
                              type="text" 
                              maxLength={6}
                              placeholder="000000"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="text-center text-2xl tracking-widest font-mono border-2 border-indigo-400 rounded-lg p-3 w-48 mb-4 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                          />
                          <div className="flex space-x-3">
                              <button onClick={() => {setActiveRequest(null); setOtpSent(false)}} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
                              <button onClick={submitOTPApproval} disabled={processingId === req.request_id} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded disabled:opacity-50">
                                {processingId === req.request_id ? 'Verifying...' : 'Confirm Approval'}
                              </button>
                          </div>
                      </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <p className="text-sm text-gray-500">Request ID: <span className="font-mono">{req.request_id}</span></p>
                          <p className="text-lg font-bold text-gray-800 mt-1">Hospital: {req.hospital_id}</p>
                          <p className="text-sm text-gray-600 mt-2">Requested on: {new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Action Required</span>
                  </div>

                  <div className="mb-4 bg-gray-50 p-4 rounded border">
                      <p className="font-semibold text-gray-700 mb-2">Select records to share:</p>
                      {records.length === 0 ? (
                          <p className="text-sm text-red-500 italic">You have no uploaded records to share.</p>
                      ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                              {records.map(record => (
                                  <label key={record.record_id} className="flex items-center space-x-3 bg-white p-2 border rounded cursor-pointer hover:bg-blue-50">
                                      <input 
                                        type="checkbox" 
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={selectedRecords.includes(record.record_id)}
                                        onChange={() => handleCheckboxChange(record.record_id)}
                                      />
                                      <span className="text-sm font-medium text-gray-800">{record.file_name}</span>
                                      <span className="text-xs text-gray-400 font-mono ml-auto">{record.record_id}</span>
                                  </label>
                              ))}
                          </div>
                      )}
                  </div>

                  <div className="flex space-x-4 mt-4">
                      <button 
                        onClick={() => initiateApproval(req.request_id)} 
                        disabled={processingId === req.request_id || records.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition disabled:bg-gray-400"
                      >
                        {processingId === req.request_id ? 'Processing...' : 'Approve & Send OTP'}
                      </button>
                      <button 
                        onClick={() => handleReject(req.request_id)} 
                        disabled={processingId === req.request_id}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-6 rounded transition disabled:opacity-50"
                      >
                        Reject Request
                      </button>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-600 border-b pb-2">Past Requests</h3>
        {pastRequests.length === 0 ? (
           <p className="text-gray-500">No past requests.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pastRequests.map(req => (
              <div key={req.request_id} className={`p-4 rounded-lg border ${req.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="font-semibold text-gray-800">Hospital: {req.hospital_id}</p>
                  <p className="text-sm text-gray-600">ID: {req.request_id}</p>
                  <p className="mt-2">
                      <span className={`inline-block px-2 text-xs font-bold rounded-full uppercase ${req.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                          {req.status}
                      </span>
                  </p>
                  {req.status === 'approved' && req.approved_records && (
                      <div className="mt-3 text-xs text-gray-500 bg-white p-2 rounded border">
                          Shared {req.approved_records.length} record(s).
                      </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
