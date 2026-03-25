'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FIELD_INPUT = 'w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-all';
const FIELD_STYLE = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' };

export default function HospitalLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Post-login info display
  const [loginData, setLoginData] = useState<{
    name: string; status: string; api_key: string | null; hospital_id: string; logo_url: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/hospital/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_email: email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Store auth identity in localStorage (persistent)
      localStorage.setItem('hospital_token',    data.token);
      localStorage.setItem('hospital_id',       data.hospital_id);
      localStorage.setItem('hospital_name',     data.name);
      localStorage.setItem('hospital_logo_url', data.logo_url || '');
      if (data.api_key) {
        localStorage.setItem('hospital_api_key', data.api_key);
      }

      if (data.status === 'verified' && data.api_key) {
        // Push branding + key into sessionStorage for the EMR portal
        sessionStorage.setItem('portal_api_key',     data.api_key);
        sessionStorage.setItem('portal_hospital_name', data.name);
        sessionStorage.setItem('portal_logo_url',    data.logo_url || '');
        sessionStorage.setItem('portal_city',        data.city || '');
        router.push('/hospital/portal');
      } else {
        setLoginData(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── PENDING / REJECTED STATE ─────────────────────────────────────────────
  if (loginData && loginData.status !== 'verified') {
    const isPending  = loginData.status === 'pending';
    const isRejected = loginData.status === 'rejected';

    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg,#060610,#0c0c1a)' }}>
        <div className="w-full max-w-md text-center space-y-5">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl`}
            style={{ background: isPending ? 'rgba(245,158,11,0.2)' : 'rgba(244,63,94,0.2)',
                     border: isPending ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(244,63,94,0.3)' }}>
            {isPending ? '⏳' : '❌'}
          </div>
          <div className="rounded-2xl p-7"
            style={{
              background: isPending ? 'rgba(245,158,11,0.06)' : 'rgba(244,63,94,0.06)',
              border: isPending ? '1px solid rgba(245,158,11,0.18)' : '1px solid rgba(244,63,94,0.18)',
            }}>
            <h2 className="text-xl font-black text-white mb-2">
              {loginData.name}
            </h2>
            <p className={`text-sm font-bold mb-4 ${isPending ? 'text-amber-400' : 'text-rose-400'}`}>
              {isPending ? '⏳ Verification Pending'  : '❌ Application Rejected'}
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed mb-5">
              {isPending
                ? 'Your hospital application is under review by the AyushAlert verification team. You will receive API key access once approved.'
                : 'Your hospital application was not approved. Please contact the AyushAlert support team for more information.'
              }
            </p>
            <p className="text-[10px] font-mono text-zinc-700">
              Hospital ID: <span className="text-zinc-500">{loginData.hospital_id}</span>
            </p>
          </div>
          <button onClick={() => setLoginData(null)}
            className="text-xs text-zinc-600 hover:text-zinc-400 underline underline-offset-2">
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  // ── LOGIN FORM ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#060610,#0c0c1a)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
            🏥
          </div>
          <h1 className="text-2xl font-black text-white">Hospital Admin Login</h1>
          <p className="text-sm text-zinc-600 mt-1">Access your hospital's EMR sync portal</p>
        </div>

        {/* Form card */}
        <form onSubmit={handleLogin} className="rounded-2xl p-7 space-y-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>

          {error && (
            <div className="rounded-xl px-4 py-3 text-xs font-semibold text-rose-400"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Admin Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@yourhospital.com" className={FIELD_INPUT} style={FIELD_STYLE}
              onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')} />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className={FIELD_INPUT} style={FIELD_STYLE}
              onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}>
            {loading ? <><span className="animate-spin">⟳</span> Authenticating...</> : '🔓 Login to Portal'}
          </button>
        </form>

        {/* Info note */}
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
          <span className="text-emerald-400 text-xs shrink-0 mt-0.5">🔒</span>
          <p className="text-[10px] text-emerald-300/40 leading-relaxed">
            Verified hospitals are automatically redirected to the EMR Sync portal with their API session pre-loaded.
          </p>
        </div>

        <p className="text-center text-sm text-zinc-600">
          Not registered?{' '}
          <Link href="/hospital/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Register your hospital →
          </Link>
        </p>
      </div>
    </div>
  );
}
