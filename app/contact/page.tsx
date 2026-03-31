"use client";

import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { Mail, Globe, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-zinc-950 dark:text-zinc-50 font-sans selection:bg-brand/30">
      <NavBar />

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:w-1/2 space-y-12"
        >
          <div className="space-y-6">
            <span className="text-sm font-black uppercase tracking-widest text-brand">Support & Partnership</span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
              Let’s build <br /> together.
            </h1>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Whether you are a hospital network, research institution, or healthcare professional, we are here to support your autonomous infrastructure deployment.
            </p>
          </div>

          <div className="space-y-8">
             <ContactInfo icon={Mail} title="Institutional Support" desc="support@ayushalert.org" />
             <ContactInfo icon={Globe} title="Global Partnerships" desc="partners@ayushalert.org" />
             <ContactInfo icon={MapPin} title="Operational Hub" desc="AyushAlert Protocol Headquarters, Hyderabad, India." />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:w-1/2 p-10 md:p-14 rounded-[40px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-8"
        >
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="First Name" placeholder="Ayush" />
              <InputGroup label="Last Name" placeholder="Nayak" />
           </div>
           <InputGroup label="Institutional Email" placeholder="ayush@hospital.org" />
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Message</label>
              <textarea placeholder="Describe your institutional requirement..." className="w-full h-40 bg-white dark:bg-[#0B0F14] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-brand focus:border-brand transition-all outline-none resize-none" />
           </div>
           <button className="w-full h-14 bg-zinc-950 dark:bg-brand text-white rounded-2xl text-base font-bold shadow-2xl hover:opacity-90 transition-all">Submit Request</button>
        </motion.div>
      </main>
    </div>
  );
}

function ContactInfo({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-6 items-start">
       <div className="w-12 h-12 rounded-xl bg-brand/5 border border-brand/20 flex flex-shrink-0 items-center justify-center text-brand">
         <Icon size={24} />
       </div>
       <div className="space-y-1">
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400">{title}</h4>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{desc}</p>
       </div>
    </div>
  );
}

function InputGroup({ label, placeholder }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</label>
       <input type="text" placeholder={placeholder} className="w-full h-14 bg-white dark:bg-[#0B0F14] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 text-sm font-medium focus:ring-1 focus:ring-brand focus:border-brand transition-all outline-none" />
    </div>
  );
}
