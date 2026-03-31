"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Zap, Shield, LayoutGrid, Activity } from "lucide-react";

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-zinc-950 dark:text-zinc-50 font-sans selection:bg-brand/30">
      <NavBar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-8"
        >
          <span className="text-sm font-black uppercase tracking-widest text-brand">Infrastructure Mission</span>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.85]">
            The Data <br /> Sovereignty <br /> <span className="text-brand">Protocol.</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Our mission is to orchestrate a modular healthcare infrastructure that empowers patients with absolute data sovereignty while providing institutions with federated health intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
           <MissionCard 
             icon={Shield} 
             title="Sovereign Identity" 
             desc="Patients control their health keys. The infrastructure ensures zero-access governance unless explicitly authorized via a time-sensitive handshake." 
           />
           <MissionCard 
             icon={Activity} 
             title="Federated Intelligence" 
             desc="Aggregate anonymized telemetry from distributed clinical nodes to detect outbreaks using an intelligent surveillance protocol." 
           />
           <MissionCard 
             icon={Zap} 
             title="Institutional Scalability" 
             desc="Modular EMR infrastructure that deploys without friction. Seamlessly integrates with existing hospital repositories to unify data vectors." 
           />
        </div>
      </main>
    </div>
  );
}

function MissionCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-10 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-6 text-left">
       <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-brand ring-1 ring-zinc-200 dark:ring-zinc-800">
         <Icon size={24} />
       </div>
       <h3 className="text-xl font-bold tracking-tight">{title}</h3>
       <p className="text-zinc-500 dark:text-zinc-400 font-medium">{desc}</p>
    </div>
  );
}
