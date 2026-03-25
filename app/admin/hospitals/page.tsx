'use client';
import { useState, useEffect } from 'react';

const ADMIN_KEY = 'admin_secret_ayushalert_2024';

type Hospital = {
  hospital_id: string; name: string; city: string; registration_id: string;
  license_number: string; admin_email: string; status: 'pending' | 'verified' | 'rejected';
  verified_at: string | null; created_at: string;
};

const STATUS_STYLE: Record<string, string> = {
  verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  pending:  'bg-amber-500/10  text-amber-400  border-amber-500/30',
  rejected: 'bg-rose-500/10   text-rose-400   border-rose-500/30',
};

export default function AdminHospitalsPage() {
  const [adminKey, setAdminKey]       = useState(ADMIN_KEY);
  const [authed, setAuthed]           = useState(false);
  const [hospitals, setHospitals]     = useState<Hospital[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [actionMsg, setActionMsg]     = useState<{ id: string; msg: string; apiKey?: string } | null>(null);
  const [actioning, setActioning]     = useState<string | null>(null);

  const fetchHospitals = async (key: string) => {
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/hospital/verify', { headers: { 'x-admin-key': key } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      setHospitals(data.hospitals || []);
      setAuthed(true);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleAction = async (hospital_id: string, action: 'verify' | 'reject') => {
    setActioning(hospital_id); setActionMsg(null);
    try {
      const res  = await fetch('/api/hospital/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ hospital_id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setActionMsg({ id: hospital_id, msg: data.message, apiKey: data.api_key });
      await fetchHospitals(adminKey);
    } catch (err: any) {
      setActionMsg({ id: hospital_id, msg: err.message });
    } finally { setActioning(null); }
  };

  const pendingCount  = hospitals.filter(h => h.status === 'pending').length;
  const verifiedCount = hospitals.filter(h => h.status === 'verified').length;

  // ── ADMIN AUTH GATE
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg,#060610,#0c0c1a)' }}>
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 0 30px rgba(220,38,38,0.4)' }}>
              🛡
            </div>
            <h1 className="text-2xl font-black text-white">AyushAlert Admin</h1>
            <p className="text-xs text-zinc-600 mt-1">Hospital Verification Panel</p>
          </div>
          {error && (
            <div className="rounded-xl px-4 py-3 text-xs text-rose-400 font-semibold"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
              ⚠ {error}
            </div>
          )}
          <div className="rounded-2xl p-7 space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Admin Secret Key</label>
              <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)}
                placeholder="admin_secret_ayushalert_2024"
                className="w-full rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-zinc-700 outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                onKeyDown={e => e.key === 'Enter' && fetchHospitals(adminKey)} />
            </div>
            <button onClick={() => fetchHospitals(adminKey)} disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 0 20px rgba(220,38,38,0.25)' }}>
              {loading ? '⟳ Connecting...' : '🛡 Enter Admin Panel'}
            </button>
          </div>
          <a href="/hospital/register"
            className="block text-center text-xs text-zinc-700 hover:text-zinc-500 transition">
            ← Hospital registration portal
          </a>
        </div>
      </div>
    );
  }

  // ── ADMIN DASHBOARD
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#0a0a0f,#0f0f1a)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Header */}
        <div className="rounded-2xl p-7 flex items-center justify-between gap-6 flex-wrap"
          style={{ background: 'linear-gradient(135deg,rgba(220,38,38,0.12),rgba(15,15,26,0.9))', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>🛡</div>
            <div>
              <h1 className="text-xl font-black text-white">Hospital Verification Panel</h1>
              <p className="text-xs text-zinc-500">AyushAlert Admin · Verify and issue API keys to registered hospitals</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Pending',  val: pendingCount,     c: '#f59e0b' },
              { label: 'Verified', val: verifiedCount,    c: '#10b981' },
              { label: 'Total',    val: hospitals.length, c: '#6366f1' },
            ].map(({ label, val, c }) => (
              <div key={label} className="text-center px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xl font-black" style={{ color: c }}>{val}</p>
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest">{label}</p>
              </div>
            ))}
            <a href="/"
              className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
              🏠 Home
            </a>
            <button
              onClick={() => { setAuthed(false); setHospitals([]); setActionMsg(null); setError(''); }}
              className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
              style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)', color: '#f87171' }}
              title="Logout from Admin Panel">
              🔓 Logout
            </button>
          </div>
        </div>

        {/* Hospital list */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-10 text-zinc-600 animate-pulse text-sm">Loading hospitals...</div>
          )}
          {!loading && hospitals.length === 0 && (
            <div className="text-center py-10 text-zinc-600 text-sm">No hospital registrations yet.</div>
          )}
          {hospitals.map(h => {
            const issued = actionMsg?.id === h.hospital_id;
            return (
              <div key={h.hospital_id} className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>

                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-base font-extrabold text-white">{h.name}</h2>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_STYLE[h.status]}`}>
                        {h.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">{h.city} — <span className="font-mono">{h.hospital_id}</span></p>
                  </div>
                  <div className="flex gap-2">
                    {h.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(h.hospital_id, 'verify')}
                          disabled={actioning === h.hospital_id}
                          className="px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1.5 disabled:opacity-50 transition-all"
                          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 12px rgba(16,185,129,0.3)' }}>
                          {actioning === h.hospital_id ? '⟳' : '✓'} Verify & Issue Key
                        </button>
                        <button onClick={() => handleAction(h.hospital_id, 'reject')}
                          disabled={actioning === h.hospital_id}
                          className="px-4 py-2 rounded-xl text-xs font-black text-rose-400 flex items-center gap-1.5 disabled:opacity-50 transition-all"
                          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}>
                          ✕ Reject
                        </button>
                      </>
                    )}
                    {h.status === 'verified' && (
                      <button onClick={() => handleAction(h.hospital_id, 'reject')}
                        disabled={actioning === h.hospital_id}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-rose-400 transition-all"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        Revoke Access
                      </button>
                    )}
                    {h.status === 'rejected' && (
                      <button onClick={() => handleAction(h.hospital_id, 'verify')}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        Re-verify
                      </button>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {[
                    { l: 'Reg. ID',  v: h.registration_id },
                    { l: 'License',  v: h.license_number || '—' },
                    { l: 'Email',    v: h.admin_email },
                    { l: 'Registered', v: new Date(h.created_at).toLocaleDateString('en-IN') },
                  ].map(({ l, v }) => (
                    <div key={l}>
                      <p className="text-[9px] text-zinc-700 uppercase tracking-widest mb-0.5">{l}</p>
                      <p className="text-xs font-mono text-zinc-300 truncate">{v}</p>
                    </div>
                  ))}
                </div>

                {/* API key reveal after verification */}
                {issued && actionMsg?.apiKey && (
                  <div className="rounded-xl p-4 mt-3"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1">
                      ✓ Verified — API Key Issued (share securely with hospital admin)
                    </p>
                    <p className="font-mono text-sm text-emerald-300 break-all">{actionMsg.apiKey}</p>
                    <p className="text-[9px] text-emerald-700 mt-1">This key is shown only once. Store it securely.</p>
                  </div>
                )}
                {issued && !actionMsg?.apiKey && (
                  <p className="text-xs text-emerald-400 mt-2">✓ {actionMsg?.msg}</p>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={() => fetchHospitals(adminKey)}
          className="text-xs text-zinc-600 hover:text-zinc-400 underline underline-offset-2 block mx-auto">
          ⟳ Refresh list
        </button>
      </div>
    </div>
  );
}
