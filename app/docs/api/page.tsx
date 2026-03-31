"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Code, Layers, Book, Terminal, Shield } from "lucide-react";

export default function DocSubPage({ params }: any) {
  // Simple router-like logic for sub-content
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
              <span className="text-sm font-black uppercase tracking-widest text-brand">Institutional Resource</span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
                 Protocol <br /> <span className="text-brand">Reference.</span>
              </h1>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                 The AyushAlert institutional suite provides standardized access to decentralized health data handshake protocols.
              </p>
           </section>

           <div className="p-10 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-12">
              <div className="space-y-4">
                 <h3 className="text-2xl font-bold tracking-tight">Institutional FHIR Mapping</h3>
                 <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    Our proprietary neural engine maps unstructured clinical intake into standardized FHIR models at the edge. Technical implementation details are redacted for institutional security.
                 </p>
              </div>
              <div className="flex gap-4">
                 <div className="px-6 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-brand">V2.0 Core</div>
                 <div className="px-6 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-400">Edge-Native</div>
              </div>
           </div>
        </motion.div>
      </main>
    </div>
  );
}

// Helper to make the Links work
import Link from 'next/link';
