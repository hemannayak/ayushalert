'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { 
  Building2, Users, FileText, Database, Activity, Lock, ArrowRight, 
  Search, ShieldCheck, Clock, Settings, Network, Stethoscope, ChevronRight,
  TrendingUp, AlertTriangle, Zap, PackageSearch, RefreshCcw, Radar,
  LayoutDashboard, ClipboardList, Files, HardDriveDownload, Power, Terminal, History
} from 'lucide-react';

// ── SESSION HELPERS ──────────────────────────────────────────────────────────
function getInitialApiKey() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('portal_api_key') || '';
}
function getInitialAuthStep(): 'enter' | 'authenticated' {
  if (typeof window === 'undefined') return 'enter';
  return sessionStorage.getItem('portal_api_key') ? 'authenticated' : 'enter';
}

const DEPARTMENTS = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Oncology", "Internal Medicine"
];

const STAFF_MOCK = [
  { id: 'STF-102', name: 'Dr. Sarah Chen', dept: 'Cardiology', role: 'Head of Dept', status: 'Active' },
  { id: 'STF-105', name: 'Dr. James Wilson', dept: 'Oncology', role: 'Senior Consultant', status: 'Active' },
  { id: 'STF-110', name: 'Dr. Ananya Sharma', dept: 'Pediatrics', role: 'Attending', status: 'Inactive' },
  { id: 'STF-142', name: 'Dr. Michael Chang', dept: 'Orthopedics', role: 'Surgeon', status: 'Active' },
];

const PATIENT_MOCK = [
  { abha: '12-3456-7890', name: 'Rahul Verma', lastEncounter: '12 Oct 2024', consent: 'Approved', statusColor: 'emerald' },
  { abha: '98-7654-3210', name: 'Anjali Desai', lastEncounter: '05 Nov 2024', consent: 'Pending Request', statusColor: 'amber' },
  { abha: '45-6789-0123', name: 'Priya Kumar', lastEncounter: '22 Jan 2025', consent: 'Revoked', statusColor: 'rose' },
  { abha: '11-2233-4455', name: 'Vikram Singh', lastEncounter: '18 Feb 2025', consent: 'Approved', statusColor: 'emerald' },
];

const INTEGRATIONS_MOCK = [
  { id: 'sys-lis', name: 'Laboratory Information System (LIS)', type: 'Bi-directional Sync', status: 'Active', uptime: '99.9%' },
  { id: 'sys-pms', name: 'Pharmacy Management System', type: 'Outbound Sync', status: 'Active', uptime: '100%' },
  { id: 'sys-legacy', name: 'Legacy On-Premise EMR', type: 'Data Migration', status: 'Syncing (45%)', uptime: 'Warning' },
  { id: 'sys-rad', name: 'Radiology / PACS', type: 'Inbound Sync', status: 'Disconnected', uptime: 'N/A' },
];

export default function HospitalAdminPortal() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState(getInitialApiKey);
  const [authStep, setAuthStep] = useState<'enter' | 'authenticated'>(getInitialAuthStep);
  const [authLoading, setAuthLoad] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [success, setSuccess] = useState('');
  
  // Real-time Data States
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [syncing, setSyncing]   = useState(false);

  // Functional States
  const [staffList, setStaffList] = useState(STAFF_MOCK);
  const [patientList, setPatientList] = useState(PATIENT_MOCK);
  const [integrationsList, setIntegrationsList] = useState(INTEGRATIONS_MOCK);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'staff' | 'inventory' | 'patient' | 'integration' | 'tunnel' | 'logs' | null>(null);
  const [modalForm, setModalForm] = useState<any>({});
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (authStep === 'authenticated') {
      fetchLiveStats();
      const interval = setInterval(fetchLiveStats, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [authStep]);

  const fetchLiveStats = async () => {
    try {
      setSyncing(true);
      const key = sessionStorage.getItem('portal_api_key') || 'demo_key';
      const res = await fetch('/api/hospital/live-stats', {
        headers: { 'x-api-key': key }
      });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      setLiveData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (modalType === 'staff') {
        const newStaff = {
          id: `STF-${Math.floor(100 + Math.random() * 900)}`,
          name: modalForm.name,
          dept: modalForm.dept,
          role: modalForm.role,
          status: 'Active'
        };
        setStaffList(prev => [newStaff, ...prev]);
        setShowModal(false);
      } else if (modalType === 'inventory') {
        const key = sessionStorage.getItem('portal_api_key') || 'demo_key';
        const payload = {
          ...modalForm,
          intake_stock: parseInt(modalForm.intake_stock) || 0,
          min_threshold: parseInt(modalForm.min_threshold) || 100,
          total_amount: parseFloat(modalForm.total_amount) || 0
        };
        const res = await fetch('/api/hospital/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': key },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Provision failed');
        await fetchLiveStats();
        setShowModal(false);
      } else if (modalType === 'patient') {
        const newPatient = {
          abha: modalForm.abha,
          name: modalForm.name || 'External Patient',
          lastEncounter: 'New Link',
          consent: 'Pending Request',
          statusColor: 'amber'
        };
        setPatientList(prev => [newPatient, ...prev]);
        setShowModal(false);
      } else if (modalType === 'integration' || modalType === 'tunnel') {
        const newIntegration = {
          id: `sys-${modalForm.name?.toLowerCase().replace(/ /g, '-') || 'custom'}`,
          name: modalForm.name || 'External Tunnel',
          type: modalForm.type || 'Direct Sync',
          status: 'Authenticated',
          uptime: '100%'
        };
        setIntegrationsList(prev => [newIntegration, ...prev]);
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  if (authStep === 'enter') {
    return (
      <div className="dark min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 lg:p-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.3] pointer-events-none select-none z-0">
          <div className="absolute top-1/2 -left-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-1/2 -right-1/4 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[160px]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md space-y-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-[32px] bg-zinc-900/50 flex items-center justify-center border border-indigo-500/10 shadow-2xl">
               <BrandLogo variant="icon" size={56} />
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                <Building2 size={12} strokeWidth={3} />
                Organization & System Layer
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white uppercase leading-none">
                Hospital <br /> <span className="text-zinc-600">Module.</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">
                Interface for institutions to participate in the ecosystem
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/5 blur-2xl group-focus-within:bg-indigo-500/10 transition-colors" />
              <div className="relative space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Institutional Access Key</label>
                <div className="relative">
                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                   <input 
                      type="password" 
                      placeholder="IAT_••••••••••••••••" 
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { sessionStorage.setItem('portal_api_key', apiKey || 'demo_key'); sessionStorage.setItem('hospital_name', 'Apollo Hospital'); setAuthStep('authenticated'); } }}
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-14 pr-5 py-5 text-white font-mono text-lg placeholder-zinc-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition" 
                   />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                sessionStorage.setItem('portal_api_key', apiKey || 'demo_key');
                sessionStorage.setItem('hospital_name', 'Apollo Hospital');
                setAuthStep('authenticated');
              }}
              disabled={authLoading}
              className="w-full bg-white hover:bg-zinc-100 text-zinc-950 h-16 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              {authLoading ? 'Authenticating...' : 'Access Control Panel'}
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-zinc-950 flex flex-col md:flex-row relative overflow-hidden">
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[40px] shadow-2xl p-10 overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
               <div className="flex flex-col gap-8">
                  <div className="flex justify-between items-start">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                           {modalType === 'staff' && 'Register New Staff'}
                           {modalType === 'inventory' && 'Institutional Asset intake'}
                           {modalType === 'patient' && 'Request ABHA Access'}
                           {modalType === 'integration' && 'Configure Data Pipeline'}
                           {modalType === 'tunnel' && 'Secure Infrastructure Tunnel'}
                           {modalType === 'logs' && 'Data Access Audit Trail'}
                        </h3>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Administrative Control Action Panel</p>
                     </div>
                     <button onClick={() => setShowModal(false)} className="p-2 text-zinc-500 hover:text-white transition">✕</button>
                  </div>

                  <form onSubmit={handleModalSubmit} className="space-y-6">
                     {modalType === 'staff' && (
                        <>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-500 px-1">Full Name</label>
                              <input required type="text" value={modalForm.name || ''} onChange={e => setModalForm({...modalForm, name: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition" placeholder="Dr. John Doe" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-zinc-500 px-1">Department</label>
                                 <select required value={modalForm.dept || ''} onChange={e => setModalForm({...modalForm, dept: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition appearance-none">
                                    <option value="" disabled>Select...</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-zinc-500 px-1">Role Type</label>
                                 <input required type="text" value={modalForm.role || ''} onChange={e => setModalForm({...modalForm, role: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition" placeholder="Consultant" />
                              </div>
                           </div>
                        </>
                     )}

                     {modalType === 'inventory' && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-zinc-500 px-1">Resource / Item Name</label>
                                 <input required type="text" value={modalForm.item_name || ''} onChange={e => setModalForm({...modalForm, item_name: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition" placeholder="N95 Masks" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-zinc-500 px-1">Invoice / Reference #</label>
                                 <input required type="text" value={modalForm.invoice_id || ''} onChange={e => setModalForm({...modalForm, invoice_id: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-mono" placeholder="INV-2024-001" />
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-zinc-500 px-1">In-Take Stock</label>
                                 <input required type="number" value={modalForm.intake_stock || ''} onChange={e => setModalForm({...modalForm, intake_stock: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-zinc-500 px-1">Unit Type</label>
                                 <input type="text" value={modalForm.unit || 'Units'} onChange={e => setModalForm({...modalForm, unit: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-zinc-500 px-1">Threshold</label>
                                 <input type="number" value={modalForm.min_threshold || '100'} onChange={e => setModalForm({...modalForm, min_threshold: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white" />
                              </div>
                           </div>
                        </div>
                     )}

                     {modalType === 'logs' && (
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                           {[
                              { time: '10:45 AM', action: 'Biometric Auth Success', user: 'Dr. Jane Smith', detail: 'Authorized EMR Write Access' },
                              { time: '09:20 AM', action: 'Data Tunnel Request', user: 'External LIS System', detail: 'Full Panel Blood Report Fetch' },
                              { time: 'Yesterday', action: 'Credential Rotation', user: 'System Root', detail: 'Automatic RSA Key Refresh' },
                              { time: 'Mar 28', action: 'Record Linkage', user: 'Admin Portal', detail: 'ABHA ID Synchronization' },
                           ].map((log, i) => (
                              <div key={i} className="flex gap-4 items-start border-l border-white/10 pl-6 relative">
                                 <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{log.time}</span>
                                       <span className="text-[10px] font-bold text-white uppercase">{log.action}</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 font-medium">{log.detail}</p>
                                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">{log.user}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 rounded-2xl bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition">Cancel</button>
                        <button type="submit" disabled={modalLoading} className="flex-1 px-8 py-4 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50">
                           {modalLoading ? 'Processing...' : 'Authorize Transaction'}
                        </button>
                     </div>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <aside className="w-full md:w-80 bg-zinc-950 border-r border-white/5 flex flex-col shrink-0 relative z-20 overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.4)]">
        <div className="p-8 border-b border-white/5 relative bg-zinc-950/40 backdrop-blur-md">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-5 cursor-pointer" onClick={() => setActiveTab('overview')}>
               <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <ShieldCheck size={24} className="text-white" />
               </div>
               <div className="flex flex-col">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Ayush HQ</h2>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">Admin OS v2.0</p>
               </div>
            </div>
            <Link href="/dashboard" className="px-4 py-2 mt-2 rounded-xl bg-zinc-900/50 border border-white/5 text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all flex items-center gap-2 group/exit">
               <ArrowRight size={12} className="rotate-180 group-hover/exit:-translate-x-1 transition-transform" />
               Return to Access Ecosystem
            </Link>
          </div>
        </div>

        <nav className="flex-1 p-6 flex flex-col gap-1 overflow-y-auto custom-scrollbar relative">
          <SectionHeader label="Institutional Management" />
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={20} />} label="Operational Core" />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<ClipboardList size={20} />} label="Logistics Ledger" badge="Phase 2" />
          <NavItem active={activeTab === 'departments'} onClick={() => setActiveTab('departments')} icon={<Users size={20} />} label="Staff Roster" />
          <NavItem active={activeTab === 'ingest'} onClick={() => setActiveTab('ingest')} icon={<Terminal size={20} />} label="Clinical Ingest" badge="Live Write" />
          
          <div className="my-6 h-px bg-white/5" />
          <SectionHeader label="Network & Ecosystem" />
          <NavItem active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} icon={<Files size={20} />} label="Patient Vault" badge="Consent" />
          <NavItem active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={<HardDriveDownload size={20} />} label="Data Pipelines" />
        </nav>

        <div className="p-6 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5">
           <button 
             onClick={() => { sessionStorage.removeItem('portal_api_key'); setAuthStep('enter'); }} 
             className="w-full h-12 rounded-xl bg-zinc-900 border border-white/5 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500/5 transition-all flex items-center justify-center gap-2 group"
           >
             <Power size={14} className="group-hover:scale-110 transition-transform" /> De-authorize Terminal
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-8">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div className="space-y-1">
               <h1 className="text-2xl font-black text-white tracking-tighter capitalize transition-all">{activeTab.replace('-', ' ')}</h1>
               <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Institutional Control Interface</p>
             </div>
             <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input type="text" placeholder="Search entity..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-indigo-500/30 outline-none transition-colors" />
             </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Revenue" value={`₹${((liveData?.stats?.revenue || 0) / 1000).toFixed(1)}K`} icon={<TrendingUp size={20} className="text-emerald-400" />} trend="+12% vs last week" trendUp={true} />
                    <StatCard label="Linked Patients" value={liveData?.stats?.patient_count || '0'} icon={<Users size={20} className="text-cyan-400" />} trend="Live Database Match" />
                    <StatCard label="Total Encounters" value={liveData?.stats?.encounter_count || '0'} icon={<Zap size={20} className="text-amber-400" />} trend="Real-time clinical throughput" />
                    <StatCard label="Data Packets" value={liveData?.stats?.data_packets || '0'} icon={<Database size={20} className="text-indigo-400" />} trend="Active institutional node sync" />
                 </div>
              </motion.div>
            )}

            {activeTab === 'departments' && (
              <motion.div key="dept" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                 <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-zinc-400">Manage internal physicians and grant EMR write-access.</p>
                    <button onClick={() => { setModalType('staff'); setShowModal(true); setModalForm({}); }} className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2">
                       <Users size={16} /> Register Staff
                    </button>
                 </div>
                 <div className="rounded-3xl border border-white/5 bg-zinc-900/30 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="border-b border-white/5 bg-zinc-950/50">
                           <th className="py-4 px-6 text-[10px] font-black uppercase text-zinc-500">Staff ID</th>
                           <th className="py-4 px-6 text-[10px] font-black uppercase text-zinc-500">Name</th>
                           <th className="py-4 px-6 text-[10px] font-black uppercase text-zinc-500">Role</th>
                           <th className="py-4 px-6 text-[10px] font-black uppercase text-zinc-500">System Access</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {staffList.map((s, i) => (
                           <tr key={i} className="hover:bg-zinc-900/50 transition">
                             <td className="py-4 px-6 text-xs font-mono text-zinc-500">{s.id}</td>
                             <td className="py-4 px-6 text-sm font-bold text-white">{s.name}</td>
                             <td className="py-4 px-6 text-xs text-zinc-500">{s.role}</td>
                             <td className="py-4 px-6">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                  {s.status}
                               </span>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {activeTab === 'patients' && (
              <motion.div key="patients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                 <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between gap-6">
                    <div className="space-y-1">
                       <h3 className="text-sm font-bold text-indigo-100">Patient Data Access Vault</h3>
                       <p className="text-[11px] text-indigo-400 font-medium whitespace-nowrap">Clinical updates performed by doctors inside the dedicated EMR module.</p>
                    </div>
                 </div>
                 <div className="rounded-3xl border border-white/5 bg-zinc-900/30 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="border-b border-white/5 bg-zinc-950/50">
                           <th className="py-4 px-6 text-[10px] font-black uppercase text-zinc-500">Patient ID (ABHA)</th>
                           <th className="py-4 px-6 text-[10px] font-black uppercase text-zinc-500">Name</th>
                           <th className="py-4 px-6 text-[10px] font-black uppercase text-zinc-500">Consent Access Status</th>
                           <th className="py-4 px-6 text-[10px] font-black uppercase text-zinc-500 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {patientList.map((p, i) => (
                           <tr key={i} className="hover:bg-zinc-900/50 transition">
                             <td className="py-4 px-6 text-xs font-mono text-zinc-400">{p.abha}</td>
                             <td className="py-4 px-6 text-sm font-bold text-white">{p.name}</td>
                             <td className="py-4 px-6">
                               <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-${p.statusColor}-500/10 text-${p.statusColor}-400`}>
                                  {p.consent}
                               </div>
                             </td>
                             <td className="py-4 px-6 text-right">
                               <button onClick={() => { setModalType('logs'); setShowModal(true); }} className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition">View Logs</button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div key="sync" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {integrationsList.map((sys, i) => (
                      <div key={i} className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5 space-y-6 hover:border-indigo-500/30 transition-colors group">
                         <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-white tracking-tight">{sys.name}</h3>
                            <div className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider ${sys.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{sys.status}</div>
                         </div>
                         <button onClick={() => { setModalType('tunnel'); setShowModal(true); }} className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Configure Tunnel <ChevronRight size={14} /></button>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 'ingest' && (
              <motion.div key="ingest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="p-8 lg:p-12 rounded-[40px] bg-zinc-900/30 border border-white/5 space-y-10 relative overflow-hidden">
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Clinical Record Management</h3>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Manual ingestion layer for verified lab results & diagnostic reports</p>
                   </div>
                   <form onSubmit={(e)=> { e.preventDefault(); setSuccess('Clinical Data Committed to Node'); setTimeout(()=>setSuccess(''), 3000); }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 px-1 tracking-widest">Target Patient (ABHA ID)</label>
                            <input required type="text" value={modalForm.abha || ''} onChange={e=>setModalForm({...modalForm, abha: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white font-mono text-lg focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="XX-XXXX-XXXX-XXXX" />
                         </div>
                         <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-zinc-500 px-1 tracking-widest">Record Category</label>
                               <select className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white uppercase text-[10px] font-bold tracking-widest">
                                  <option>Lab Result</option>
                                  <option>Imaging Report</option>
                                  <option>Pathology</option>
                                  <option>Primary Diagnosis</option>
                               </select>
                         </div>
                      </div>
                      <div className="space-y-6 flex flex-col">
                         <div className="space-y-2 flex-1 flex flex-col">
                            <label className="text-[10px] font-black uppercase text-zinc-500 px-1 tracking-widest">Clinical Findings & Metrics</label>
                            <textarea required className="flex-1 min-h-[200px] w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none font-mono" placeholder="PH_VALUE: 7.2 | GLUCOSE: 110 mg/dL..." />
                         </div>
                         <button type="submit" className="w-full h-20 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-500/20">Commit to Patient Node <Zap size={18} fill="currentColor" /></button>
                      </div>
                   </form>
                   {success && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl z-50">
                         {success}
                      </motion.div>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-auto py-10 border-t border-white/5 text-center flex flex-col items-center justify-center gap-3 bg-zinc-950/80">
           <h3 className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em]">Core Architecture Principle</h3>
           <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest max-w-4xl leading-relaxed">
             "We separate the actor (Hospital) from the data (EMR) to enable interoperability, portability, and intelligent analysis."
           </p>
        </footer>
      </main>
    </div>
  );
}

// ── SUBCOMPONENTS ───────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] px-4 mb-3 mt-8 first:mt-2">{label}</p>;
}

function NavItem({ active, onClick, icon, label, badge }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300'}`}>
       <div className="flex items-center gap-4">
         <div className={`${active ? 'text-white' : 'text-zinc-500 group-hover:text-indigo-400'} transition-colors`}>{icon}</div>
         <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{label}</span>
       </div>
       {badge && <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${active ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-500'}`}>{badge}</span>}
    </button>
  );
}

function StatCard({ label, value, icon, trend, trendUp }: any) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 flex flex-col gap-4 shadow-sm hover:border-indigo-500/20 transition-colors group">
       <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">{icon}</div>
       <div>
         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
         <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
         {trend && <p className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${trendUp ? 'text-emerald-400' : 'text-zinc-600'}`}>{trend}</p>}
       </div>
    </div>
  );
}
