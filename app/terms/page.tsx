"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { FileText, Shield, LayoutGrid, Scale, Globe, UserCheck, Lock } from "lucide-react";

export default function TermsPage() {
  return <InstitutionalLayout 
    label="Legal Framework" 
    title="Service Level Agreement" 
    subtitle="Operational guidelines for institutional nodes and healthcare deployment."
    sections={[
       { title: "1. Institutional Usage", content: "AyushAlert is provided as an autonomous health infrastructure for authorized medical institutions. Users agree to maintain HIPAA and ABHA compliance at the edge." },
       { title: "2. Data Handshake Protocol", content: "All diagnostic requests must follow the cryptographically verified handshake procedure with the patient's temporary authorization token." },
       { title: "3. Regional Surveillance Participation", content: "Institutions contributing de-identified health markers for regional surveillance agree to follow the AyushAlert de-identification protocol." }
    ]}
  />;
}

export function InstitutionalLayout({ label, title, subtitle, sections }: any) {
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
          <span className="text-sm font-black uppercase tracking-widest text-brand">{label}</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">{title}</h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{subtitle}</p>
        </motion.div>

        <div className="p-10 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-16">
           {sections.map((section: any) => (
             <div key={section.title} className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight">{section.title}</h3>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{section.content}</p>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
}
