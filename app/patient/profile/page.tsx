'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PatientProfile() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ gender: '', dob: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/patient/login'); return; }

    fetch('/api/patient/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => {
        setPatient(data);
        setEditForm({
          gender: data.gender || '',
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
          pincode: data.pincode || ''
        });
      })
      .catch(() => router.push('/patient/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updatedData = await res.json();
      setPatient(updatedData);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isMissingDetails = !patient?.gender || !patient?.dob || !patient?.pincode;

  if (loading) return <div className="text-center mt-20 text-zinc-400">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Identity Profile</h1>
        <p className="text-zinc-400 mt-1">Manage your cryptographic metrics and clinical demographics.</p>
      </div>

      {isMissingDetails && !isEditing && (
        <div className="bg-orange-900/30 border border-orange-500/50 p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex gap-4 items-start">
             <div className="w-10 h-10 rounded-full bg-orange-500/20 flex flex-shrink-0 items-center justify-center text-orange-400 border border-orange-500/30">
               ⚠️
             </div>
             <div>
                <h3 className="text-orange-400 font-bold mb-1 tracking-wide">Action Required: Missing Health Demographics</h3>
                <p className="text-sm text-orange-200/80 leading-relaxed">Update your Gender, Date of Birth, and Region. These parameters are vital for accurate clinical reporting and public health outbreak tracking.</p>
             </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="relative z-10 bg-orange-600/90 hover:bg-orange-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-[0_0_15px_rgba(249,115,22,0.3)] whitespace-nowrap w-full sm:w-auto mt-2 sm:mt-0">
            Resolve Alert
          </button>
        </div>
      )}

      <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-4xl font-black text-indigo-400 shadow-inner">
              {patient?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{patient?.name}</h2>
              <p className="text-sm text-zinc-400 font-medium">{patient?.email}</p>
            </div>
          </div>
          {!isEditing && (
             <button onClick={() => setIsEditing(true)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow w-full md:w-auto text-center">
               Edit Parameters
             </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6 pt-6 border-t border-zinc-800/50 animate-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
                <div>
                   <label className="block text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Gender</label>
                   <select value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none shadow-inner">
                      <option value="" className="text-zinc-500">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Date of Birth</label>
                   <input type="date" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner" style={{ colorScheme: 'dark' }} />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Region (Pincode)</label>
                   <input type="text" placeholder="e.g. 500081" value={editForm.pincode} onChange={e => setEditForm({...editForm, pincode: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner" maxLength={6} />
                </div>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 text-base">
                   {saving ? 'Encrypting Changes...' : 'Save Parameters'}
                </button>
                <button onClick={() => { setIsEditing(false); setEditForm({ gender: patient.gender || '', dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '', pincode: patient.pincode || '' })}} disabled={saving} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition border border-zinc-700 text-base">
                   Cancel
                </button>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6 pt-6 border-t border-zinc-800/50">
            {[
              { label: 'Network Identity', value: patient?.patient_id, mono: true },
              { label: 'Government Health ID', value: patient?.abha_id || 'Not Generated', mono: true, highlight: true },
              { label: 'Mobile Device', value: patient?.mobile },
              { label: 'Gender Node', value: patient?.gender || '—' },
              { label: 'Origin Date', value: patient?.dob ? new Date(patient.dob).toLocaleDateString() : '—' },
              { label: 'Region Geocode', value: patient?.pincode || 'Not synchronized' },
              { label: 'System Ingestion', value: patient?.created_at ? new Date(patient.created_at).toLocaleDateString() : '—' },
            ].map(field => (
              <div key={field.label} className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/40">
                <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">{field.label}</span>
                <span className={`block font-medium ${field.highlight ? 'text-emerald-400' : 'text-zinc-200'} ${field.mono ? 'font-mono text-sm tracking-wide' : 'text-base'}`}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
      
      <div className="flex justify-center pt-4">
        <Link href="/patient/dashboard" className="text-sm font-medium text-zinc-500 hover:text-white transition flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-6 py-2.5 rounded-full">
          <span>←</span> Return to Core Dashboard
        </Link>
      </div>
    </div>
  );
}
