'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConsentRequest {
  request_id: string;
  hospital_id: string;
  status: string;
  created_at: string;
}

export default function PatientRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) { router.push('/patient/login'); return; }

    const fetchRequests = async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);
        const res = await fetch('/api/patient/consent-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          let errMsg = `Server error (${res.status})`;
          try {
            const errData = await res.json();
            errMsg = errData.error || errMsg;
          } catch {}
          // If token is invalid/expired, redirect to login
          if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('patient_id');
            router.push('/patient/login');
            return;
          }
          throw new Error(errMsg);
        }
        const data = await res.json();
        setRequests(data);
        if (!isPolling) setError(''); // clear any previous error on success
      } catch (err: any) {
        if (!isPolling) setError(err.message);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };
    
    fetchRequests(false);

    // 🕒 3-Second Short Polling for Real-Time Live Demo feel
    const pollInterval = setInterval(() => fetchRequests(true), 3000);
    
    return () => clearInterval(pollInterval);
  }, [router]);

  if (!mounted) return null;

  if (loading) return (
    <div className="flex items-center justify-center mt-24 gap-3 text-zinc-400">
      <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
      <span className="text-sm font-medium">Loading consent requests...</span>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-zinc-100">🔒 Consent Requests</h1>
        <button onClick={() => router.push('/patient/dashboard')} className="text-sm text-indigo-400 hover:text-indigo-300 transition">← Dashboard</button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-300 p-4 rounded-xl text-sm flex flex-col gap-3">
          <p className="font-semibold">{error}</p>
          <div className="flex gap-3">
            <button onClick={() => window.location.reload()} className="text-xs font-bold bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-300 px-3 py-1.5 rounded-lg transition">
              Retry
            </button>
            <button onClick={() => router.push('/patient/login')} className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition">
              Re-login
            </button>
          </div>
        </div>
      )}

      {requests.length === 0 && !error && (
        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-400">
          No consent requests found. You're all clear!
        </div>
      )}

      {requests.map(req => (
        <ConsentCard key={req.request_id} request={req} />
      ))}
    </div>
  );
}

function ConsentCard({ request }: { request: ConsentRequest }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(request.status);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patient/consent-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ request_id: request.request_id })
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setOtpSent(true);
      setMsg('OTP sent to your registered email. Valid for 10 minutes.');
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (action === 'approve' && !otp.trim()) { setMsg('Please enter the OTP first.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/patient/consent-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ request_id: request.request_id, action, otp: otp.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setStatus(data.status);
      setMsg(action === 'approve' ? '✅ Access approved successfully!' : '❌ Request rejected.');
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = status === 'approved' ? 'bg-green-100 text-green-700' : status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-gray-800">🏥 {request.hospital_id}</p>
          <p className="text-xs text-gray-500 mt-1">Requested access to your medical records</p>
          <p className="text-xs text-gray-400">Request ID: <span className="font-mono">{request.request_id}</span></p>
          <p className="text-xs text-gray-400">Received: {new Date(request.created_at).toLocaleString()}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor}`}>{status}</span>
      </div>

      {msg && <p className={`text-sm p-2 rounded ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : msg.startsWith('❌') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{msg}</p>}

      {status === 'pending' && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-xs text-indigo-800">
            <strong>Who:</strong> {request.hospital_id} &nbsp;|&nbsp; <strong>What:</strong> Your verified health records &nbsp;|&nbsp; <strong>Why:</strong> Clinical care and treatment
          </div>
          {!otpSent ? (
            <button onClick={sendOtp} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded transition disabled:opacity-50 text-sm">
              {loading ? 'Sending...' : '📧 Send OTP to My Email'}
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-center text-black font-mono text-lg tracking-widest"
              />
              <div className="flex gap-3">
                <button onClick={() => handleAction('approve')} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition disabled:opacity-50 text-sm">
                  {loading ? '...' : '✅ Approve Access'}
                </button>
                <button onClick={() => handleAction('reject')} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded transition disabled:opacity-50 text-sm">
                  {loading ? '...' : '❌ Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
