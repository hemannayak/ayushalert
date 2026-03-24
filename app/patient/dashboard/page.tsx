'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/patient/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/patient/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPatientData(data);
        } else {
          localStorage.removeItem('token');
          router.push('/patient/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="glass-panel p-8 md:p-10 border-l-4 border-l-indigo-500 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
          Welcome back, <span className="glow-text from-indigo-400 to-emerald-400">{patientData?.name || 'Patient'}</span>
        </h1>
        <p className="text-zinc-400 text-lg flex items-center gap-2">
          Identity Node: <span className="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-indigo-300 text-sm border border-zinc-700">{patientData?.patient_id}</span>
        </p>
        
        <div className="mt-8 bg-zinc-900/80 border border-zinc-700/50 rounded-2xl p-6 inline-block shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="font-bold text-xs uppercase tracking-widest text-zinc-500 mb-1">Government Health ID (ABHA)</p>
          <p className="text-2xl font-mono font-medium text-emerald-400 tracking-wider">
            {patientData?.abha_id || <span className="text-zinc-600">Pending Generation</span>}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Card */}
        <div className="glass-card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl mb-6 shadow-inner text-blue-400 group-hover:scale-110 transition-transform">
             ↑
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upload Records</h2>
          <p className="text-zinc-400 text-sm mb-8 flex-grow leading-relaxed">Securely ingest medical lab reports and prescriptions into your decentralized datastore.</p>
          <Link href="/patient/upload" className="w-full bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-xl font-medium transition text-center shadow">
            Initialize Upload
          </Link>
        </div>

        {/* Consents Card */}
        <div className="glass-card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl mb-6 shadow-inner text-emerald-400 group-hover:scale-110 transition-transform">
             ✓
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Consent Broker</h2>
          <p className="text-zinc-400 text-sm mb-8 flex-grow leading-relaxed">Review pending authorization requests from clinical stakeholders attempting to read your timeline.</p>
          <Link href="/patient/requests" className="w-full bg-emerald-600/90 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition text-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            Manage Access
          </Link>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform group">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl mb-6 shadow-inner text-indigo-400 group-hover:scale-110 transition-transform">
             🧬
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Identity Profile</h2>
          <p className="text-zinc-400 text-sm mb-8 flex-grow leading-relaxed">Audit your core demographics, ABHA sync status, and underlying cryptographic signature parameters.</p>
          <Link href="/patient/profile" className="w-full bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-xl font-medium transition text-center shadow">
            View Parameters
          </Link>
        </div>

        {/* Analytics Card */}
        <div className="glass-card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform group">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl mb-6 shadow-inner text-orange-400 group-hover:scale-110 transition-transform">
             📊
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Public Health</h2>
          <p className="text-zinc-400 text-sm mb-8 flex-grow leading-relaxed">Observe population-level anonymized outbreak detection derived from encrypted aggregate geometries.</p>
          <Link href="/dashboard" className="w-full bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-xl font-medium transition text-center shadow">
            Global Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
