"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Book, Code, Globe, Shield, Activity, Database, Lock } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-zinc-950 dark:text-zinc-50 font-sans selection:bg-brand/30">
      <NavBar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-1/4 space-y-10">
           <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Documentation</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-500">
                 <li><a href="#introduction" className="hover:text-brand transition-colors">Introduction</a></li>
                 <li><a href="#architecture" className="hover:text-brand transition-colors">Architecture</a></li>
                 <li><a href="#handshake" className="hover:text-brand transition-colors">Handshake Protocol</a></li>
                 <li><a href="#api" className="hover:text-brand transition-colors">API Reference</a></li>
                 <li><a href="#open-source" className="hover:text-brand transition-colors">Open Source</a></li>
              </ul>
           </div>
        </aside>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:w-3/4 space-y-20"
        >
          <div id="introduction" className="space-y-6">
            <span className="text-sm font-black uppercase tracking-widest text-brand">V2.0 Core Protocol</span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
              Institutional <br /> Documentation.
            </h1>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              The AyushAlert Protocol provides a decentralized, FHIR-native electronic health infrastructure for hospitals and clinics. 
              Our documentation guides you through the institutional deployment, clinician terminal integration, and regional surveillance mapping.
            </p>
          </div>

          <div id="architecture" className="space-y-8 pt-20 border-t border-zinc-100 dark:border-zinc-800">
             <h2 className="text-3xl font-bold tracking-tight">Decentralized Architecture</h2>
             <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                AyushAlert uses an edge-first data strategy. Patient records are digitized at the institutional node and encrypted with the patient’s public key.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <DocFeature icon={Database} title="Digitization" desc="Proprietary vision engines convert paper prescriptions into structured FHIR JSON." />
                <DocFeature icon={Lock} title="Encryption" desc="End-to-end encryption ensures that data is blind to the AyushAlert central hub." />
             </div>
          </div>

          <div id="api" className="space-y-8 pt-20 border-t border-zinc-100 dark:border-zinc-800">
             <h2 className="text-3xl font-bold tracking-tight">API Reference</h2>
             <div className="p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] overflow-hidden">
                <pre className="text-xs md:text-sm font-mono text-zinc-500 dark:text-zinc-400 leading-relaxed overflow-x-auto">
{`POST /api/records/process
{
  "institutional_id": "HOSP_500032",
  "vision_token": "AYUSH_VX90",
  "payload": "base64_encoded_prescription_image"
}

// Returns structured FHIR health model.`}
                </pre>
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function DocFeature({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-6">
       <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center text-brand ring-1 ring-zinc-200 dark:ring-zinc-800">
         <Icon size={24} />
       </div>
       <div className="space-y-2">
          <h4 className="text-lg font-bold tracking-tight">{title}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{desc}</p>
       </div>
    </div>
  );
}
