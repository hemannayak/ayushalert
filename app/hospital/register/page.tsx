'use client';
import { useState } from 'react';
import Link from 'next/link';

type Step = 'form' | 'success';

const FIELD_INPUT = 'w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-all';
const FIELD_STYLE = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' };
const FOCUS_STYLE = { borderColor: 'rgba(99,102,241,0.6)' };
const BLUR_STYLE  = { borderColor: 'rgba(255,255,255,0.09)' };

export default function HospitalRegisterPage() {
  const [step, setStep] = useState<Step>('form');
  const [hospitalId, setHospitalId] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  const [form, setForm] = useState({
    name:            '',
    registration_id: '',
    license_number:  '',
    address:         '',
    city:            '',
    phone:           '',
    logo_url:        '',   // base64 data URL
    admin_email:     '',
    password:        '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  // Convert uploaded file to base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select a valid image file.'); return; }
    if (file.size > 500 * 1024) { setError('Logo must be under 500 KB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setForm(f => ({ ...f, logo_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/hospital/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:            form.name,
          registration_id: form.registration_id,
          license_number:  form.license_number,
          address:         form.address,
          city:            form.city,
          phone:           form.phone,
          logo_url:        form.logo_url,
          admin_email:     form.admin_email,
          password:        form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setHospitalId(data.hospital_id);
      setSubmittedName(data.name || form.name);
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg,#060610,#0c0c1a)' }}>
        <div className="w-full max-w-md text-center space-y-6">
          {/* Hospital logo if uploaded */}
          {logoPreview ? (
            <div className="w-20 h-20 rounded-3xl mx-auto overflow-hidden border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <img src={logoPreview} alt="Hospital Logo" className="w-full h-full object-contain bg-white" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
              ✓
            </div>
          )}
          <div className="rounded-2xl p-8"
            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
            {logoPreview && (
              <p className="text-xs font-bold text-emerald-400 mb-1">{submittedName}</p>
            )}
            <h2 className="text-xl font-black text-white mb-2">Registration Submitted</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Your hospital application is under review by the AyushAlert verification team.
              You will receive your API key via email once verified.
            </p>
            <div className="rounded-xl px-4 py-3 text-left mb-4"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Your Hospital ID</p>
              <p className="text-sm font-mono font-bold text-emerald-400">{hospitalId}</p>
              <p className="text-[9px] text-zinc-700 mt-1">Save this ID — you'll need it when contacting support.</p>
            </div>
            <div className="space-y-2 text-xs text-zinc-500 mb-6">
              {[
                '📋 Application received and queued for review',
                '🖼 Hospital logo stored with your profile',
                '🔍 Verification team will validate your govt. registration ID',
                '🔑 API key issued to your admin email upon approval',
                '✅ You can then access the Hospital EMR Sync portal',
              ].map(s => <p key={s}>{s}</p>)}
            </div>
            <Link href="/hospital/login"
              className="block w-full py-3 rounded-xl text-sm font-black text-white transition-all text-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
              Go to Login →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── REGISTRATION FORM ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(135deg,#060610,#0c0c1a)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
            🏥
          </div>
          <h1 className="text-3xl font-black text-white">Hospital Registration</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Register your hospital with AyushAlert. After verification by our team, you'll receive your API key to access the EMR Sync portal.
          </p>
        </div>

        {/* Info note */}
        <div className="rounded-xl px-5 py-3 flex items-start gap-3"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}>
          <span className="text-indigo-400 shrink-0 mt-0.5 text-sm">ℹ</span>
          <p className="text-[11px] text-indigo-300/60 leading-relaxed">
            Only ABDM-registered hospitals may sync clinical records into patient health profiles.
            Provide accurate Government registration and license details for faster verification.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl px-5 py-3 text-sm font-semibold text-rose-400"
            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Hospital Identity ── */}
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hospital Identity</p>

            <div>
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Hospital Name *</label>
              <input required type="text" placeholder="e.g. Yashoda Hospitals" value={form.name}
                onChange={set('name')} className={FIELD_INPUT} style={FIELD_STYLE}
                onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                onBlur={e => Object.assign(e.target.style, BLUR_STYLE)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Govt. Registration ID *</label>
                <input required type="text" placeholder="TSMC/REG/2005/001" value={form.registration_id}
                  onChange={set('registration_id')} className={`${FIELD_INPUT} uppercase`} style={FIELD_STYLE}
                  onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                  onBlur={e => Object.assign(e.target.style, BLUR_STYLE)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">License Number</label>
                <input type="text" placeholder="LIC-XXXX-YYYY" value={form.license_number}
                  onChange={set('license_number')} className={FIELD_INPUT} style={FIELD_STYLE}
                  onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                  onBlur={e => Object.assign(e.target.style, BLUR_STYLE)} />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">
                Hospital Logo <span className="text-zinc-700 normal-case tracking-normal">(PNG/JPG · max 500 KB)</span>
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    : <span className="text-2xl opacity-30">🏥</span>}
                </div>
                <label className="flex-1 cursor-pointer">
                  <div className="rounded-xl px-4 py-3 text-xs text-zinc-500 hover:text-zinc-300 transition-all text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}>
                    {logoPreview ? '✓ Logo uploaded — click to change' : '⬆ Click to upload logo'}
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
              {logoPreview && (
                <button type="button" onClick={() => { setLogoPreview(''); setForm(f => ({ ...f, logo_url: '' })); }}
                  className="text-[9px] text-zinc-700 hover:text-rose-400 mt-1 pl-1 transition-colors">✕ Remove logo</button>
              )}
            </div>
          </div>

          {/* ── Contact & Location ── */}
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Location & Contact</p>

            <div>
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Full Address *</label>
              <input required type="text" placeholder="Street, Area, City - PIN" value={form.address}
                onChange={set('address')} className={FIELD_INPUT} style={FIELD_STYLE}
                onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                onBlur={e => Object.assign(e.target.style, BLUR_STYLE)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">City</label>
                <input type="text" placeholder="Hyderabad" value={form.city}
                  onChange={set('city')} className={FIELD_INPUT} style={FIELD_STYLE}
                  onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                  onBlur={e => Object.assign(e.target.style, BLUR_STYLE)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Phone Number</label>
                <input type="tel" placeholder="+91-40-XXXX-XXXX" value={form.phone}
                  onChange={set('phone')} className={FIELD_INPUT} style={FIELD_STYLE}
                  onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                  onBlur={e => Object.assign(e.target.style, BLUR_STYLE)} />
              </div>
            </div>
          </div>

          {/* ── Admin Account ── */}
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Admin Account Credentials</p>

            <div>
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Admin Email *</label>
              <input required type="email" placeholder="admin@yourhospital.com" value={form.admin_email}
                onChange={set('admin_email')} className={FIELD_INPUT} style={FIELD_STYLE}
                onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                onBlur={e => Object.assign(e.target.style, BLUR_STYLE)} />
              <p className="text-[9px] text-zinc-700 mt-1 pl-1">Your API key will be sent to this email after verification.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Password *</label>
                <input required type="password" placeholder="Min. 8 characters" value={form.password}
                  onChange={set('password')} className={FIELD_INPUT} style={FIELD_STYLE}
                  onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                  onBlur={e => Object.assign(e.target.style, BLUR_STYLE)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Confirm Password *</label>
                <input required type="password" placeholder="Re-enter password" value={form.confirm_password}
                  onChange={set('confirm_password')} className={FIELD_INPUT} style={FIELD_STYLE}
                  onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                  onBlur={e => Object.assign(e.target.style, BLUR_STYLE)} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 30px rgba(99,102,241,0.4)' }}>
            {loading
              ? <><span className="animate-spin">⟳</span> Submitting Application...</>
              : '📝 Submit Registration Application'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600">
          Already registered?{' '}
          <Link href="/hospital/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Login with admin credentials →
          </Link>
        </p>
      </div>
    </div>
  );
}
