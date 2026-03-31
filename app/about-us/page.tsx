"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Globe, Shield, Users, Database } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-zinc-950 dark:text-zinc-50 font-sans selection:bg-brand/30">
      <NavBar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl space-y-12"
        >
          <div className="space-y-6">
            <span className="text-sm font-black uppercase tracking-widest text-brand">Institutional Profile</span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
              Redefining the <br /> Health <span className="text-brand">Infrastructure Layer.</span>
            </h1>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              AyushAlert is a modular healthcare data infrastructure and intelligence platform designed for institutional scale. We orchestrate fragmented clinical data into a unified, secure, and federated ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-zinc-100 dark:border-zinc-800">
             <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brand/5 border border-brand/20 flex items-center justify-center text-brand">
                   <Globe size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Institutional Connectivity</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium font-mono text-sm">Standardized FHIR v4 models ensure that data vectors flow seamlessly between clinical nodes and regional intelligence hubs.</p>
             </div>
             
             <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brand/5 border border-brand/20 flex items-center justify-center text-brand">
                   <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Access Governance Layer</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium font-mono text-sm">A zero-knowledge consent architecture ensures that patient data is only accessible to authorized clinical terminals during the diagnostic handshake.</p>
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
