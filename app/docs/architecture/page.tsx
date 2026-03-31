"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Layers, Globe, Shield, Activity, Database, Lock } from "lucide-react";
import Link from 'next/link';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-zinc-950 dark:text-zinc-50 font-sans selection:bg-brand/30">
      <NavBar />
      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        <aside className="lg:w-1/4 space-y-10">
           <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Documentation Hub</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                 <li><Link href="/docs" className="hover:text-brand transition-colors">Introduction</Link></li>
                 <li><Link href="/docs/architecture" className="text-brand">Architecture</Link></li>
                 <li><Link href="/docs/api" className="hover:text-brand transition-colors">API Reference</Link></li>
                 <li><Link href="/docs/open-source" className="hover:text-brand transition-colors">Open Source</Link></li>
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
              <span className="text-sm font-black uppercase tracking-widest text-brand">System Design</span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
                 Decentralized <br /> <span className="text-brand">Graph.</span>
              </h1>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                 AyushAlert utilizes a proprietary edge-first data mapping architecture to ensure institutional sovereignty and patient privacy.
              </p>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ArchPillar icon={Layers} title="Unification Layer" desc="Redacted technical logic for edge-native digitization." />
              <ArchPillar icon={Lock} title="Handshake Protocol" desc="Decentralized identity verification for clinical diagnostic viewings." />
              <ArchPillar icon={Activity} title="Surveillance Node" desc="Anonymized regional intelligence streams for leadership." />
              <ArchPillar icon={Database} title="Edge Hub" desc="Autonomous EMR storage isolated from central network leaks." />
           </div>

           <div className="p-10 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-8">
              <h3 className="text-2xl font-bold tracking-tight">Institutional Flow</h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">"Mapping the path from messy paper intake to structured institutional intelligence without compromising the underlying medical IP."</p>
           </div>
        </motion.div>
      </main>
    </div>
  );
}

function ArchPillar({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-6">
       <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center text-brand ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm">
         <Icon size={24} />
       </div>
       <div className="space-y-2">
          <h4 className="text-xl font-bold tracking-tight">{title}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
