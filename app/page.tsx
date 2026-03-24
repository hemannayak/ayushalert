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
        <div className="text-center mb-16 space-y-6">

           <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white">
              Welcome to <br/>
              <span className="glow-text from-indigo-400 via-blue-400 to-emerald-400 pb-2">AyushAlert</span>
           </h1>
           <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              A decentralized, biometric ecosystem demonstrating zero-knowledge consent, live FHIR interoperability, and intelligent VLM extraction.
           </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4">
           
           {/* Patient Portal Card */}
           <div className="glass-card p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:shadow-indigo-500/10 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mb-6 shadow-inner text-indigo-400 group-hover:scale-110 transition-transform">
                 👤
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Patient</h2>
              <p className="text-zinc-400 text-sm mb-8 flex-grow leading-relaxed">
                 Register your biometric identity, upload legacy records via AI, and command tokenized access for your network.
              </p>
              <div className="flex flex-col gap-3 w-full mt-auto">
                 <Link href="/patient/register" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm text-center rounded-xl transition shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                    Register Identity
                 </Link>
                 <Link href="/patient/login" className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-sm text-center rounded-xl transition">
                    Secure Login
                 </Link>
              </div>
           </div>

           {/* Doctor Portal Card */}
           <div className="glass-card p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:shadow-emerald-500/10 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-6 shadow-inner text-emerald-400 group-hover:scale-110 transition-transform">
                 🩺
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Doctor</h2>
              <p className="text-zinc-400 text-sm mb-8 flex-grow leading-relaxed">
                 Perform live biometric scans of visiting patients to request real-time, 15-minute temporary decryption tokens.
              </p>
              <div className="flex flex-col gap-3 w-full mt-auto">
                 <Link href="/doctor/login" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm text-center rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    Clinical Portal
                 </Link>
              </div>
           </div>

           {/* Hospital Portal Card */}
           <div className="glass-card p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:shadow-purple-500/10 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-6 shadow-inner text-purple-400 group-hover:scale-110 transition-transform">
                 🏥
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Hospital</h2>
              <p className="text-zinc-400 text-sm mb-8 flex-grow leading-relaxed">
                 Authoritative EHR ingestion. Push verified lab results, JSON FHIR bundles, and diagnosis trees directly to timelines.
              </p>
              <div className="flex flex-col gap-3 w-full mt-auto">
                 <Link href="/hospital/mock-portal" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm text-center rounded-xl transition shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    EHR Simulator
                 </Link>
              </div>
           </div>

           {/* Public Health Card */}
           <div className="glass-card p-8 flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:shadow-orange-500/10 group">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl mb-6 shadow-inner text-orange-400 group-hover:scale-110 transition-transform">
                 📊
              </div>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Analytics</h2>
              <p className="text-zinc-400 text-sm mb-8 flex-grow leading-relaxed">
                 Real-time epidemic and outbreak detection dashboard using universally anonymized, PII-stripped patient geometries.
              </p>
              <div className="flex flex-col gap-3 w-full mt-auto">
                 <Link href="/dashboard" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm text-center rounded-xl transition shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    Live Surveillance
                 </Link>
              </div>
           </div>

        </div>



      </main>
    </div>
  );
}
