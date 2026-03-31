"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Signal, Activity, Database, Globe, CheckCircle2 } from "lucide-react";

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-zinc-950 dark:text-zinc-50 font-sans selection:bg-brand/30">
      <NavBar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/5 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
             All Systems Operational
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
            Network <br /> <span className="text-brand">Status.</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl">
            Real-time operational status for the AyushAlert autonomous health network and institutional FHIR gateways.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <StatusCard title="Institutional Nodes" status="Operational" uptime="99.99%" icon={Database} />
           <StatusCard title="Regional Vision Engines" status="Operational" uptime="100%" icon={Activity} />
           <StatusCard title="FHIR Data Pipeline" status="Operational" uptime="99.98%" icon={Signal} />
           <StatusCard title="Global Handshake Protocol" status="Operational" uptime="100%" icon={CheckCircle2} />
           <StatusCard title="Regional Surveillance" status="Operational" uptime="100%" icon={Globe} />
        </div>

        <div className="p-10 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-8">
           <h3 className="text-xl font-bold tracking-tight">Incident History</h3>
           <div className="space-y-6 opacity-40">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0">
                   <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Sept {20 - i}</span>
                   <p className="text-sm font-medium text-zinc-500">Scheduled maintenance on Institutional Gateway v2.0-beta. Completed in 14 minutes.</p>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({ title, status, uptime, icon: Icon }: any) {
  return (
    <div className="p-8 rounded-[32px] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 space-y-4 shadow-sm">
       <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
            <Icon size={20} strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand">{status}</span>
       </div>
       <div className="space-y-1">
          <h4 className="text-lg font-bold tracking-tight">{title}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Uptime: {uptime}</p>
       </div>
    </div>
  );
}
