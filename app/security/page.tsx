"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, Key, Database, Activity } from "lucide-react";

export default function SecurityPage() {
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
          <span className="text-sm font-black uppercase tracking-widest text-brand">Institutional Security</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
            Red-Team <br /> <span className="text-brand">Defenses.</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Protecting institutional data sovereignty through proprietary edge-isolation and de-identification protocols.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           <SecurityFeature icon={Lock} title="Red-Team Verified" desc="Regular penetration testing and red-teaming ensure our decentralized handshake protocol is unassailable." />
           <SecurityFeature icon={EyeOff} title="Method Obfuscation" desc="Proprietary vision engines use advanced data masking to prevent technical logic extraction." />
           <SecurityFeature icon={Key} title="Decentralized Auth" desc="No single central key provides access to the network; every node is autonomously secured." />
        </div>

        <div className="p-10 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-10">
           <h3 className="text-3xl font-bold tracking-tight">Security Protocol</h3>
           <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">All AyushAlert institutional deployments utilize a zero-trust model, assuming that the edge is always isolated and secure from centralized breaches.</p>
        </div>
      </main>
    </div>
  );
}

function SecurityFeature({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-6">
       <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand ring-1 ring-zinc-200 dark:ring-zinc-800 transition-colors">
         <Icon size={28} strokeWidth={1} />
       </div>
       <div className="space-y-2">
          <h4 className="text-xl font-bold tracking-tight">{title}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
