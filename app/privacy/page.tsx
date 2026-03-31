"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Shield, Lock, FileText, Globe, EyeOff, Key } from "lucide-react";

export default function PrivacyPage() {
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
          <span className="text-sm font-black uppercase tracking-widest text-brand">Institutional Governance</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
            Data <br /> <span className="text-brand">Sovereignty.</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Protecting institutional IP and patient privacy is the core of the AyushAlert Handshake Protocol. Our architecture ensures that data remains decentralized and blind to unauthorized entities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           <SecurityPillar 
             icon={EyeOff} 
             title="Zero-Knowledge" 
             desc="Data is encrypted at the source using proprietary institutional keys. We never see your clinical payload." 
           />
           <SecurityPillar 
             icon={Key} 
             title="Handshake Auth" 
             desc="Access is only granted through a temporary, patient-authorized 15-minute diagnostic window." 
           />
           <SecurityPillar 
             icon={Lock} 
             title="Edge Isolation" 
             desc="Clinical records are stored on isolated institutional nodes to prevent cross-network data leaking." 
           />
        </div>

        <div className="space-y-12">
           <h2 className="text-3xl font-bold tracking-tight">Institutional Protocol</h2>
           <div className="p-10 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-10">
              <LegalSection title="1. Regional Data Control" content="Institutions maintain absolute ownership over the data nodes deployed within their regional boundaries. AyushAlert acts only as the decentralized orchestration layer." />
              <LegalSection title="2. Handshake Verification" content="Every diagnostic request must be cryptographically verified against the patient's digital ABHA ID before the vision engine renders clinical models." />
              <LegalSection title="3. Surveillance Anonymization" content="Regional health intelligence is aggregated using a multi-layer de-identification process, ensuring privacy while maintaining epidemiological accuracy by pincode." />
           </div>
        </div>
      </main>
    </div>
  );
}

function SecurityPillar({ icon: Icon, title, desc }: any) {
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

function LegalSection({ title, content }: any) {
  return (
    <div className="space-y-4">
       <h3 className="text-lg font-bold tracking-tight">{title}</h3>
       <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{content}</p>
    </div>
  );
}
