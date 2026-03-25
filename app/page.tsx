import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Background Deep Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative w-full max-w-7xl z-10 flex flex-col items-center justify-center py-20 px-4">
        
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6 flex flex-col items-center">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-widest mb-2 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              AyushAlert Network Live
           </div>
           
           <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter text-white leading-[1.05]">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500 pb-2 drop-shadow-sm">
                 AyushAlert.
              </span>
           </h1>
           
           <div className="flex flex-col gap-3">
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-300 max-w-2xl mx-auto leading-tight">
                 Your Face is the Key to Your Universal Health Record.
              </h2>
              <p className="text-sm md:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium">
                 A decentralized, hospital-grade EHR network powered by live facial biometrics. From AI-extracted prescriptions to zero-knowledge cryptographic consent—uniting patients, doctors, and hospitals.
              </p>
           </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full mt-8">
           
           {/* Patient Portal Card */}
           <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-start transition-all duration-300 hover:bg-zinc-900/50 hover:border-zinc-700/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-6 group-hover:text-zinc-200 transition-colors shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                 </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">Patient</h2>
              <p className="text-zinc-500 text-xs mb-8 flex-grow leading-relaxed">
                 Register identity, upload legacy records via AI, and command tokenized access for your network.
              </p>
              <div className="flex flex-col gap-2 w-full mt-auto">
                 <Link href="/patient/register" className="w-full py-2.5 bg-zinc-100 hover:bg-white text-black font-medium text-xs text-center rounded-lg transition-colors">
                    Register Identity
                 </Link>
                 <Link href="/patient/login" className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs text-center rounded-lg transition-colors">
                    Secure Login
                 </Link>
              </div>
           </div>

           {/* Doctor Portal Card */}
           <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-start transition-all duration-300 hover:bg-zinc-900/50 hover:border-zinc-700/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-6 group-hover:text-zinc-200 transition-colors shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                 </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">Doctor</h2>
              <p className="text-zinc-500 text-xs mb-8 flex-grow leading-relaxed">
                 Perform live biometric scans of visiting patients to request real-time, 15-minute temporary decryption tokens.
              </p>
              <div className="flex flex-col w-full mt-auto">
                 <Link href="/doctor/login" className="w-full py-2.5 bg-zinc-100 hover:bg-white text-black font-medium text-xs text-center rounded-lg transition-colors">
                    Clinical Portal
                 </Link>
              </div>
           </div>

           {/* Hospital Portal Card */}
           <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-start transition-all duration-300 hover:bg-zinc-900/50 hover:border-zinc-700/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-6 group-hover:text-zinc-200 transition-colors shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                 </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">Hospital</h2>
              <p className="text-zinc-500 text-xs mb-8 flex-grow leading-relaxed">
                 Authoritative EHR ingestion. Push verified lab results, JSON FHIR bundles, and diagnosis trees directly to timelines.
              </p>
              <div className="flex flex-col w-full mt-auto">
                 <Link href="/hospital/portal" className="w-full py-2.5 bg-zinc-100 hover:bg-white text-black font-medium text-xs text-center rounded-lg transition-colors">
                    EHR Simulator
                 </Link>
              </div>
           </div>

           {/* Public Health Card */}
           <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-start transition-all duration-300 hover:bg-zinc-900/50 hover:border-zinc-700/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-6 group-hover:text-zinc-200 transition-colors shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">Analytics</h2>
              <p className="text-zinc-500 text-xs mb-8 flex-grow leading-relaxed">
                 Real-time epidemic and outbreak detection dashboard using universally anonymized, PII-stripped patient geometries.
              </p>
              <div className="flex flex-col w-full mt-auto">
                 <Link href="/dashboard" className="w-full py-2.5 bg-zinc-100 hover:bg-white text-black font-medium text-xs text-center rounded-lg transition-colors">
                    Live Surveillance
                 </Link>
              </div>
           </div>

           {/* New EMR Card */}
           <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col items-start transition-all duration-300 hover:bg-zinc-900/50 hover:border-zinc-700/80 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-6 group-hover:text-zinc-200 transition-colors shadow-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">EMR / EHR</h2>
              <p className="text-zinc-500 text-xs mb-8 flex-grow leading-relaxed">
                 Clinical Charting Interface. Doctors map prescriptions, symptoms, and diagnoses directly to the ledger.
              </p>
              <div className="flex flex-col w-full mt-auto">
                 <Link href="/emr" className="w-full py-2.5 bg-zinc-100 hover:bg-white text-black font-medium text-xs text-center rounded-lg transition-colors">
                    Provider Terminal
                 </Link>
              </div>
           </div>

        </div>



      </main>
    </div>
  );
}
