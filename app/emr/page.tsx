'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── A4 Report Preview Component ─────────────────────────────────────────────
function A4Preview({
  open, onClose, onPrint,
  patientId, patientEmail, doctorName, hospitalName, docType,
  symptoms, diagnosis, medicines, dosage, logoUrl,
}: {
  open: boolean; onClose: () => void; onPrint: () => void;
  patientId: string; patientEmail: string; doctorName: string; hospitalName: string; docType: string;
  symptoms: string; diagnosis: string; medicines: string; dosage: string; logoUrl: string;
}) {
  if (!open) return null;

  const parseCSV = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);
  const parseLines = (s: string) => s.split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const sym = parseCSV(symptoms);
  const diag = parseCSV(diagnosis);
  const meds = parseCSV(medicines);
  const dos  = parseLines(dosage);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Action bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 shadow-2xl">
        <button
          onClick={onClose}
          className="text-xs font-bold text-zinc-400 hover:text-white transition flex items-center gap-1.5"
        >
          ✕ Close
        </button>
        <span className="text-zinc-700">|</span>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">A4 Preview</span>
        <span className="text-zinc-700">|</span>
        <button
          onClick={onPrint}
          className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* A4 Sheet — 794px × auto, matching @page A4 dimensions */}
      <div
        id="a4-report"
        style={{
          width: '794px',
          minHeight: '1123px',
          background: '#ffffff',
          color: '#111111',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          padding: '48px 56px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
          borderRadius: '2px',
          marginTop: '56px',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%) rotate(-30deg)',
          fontSize: '72px', fontWeight: 900, color: 'rgba(0,0,0,0.03)',
          pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
          letterSpacing: '0.1em',
        }}>
          AYUSHALERT · EMR
        </div>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', marginBottom: '6px' }}>
          {/* Left: Logo or Rx mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Hospital Logo" style={{ maxHeight: '64px', maxWidth: '180px', objectFit: 'contain' }} />
            ) : (
              <div style={{
                width: '60px', height: '60px', borderRadius: '12px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff', fontFamily: 'Georgia,serif', lineHeight: 1 }}>Rx</span>
              </div>
            )}
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>{hospitalName || 'Hospital / Clinic'}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{doctorName}</div>
            </div>
          </div>
          {/* Right: doc type badge + date */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-block', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)',
              border: '1px solid #c7d2fe', borderRadius: '8px',
              padding: '6px 16px', marginBottom: '8px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#4338ca', letterSpacing: '0.5px' }}>{docType}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Date: {dateStr}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{timeStr}</div>
          </div>
        </div>
        {/* Full-width gradient separator */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1)', marginBottom: '22px', borderRadius: '99px' }} />

        {/* ── PATIENT INFORMATION ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          background: '#f8f9fb', border: '1px solid #e5e7eb',
          borderRadius: '8px', padding: '14px 18px', marginBottom: '28px', gap: '8px',
        }}>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', marginBottom: '4px' }}>Patient ABHA / ID</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', fontFamily: 'monospace' }}>{patientId || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', marginBottom: '4px' }}>Patient Email</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{patientEmail || '—'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', marginBottom: '4px' }}>Document Type</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '2px 10px', borderRadius: '99px', display: 'inline-block' }}>{docType}</div>
          </div>
        </div>

        {/* ── SYMPTOMS ────────────────────────────────────────────────────── */}
        {sym.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <SectionTitle label="Presenting Symptoms & Vitals" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {sym.map((s, i) => (
                <span key={i} style={{
                  background: '#fef9c3', border: '1px solid #fde68a',
                  color: '#92400e', borderRadius: '99px',
                  fontSize: '12px', fontWeight: 600, padding: '3px 12px',
                }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── DIAGNOSIS ───────────────────────────────────────────────────── */}
        {diag.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <SectionTitle label="Clinical Diagnosis" />
            <div style={{ marginTop: '10px' }}>
              {diag.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', marginBottom: '6px',
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  borderLeft: '4px solid #f97316', borderRadius: '4px',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#9a3412' }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MEDICINES TABLE ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: '22px' }}>
          <SectionTitle label="Prescribed Medicines & Dosage" />
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ border: '1px solid #e2e8f0', padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#475569', width: '45%' }}>
                  Medicine
                </th>
                <th style={{ border: '1px solid #e2e8f0', padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#475569' }}>
                  Dosage &amp; Instructions
                </th>
              </tr>
            </thead>
            <tbody>
              {meds.length > 0 ? meds.map((med, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ border: '1px solid #e2e8f0', padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{med}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '10px 14px', color: '#475569' }}>{dos[i] || '—'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} style={{ border: '1px solid #e2e8f0', padding: '10px 14px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>No medicines prescribed</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── NOTES / ADVICE ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '36px' }}>
          <SectionTitle label="General Advice & Follow-Up" />
          <div style={{
            marginTop: '10px', border: '1px dashed #cbd5e1',
            borderRadius: '6px', padding: '12px 16px', minHeight: '60px',
            background: '#f8fafc', color: '#64748b', fontSize: '12px',
          }}>
            Please follow the prescribed dosage strictly. Return for follow-up in 5–7 days or if symptoms worsen.
            Maintain adequate hydration and rest. Avoid self-medication.
          </div>
        </div>

        {/* ── FOOTER / SIGNATURE ──────────────────────────────────────────── */}
        <div style={{ borderTop: '1.5px solid #e5e7eb', paddingTop: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Verified &amp; Digitally Signed</div>
            <div style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>{doctorName}</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>{hospitalName}</div>
            <div style={{ marginTop: '20px', width: '160px', borderBottom: '1px dashed #374151', height: '30px' }} />
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>Signature</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Generated via</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#6366f1', letterSpacing: '-0.5px' }}>AyushAlert</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>EMR Ecosystem · ABDM Compliant</div>
            <div style={{ marginTop: '8px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '4px', padding: '4px 10px', display: 'inline-block' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#4338ca', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                SOURCE: HOSPITAL · EMR · VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ height: '1px', flex: 1, background: '#e5e7eb' }} />
      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#6b7280', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ height: '1px', flex: 1, background: '#e5e7eb' }} />
    </div>
  );
}

// ─── Main EMR Page ────────────────────────────────────────────────────────────
export default function EMRDashboard() {
  const router = useRouter();

  // Patient Lookup State
  const [patientId, setPatientId]       = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  // Clinical Form State
  const [doctorName, setDoctorName]     = useState('Dr. Smith (Attending)');
  const [hospitalName, setHospitalName] = useState('Apollo Hospital');
  const [docType, setDocType]           = useState('Prescription');
  const [diagnosis, setDiagnosis]       = useState('');
  const [symptoms, setSymptoms]         = useState('');
  const [medicines, setMedicines]       = useState('');
  const [dosage, setDosage]             = useState('');

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [logoUrl, setLogoUrl]         = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Submission State
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  const handlePreview = () => {
    if (!diagnosis && !symptoms && !medicines) {
      setError('Please fill in at least one clinical field before previewing.');
      return;
    }
    setError('');
    setShowPreview(true);
  };

  const handlePrint = () => {
    // Build a clean printable HTML page matching A4 exactly
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) { setError('Popup blocked — please allow popups to print.'); return; }

    const parseCSV = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);
    const parseLines = (s: string) => s.split(/\r?\n|,/).map(x => x.trim()).filter(Boolean);
    const sym  = parseCSV(symptoms);
    const diag = parseCSV(diagnosis);
    const meds = parseCSV(medicines);
    const dos  = parseLines(dosage);
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${docType} — ${hospitalName}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #fff; color: #111;
      width: 210mm; min-height: 297mm;
      padding: 12mm 14mm;
    }
    .watermark {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%,-50%) rotate(-30deg);
      font-size: 72px; font-weight: 900;
      color: rgba(0,0,0,0.03); letter-spacing: 0.1em;
      white-space: nowrap; pointer-events: none; z-index: 0;
    }
    .content { position: relative; z-index: 1; }
    .header { display:flex; justify-content:space-between; align-items:center; padding-bottom:16px; margin-bottom:6px; }
    .header-left { display:flex; align-items:center; gap:14px; }
    .logo-box { width:60px; height:60px; border-radius:12px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(99,102,241,0.35); }
    .logo-box span { font-size:28px; font-weight:900; color:#fff; font-family:Georgia,serif; line-height:1; }
    .logo-img { max-height:64px; max-width:180px; object-fit:contain; }
    .hospital-name { font-size:18px; font-weight:800; color:#111; letter-spacing:-0.3px; }
    .doctor-name { font-size:12px; color:#6b7280; margin-top:2px; }
    .header-right { text-align:right; }
    .doc-badge { display:inline-block; background:linear-gradient(135deg,#eef2ff,#f5f3ff); border:1px solid #c7d2fe; border-radius:8px; padding:6px 16px; margin-bottom:8px; }
    .doc-badge span { font-size:13px; font-weight:800; color:#4338ca; letter-spacing:0.5px; }
    .date-line { font-size:11px; color:#9ca3af; }
    .accent-bar { height:3px; background:linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1); margin-bottom:22px; border-radius:99px; }
    .patient-box { display: grid; grid-template-columns: 1fr 1fr 1fr; background:#f8f9fb; border:1px solid #e5e7eb; border-radius:8px; padding:12px 16px; margin-bottom:22px; gap:8px; }
    .pbox-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#9ca3af; margin-bottom:3px; }
    .pbox-value { font-size:13px; font-weight:700; color:#111; }
    .section { margin-bottom: 20px; }
    .section-title { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
    .section-title::before, .section-title::after { content:''; flex:1; height:1px; background:#e5e7eb; }
    .section-title span { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#6b7280; white-space:nowrap; }
    .symptom-chip { display:inline-block; background:#fef9c3; border:1px solid #fde68a; color:#92400e; border-radius:99px; font-size:12px; font-weight:600; padding:3px 12px; margin:0 6px 6px 0; }
    .diag-row { display:flex; align-items:center; gap:10px; padding:8px 12px; margin-bottom:6px; background:#fff7ed; border:1px solid #fed7aa; border-left:4px solid #f97316; border-radius:4px; font-size:14px; font-weight:700; color:#9a3412; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#f1f5f9; border:1px solid #e2e8f0; padding:9px 12px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#475569; font-weight:700; }
    td { border:1px solid #e2e8f0; padding:9px 12px; }
    tr:nth-child(even) td { background:#f8fafc; }
    .advice-box { border:1px dashed #cbd5e1; border-radius:6px; padding:10px 14px; min-height:50px; background:#f8fafc; color:#64748b; font-size:12px; line-height:1.6; }
    .footer { border-top:1.5px solid #e5e7eb; padding-top:20px; display:flex; justify-content:space-between; align-items:flex-end; margin-top:30px; }
    .sign-block .sig-label { font-size:10px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
    .sign-block .sig-name { font-size:12px; color:#374151; font-weight:600; }
    .sign-block .sig-hosp { font-size:11px; color:#6b7280; }
    .sign-line { width:160px; border-bottom:1px dashed #374151; height:30px; margin-top:18px; }
    .sign-caption { font-size:10px; color:#9ca3af; margin-top:3px; }
    .brand-block { text-align:right; }
    .brand-label { font-size:9px; color:#d1d5db; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:5px; }
    .brand-name { font-size:16px; font-weight:800; color:#6366f1; letter-spacing:-0.5px; }
    .brand-sub { font-size:9px; color:#9ca3af; margin-top:2px; }
    .brand-badge { margin-top:8px; background:#eef2ff; border:1px solid #c7d2fe; border-radius:4px; padding:4px 10px; display:inline-block; font-size:9px; font-weight:700; color:#4338ca; font-family:monospace; letter-spacing:0.5px; }
    .print-btn { position:fixed; bottom:20px; right:20px; background:#6366f1; color:#fff; border:none; padding:10px 22px; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; box-shadow:0 4px 20px rgba(99,102,241,0.5); }
    @media print { .print-btn { display:none; } }
  </style>
</head>
<body>
  <div class="watermark">AYUSHALERT · EMR</div>
  <div class="content">
    <div class="header">
      <div class="header-left">
        ${logoUrl
          ? `<img src="${logoUrl}" alt="Logo" class="logo-img"/>`
          : `<div class="logo-box"><span>Rx</span></div>`}
        <div>
          <div class="hospital-name">${hospitalName || 'Hospital / Clinic'}</div>
          <div class="doctor-name">${doctorName}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="doc-badge"><span>${docType}</span></div>
        <div class="date-line">Date: ${dateStr}</div>
        <div class="date-line">${timeStr}</div>
      </div>
    </div>
    <div class="accent-bar"></div>

    <div class="patient-box">
      <div>
        <div class="pbox-label">Patient ABHA / ID</div>
        <div class="pbox-value" style="font-family:monospace">${patientId || '—'}</div>
      </div>
      <div>
        <div class="pbox-label">Patient Email</div>
        <div class="pbox-value" style="font-size:12px;font-weight:600;color:#374151">${patientEmail || '—'}</div>
      </div>
      <div style="text-align:right">
        <div class="pbox-label">Document Type</div>
        <div style="font-size:12px;font-weight:700;color:#6366f1;background:#eef2ff;padding:2px 10px;border-radius:99px;display:inline-block">${docType}</div>
      </div>
    </div>

    ${sym.length > 0 ? `
    <div class="section">
      <div class="section-title"><span>Presenting Symptoms &amp; Vitals</span></div>
      <div>${sym.map(s => `<span class="symptom-chip">${s}</span>`).join('')}</div>
    </div>` : ''}

    ${diag.length > 0 ? `
    <div class="section">
      <div class="section-title"><span>Clinical Diagnosis</span></div>
      ${diag.map(d => `<div class="diag-row">${d}</div>`).join('')}
    </div>` : ''}

    <div class="section">
      <div class="section-title"><span>Prescribed Medicines &amp; Dosage</span></div>
      <table>
        <thead><tr><th style="width:45%">Medicine</th><th>Dosage &amp; Instructions</th></tr></thead>
        <tbody>
          ${meds.length > 0
            ? meds.map((m, i) => `<tr><td style="font-weight:600;color:#1e293b">${m}</td><td style="color:#475569">${dos[i] || '—'}</td></tr>`).join('')
            : `<tr><td colspan="2" style="text-align:center;color:#94a3b8;font-style:italic">No medicines prescribed</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title"><span>General Advice &amp; Follow-Up</span></div>
      <div class="advice-box">
        Please follow the prescribed dosage strictly. Return for follow-up in 5–7 days or if symptoms worsen.
        Maintain adequate hydration and rest. Avoid self-medication.
      </div>
    </div>

    <div class="footer">
      <div class="sign-block">
        <div class="sig-label">Verified &amp; Digitally Signed</div>
        <div class="sig-name">${doctorName}</div>
        <div class="sig-hosp">${hospitalName}</div>
        <div class="sign-line"></div>
        <div class="sign-caption">Signature</div>
      </div>
      <div class="brand-block">
        <div class="brand-label">Generated via</div>
        <div class="brand-name">AyushAlert</div>
        <div class="brand-sub">EMR Ecosystem · ABDM Compliant</div>
        <div class="brand-badge">SOURCE: HOSPITAL · EMR · VERIFIED</div>
      </div>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
  <script>setTimeout(() => window.print(), 600);</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId && !patientEmail) {
      setError('Please provide either an ABHA ID or Patient Email for lookup.');
      return;
    }
    if (!diagnosis && !symptoms && !medicines) {
      setError('Please fill in at least one clinical field.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const parseField = (str: string) => str.split(',').map(s => s.trim()).filter(s => s);

    const recordPayload = {
      file_name: `${docType} - ${new Date().toLocaleDateString()}`,
      file_url: 'https://hospital.local/emr-generated-record.pdf',
      doctor: `${doctorName} — ${hospitalName}`,
      diagnosis: parseField(diagnosis),
      symptoms: parseField(symptoms),
      medicines: parseField(medicines),
      dosage: parseField(dosage),
    };

    try {
      const res = await fetch('/api/hospital/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'demo_hospital_key_2024' },
        body: JSON.stringify({ abha_id: patientId, patient_email: patientEmail, records: [recordPayload] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to push record.');
      setSuccess(`Record committed to patient timeline. HASH: ${data.record_ids?.[0] || 'VFD'}`);
      setShowPreview(false);
      setDiagnosis(''); setSymptoms(''); setMedicines(''); setDosage('');
      setTimeout(() => setSuccess(''), 6000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* A4 Preview Modal */}
      <A4Preview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onPrint={handlePrint}
        patientId={patientId}
        patientEmail={patientEmail}
        doctorName={doctorName}
        hospitalName={hospitalName}
        docType={docType}
        symptoms={symptoms}
        diagnosis={diagnosis}
        medicines={medicines}
        dosage={dosage}
        logoUrl={logoUrl}
      />

      <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans pb-20">

        {/* HEADER NAV */}
        <nav className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.414 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-medium tracking-tight text-zinc-100">AyushAlert <span className="text-zinc-500 font-mono text-xs ml-1 font-normal">EMR</span></h1>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">Clinical Provider Environment</p>
              </div>
            </div>
          <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:text-white text-zinc-400 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-xs font-mono text-zinc-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM CONNECTED
              </div>
            </div>
          </div>
        </nav>

        {/* ARCHITECTURE BANNER */}
        <div className="bg-zinc-900 border-b border-zinc-800 py-2 text-center px-4">
          <p className="text-zinc-400 text-xs font-medium tracking-wide">
            <span className="text-zinc-200 font-semibold uppercase text-[10px] tracking-widest mr-2 border border-zinc-700 rounded px-1.5 py-0.5">System Architecture</span>
            PHR captures patient-uploaded data, while the EMR module generates hospital-verified records.
          </p>
        </div>

        {/* MAIN LAYOUT */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid lg:grid-cols-12 gap-8">

          {/* LEFT PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-950/50 p-6 border border-zinc-800/80 rounded-xl shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-5">Patient Lookup</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">ABHA ID</label>
                  <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)}
                    placeholder="e.g. 14-digit ABHA Number"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none font-mono" />
                </div>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-zinc-800" />
                  <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs font-bold">OR</span>
                  <div className="flex-grow border-t border-zinc-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Patient Email</label>
                  <input type="email" value={patientEmail} onChange={e => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none" />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Patients Today', value: '142' },
                { label: 'Records Signed', value: '318' },
                { label: 'Rx Issued', value: '84' },
                { label: 'Labs Queued', value: '29' },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors">
                  <div className="text-2xl font-light tracking-tight text-zinc-100">{m.value}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-5">
              <h3 className="text-xs font-bold text-zinc-300 mb-2 uppercase tracking-widest">End-to-End Encryption</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Records generated in this EMR module are encrypted and pushed directly to the patient's decentralized digital ledger.
              </p>
            </div>

            {/* LOGO UPLOAD */}
            <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-5">
              <h3 className="text-xs font-bold text-zinc-300 mb-1 uppercase tracking-widest flex items-center gap-2">
                🏥 Hospital Logo
              </h3>
              <p className="text-zinc-600 text-[10px] mb-4">Appears in A4 report header instead of the default Rx icon.</p>

              {logoUrl ? (
                <div className="relative group mb-3">
                  <img src={logoUrl} alt="Logo preview" className="max-h-16 object-contain rounded-lg border border-zinc-700 p-2 bg-white" />
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="absolute top-1 right-1 bg-rose-900/80 hover:bg-rose-800 text-rose-300 text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-zinc-700 hover:border-indigo-500/60 rounded-xl cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/60 transition group mb-3">
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📁</span>
                  <span className="text-[10px] text-zinc-500 font-medium">Click to upload PNG / JPG</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
          </div>

          {/* RIGHT CLINICAL FORM */}
          <div className="lg:col-span-8">
            <div className="bg-zinc-950/40 rounded-xl border border-zinc-800/80 shadow-sm overflow-hidden">
              <div className="bg-zinc-900 p-5 border-b border-zinc-800 flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-sm font-medium text-zinc-200 tracking-wide">Clinical Charting Terminal</h2>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Provider:</span>
                    <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)}
                      className="bg-transparent border-b border-zinc-700 font-mono text-zinc-300 focus:outline-none focus:border-indigo-500 text-right w-44" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 hidden sm:inline">|</span>
                    <span className="text-zinc-500">Facility:</span>
                    <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)}
                      className="bg-transparent border-b border-zinc-700 font-mono text-zinc-300 focus:outline-none focus:border-indigo-500 text-right w-36" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                    <span>⚠️</span> {error}
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-start gap-3">
                    <span>✅</span> {success}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Document Type</label>
                    <select value={docType} onChange={e => setDocType(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-indigo-500 transition outline-none text-zinc-200 cursor-pointer appearance-none">
                      <option>Prescription</option>
                      <option>Clinical Note</option>
                      <option>Lab Result</option>
                      <option>Discharge Summary</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Timestamp</label>
                    <input type="text" disabled value={new Date().toLocaleString()}
                      className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 text-sm text-zinc-500 font-mono cursor-not-allowed" />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">
                      Symptoms <span className="font-normal text-zinc-600">(comma separated)</span>
                    </label>
                    <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)}
                      placeholder="e.g. Fever, Persistent Cough, Fatigue"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 transition outline-none" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-2 block">
                      Diagnosis <span className="font-normal text-zinc-600">(comma separated)</span>
                    </label>
                    <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                      placeholder="e.g. Viral Pharyngitis, Mild Dehydration"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 transition outline-none" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-2 block">Prescribed Medicines</label>
                      <textarea value={medicines} onChange={e => setMedicines(e.target.value)}
                        placeholder="e.g. Amoxicillin 500mg, Paracetamol" rows={3}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 transition outline-none resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-2 block">Dosage Instructions</label>
                      <textarea value={dosage} onChange={e => setDosage(e.target.value)}
                        placeholder="e.g. 1 tablet twice daily for 5 days" rows={3}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-zinc-500 transition outline-none resize-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  {/* Preview button — full width, highlighted */}
                  <button type="button" onClick={handlePreview}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                    📄 Preview A4 Report
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={handlePrint}
                      className="w-full bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-sm font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                      🖨️ Print / PDF
                    </button>
                    <button type="submit" disabled={loading}
                      className="w-full bg-zinc-100 hover:bg-white text-black text-sm font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? 'Encrypting...' : success ? '✓ Pushed to Ledger' : 'Commit to Ledger'}
                    </button>
                  </div>

                  <p className="text-center text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                    Data tagged · source: HOSPITAL · data_origin: EMR · verified: TRUE
                  </p>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* PHASE 2 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
          <div className="bg-zinc-950/30 p-8 border border-zinc-800/80 rounded-xl">
            <h3 className="text-xs font-bold text-zinc-400 mb-6 uppercase tracking-widest flex items-center justify-between">
              <span>Advanced Modules Architecture</span>
              <span className="text-[9px] bg-zinc-900 text-zinc-500 px-2 py-1 rounded border border-zinc-800">PHASE 2</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Billing & Insurance Integration', status: 'Planned H2 Workflow' },
                { name: 'Pharmacy Direct Routing', status: 'In Development Ecosystem' },
                { name: 'Smart Appointment Scheduling', status: 'Planned H2 Scheduling' },
                { name: 'Revenue Analytics Engine', status: 'Enterprise Dashboard' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors">
                  <p className="text-xs font-semibold text-zinc-300">{item.name}</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mt-1 line-clamp-1">{item.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
