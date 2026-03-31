"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Globe, Users, Shield, LayoutGrid, Scale, Activity } from "lucide-react";

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-zinc-950 dark:text-zinc-50 font-sans selection:bg-brand/30">
      <NavBar />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-8"
        >
          <span className="text-sm font-black uppercase tracking-widest text-brand">Institutional Control</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
            Modular <br /> <span className="text-brand">Governance.</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            AyushAlert operates as a decentralized health initiative governed by local institutional nodes and regional health councils.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           <GovPillar icon={Globe} title="Regional Nodes" desc="Local health departments maintain autonomous control over the data streams in their specific geography." />
           <GovPillar icon={Users} title="Consensus Model" desc="Changes to the core FHIR mapping protocol require institutional consensus to ensure continuity." />
           <GovPillar icon={Scale} title="Public Health Compliance" desc="Governance is aligned with national health mandates (ABHA) while maintaining local autonomy." />
        </div>

        <div className="p-10 rounded-[40px] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 space-y-10 shadow-sm">
           <h3 className="text-3xl font-bold tracking-tight">Institutional Board</h3>
           <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">AyushAlert is not a monolithic entity. It is a synchronized protocol governed by the clinical and administrative heads of participating institutions.</p>
        </div>
      </main>
    </div>
  );
}

function GovPillar({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-6">
       <div className="w-14 h-14 rounded-2xl bg-brand/5 border border-brand/20 flex items-center justify-center text-brand">
         <Icon size={28} strokeWidth={1} />
       </div>
       <div className="space-y-2">
          <h4 className="text-xl font-bold tracking-tight">{title}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
