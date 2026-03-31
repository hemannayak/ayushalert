"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { GitBranch, Globe, Shield, Activity, Database, Lock, Users, Terminal } from "lucide-react";
import Link from 'next/link';

export default function OpenSourcePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-zinc-950 dark:text-zinc-50 font-sans selection:bg-brand/30">
      <NavBar />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        <aside className="lg:w-1/4 space-y-10">
           <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Documentation Hub</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                 <li><Link href="/docs" className="hover:text-brand transition-colors">Introduction</Link></li>
                 <li><Link href="/docs/architecture" className="hover:text-brand transition-colors">Architecture</Link></li>
                 <li><Link href="/docs/api" className="hover:text-brand transition-colors">API Reference</Link></li>
                 <li><Link href="/docs/open-source" className="text-brand">Open Source</Link></li>
              </ul>
           </div>
        </aside>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:w-3/4 space-y-20"
        >
           <section className="space-y-6">
              <span className="text-sm font-black uppercase tracking-widest text-brand">Institutional Commons</span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
                 Community <br /> <span className="text-brand">Governance.</span>
              </h1>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                 Selected components of the AyushAlert Handshake Protocol are provided as open-source assets to ensure public auditability and regional trust.
              </p>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <OSCard icon={Terminal} title="Handshake SDK" desc="The core authentication handshake for third-party institutional nodes." />
              <OSCard icon={Shield} title="Privacy Models" desc="Proprietary de-identification algorithms for public surveillance contribution." />
              <OSCard icon={GitBranch} title="GitHub Core" desc="Access the restricted institutional repositories and clinical models." />
              <OSCard icon={Users} title="Regional Board" desc="A governance framework for local health authorities to manage autonomous nodes." />
           </div>

           <div className="p-10 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-8">
              <h3 className="text-2xl font-bold tracking-tight">Selective Disclosure</h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">While our core vision engines remain proprietary for institutional security, the handshake protocols are open for audit to maintain absolute transparency between patient and clinician.</p>
           </div>
        </motion.div>
      </main>
    </div>
  );
}

function OSCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-6">
       <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center text-brand shadow-sm">
         <Icon size={24} />
       </div>
       <div className="space-y-2">
          <h4 className="text-xl font-bold tracking-tight">{title}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
