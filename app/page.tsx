"use client";

import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Share2, 
  ScanHeart, 
  Database, 
  Lock, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Stethoscope, 
  Check, 
  Plus,
  Zap,
  LayoutGrid,
  Shield,
  Layers,
  MapPin,
  ChevronRight
} from "lucide-react";
import { useScroll, useSpring } from "framer-motion";

function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  return useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-zinc-950 dark:text-zinc-50 selection:bg-brand/30 overflow-x-hidden transition-colors duration-300">
      <NavBar />
      
      {/* Scroll Progress */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-brand z-[60] origin-left"
        style={{ scaleX: useScrollProgress() }}
      />

      <main>
        {/* --- 1. HERO SECTION (Command Center) --- */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="w-full lg:w-3/5 space-y-10 relative z-10"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-4 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                Healthcare System <span className="mx-1 opacity-20">|</span> Secure Platform
              </span>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] text-zinc-900 dark:text-zinc-50">
                Healthcare Data <br /> Platform. <span className="text-brand underline decoration-zinc-800/20 underline-offset-[12px]">Simplified.</span>
              </h1>
            </motion.div>
            
              The secure platform for your health records. Easy digital records, synced securely with hospitals.
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-5 pt-4"
              variants={fadeIn}
            >
              <Link href="/dashboard" className="group w-full sm:w-auto h-14 inline-flex items-center justify-center gap-2 px-10 bg-zinc-950 dark:bg-brand text-white hover:opacity-90 rounded-xl text-base font-semibold transition-all shadow-2xl shadow-brand/10">
                Get Started <ArrowRight size={20} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#modules" className="w-full sm:w-auto h-14 inline-flex items-center justify-center gap-2 px-10 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-xl text-base font-semibold transition-all">
                View All Modules
              </Link>
            </motion.div>
          </motion.div>

          {/* Product Realism Mockup */}
          <motion.div 
            className="w-full lg:w-2/5 relative z-10"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative w-full aspect-square md:aspect-[4/5] bg-[#0B0F14] border border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden group">
              {/* --- TERMINAL FX --- */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.05)_0%,transparent_100%)] z-0" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-10 pointer-events-none opacity-20 bg-[length:100%_2px,3px_100%]" />
              
              <div className="flex flex-col h-full relative z-10">
                <div className="h-16 border-b border-zinc-800/60 flex items-center px-8 justify-between bg-zinc-900/50 backdrop-blur-md">
                   <div className="flex gap-4 items-center">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                      <div className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-black text-zinc-400 tracking-tighter uppercase">
                        Location: <span className="text-zinc-50 font-mono">Hyderabad</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                      <span className="text-[10px] font-bold text-brand uppercase tracking-widest">System Online</span>
                   </div>
                </div>
                
                <div className="flex-1 p-8 space-y-8 overflow-hidden">
                   <motion.div 
                     className="p-6 rounded-3xl bg-brand/5 border border-brand/20 space-y-4 relative overflow-hidden group/card cursor-pointer"
                     whileHover={{ scale: 1.02 }}
                   >
                      <div className="flex items-center justify-between relative z-10">
                         <div className="flex gap-2 items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand">Health Alert</span>
                            <span className="w-1 h-1 rounded-full bg-brand/40" />
                            <span className="text-[10px] font-medium text-brand/60">Syncing...</span>
                         </div>
                         <span className="text-[10px] font-mono text-brand/40">ID: AX-772</span>
                      </div>
                      <div className="flex items-center gap-6 relative z-10">
                         <RadarPulse />
                         <div className="space-y-1">
                            <h4 className="text-lg font-bold text-zinc-100 tracking-tighter leading-tight">Local Health Trend</h4>
                            <p className="text-xs font-mono text-zinc-500">Pincode: <span className="text-zinc-300">500032 (Gachibowli)</span></p>
                         </div>
                      </div>
                   </motion.div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-4">
                         <div className="flex justify-between items-start">
                            <div className="h-2 w-12 bg-zinc-800 rounded" />
                            <span className="text-[8px] font-bold text-brand">+12.4%</span>
                         </div>
                         <div className="h-10 w-full overflow-hidden">
                            <Sparkline color="#0D9488" />
                         </div>
                         <div className="h-4 w-16 bg-zinc-800/40 rounded" />
                      </div>
                      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-4">
                         <div className="flex justify-between items-start">
                            <div className="h-2 w-12 bg-zinc-800 rounded" />
                            <span className="text-[8px] font-bold text-red-400">-2.1%</span>
                         </div>
                         <div className="h-10 w-full overflow-hidden">
                            <Sparkline color="#F87171" />
                         </div>
                         <div className="h-4 w-16 bg-zinc-800/40 rounded" />
                      </div>
                   </div>

                   <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recent Activity</span>
                         <span className="text-[10px] font-mono text-zinc-600">SYSTEM: ONLINE</span>
                      </div>
                      <AutoScrollFeed />
                   </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] bg-brand/10 dark:bg-brand/20 blur-[120px] rounded-full pointer-events-none -z-10" />
          </motion.div>
        </section>

        {/* --- 2. ARCHITECTURE / BENTO --- */}
        <section id="architecture" className="py-32 px-6 md:px-12 border-t border-zinc-100 dark:border-zinc-800/60 bg-[#FAFAFA] dark:bg-[#0E1219]">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1]">
                Simple Deployment. <br/>
                <span className="text-zinc-400">Comprehensive Healthcare. Simplified for You.</span>
              </h2>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <ArchitectureItem 
                icon={Plus} step="01" title="Easy Records"
                desc="Fast digital records. Accurate and secure."
              />
              <ArchitectureItem 
                icon={Layers} step="02" title="Patient History"
                desc="One place for all your previous medical records."
              />
              <ArchitectureItem 
                icon={Shield} step="03" title="Secure Consent"
                desc="You own your data. You choose who sees it."
              />
              <ArchitectureItem 
                icon={Zap} step="04" title="Health Trends"
                desc="See health patterns and alerts in your area."
              />
            </motion.div>
          </div>
        </section>

        {/* --- 3. THE ECOSYSTEM MODULATOR --- */}
        <section id="modules" className="py-32 px-6 md:px-12 border-t border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-[#0B0F14]">
           <div className="max-w-7xl mx-auto space-y-20">
              <div className="max-w-2xl space-y-4">
                 <h2 className="text-[10px] font-black text-brand uppercase tracking-[0.3em]">Our Network</h2>
                 <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter leading-none">One Platform. For Everyone.</h3>
                 <p className="text-lg text-zinc-500 font-medium leading-relaxed">A simple way for patients, doctors, and hospitals to work together.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ModuleCard 
                  icon={Database} title="Hospital Records" 
                  desc="A secure way for hospitals to store and manage patient data." 
                  tags={["Hospitals", "Data Storage"]} image="/Assets/emr_terminal.png"
                />
                <ModuleCard 
                  icon={Stethoscope} title="Doctor Portal" 
                  desc="A simple tool for doctors to view history and write prescriptions." 
                  tags={["Doctors", "Prescriptions"]} image="/Assets/doctor_terminal.png"
                />
                <ModuleCard 
                  icon={LayoutGrid} title="Patient Account" 
                  desc="Your health in your hands. Securely share your records when needed." 
                  tags={["Patients", "Private"]} image="/Assets/patient_wallet.png"
                />
                <ModuleCard 
                  icon={Activity} title="Health Analytics" 
                  desc="See real-time health trends and alerts in your community." 
                  tags={["Public Health", "Trends"]} image="/Assets/surveillance.png"
                />
              </div>
           </div>
        </section>

        {/* --- 4. INSTITUTIONAL CALL TO ACTION --- */}
        <section id="ecosystem" className="py-32 px-6 md:px-12 bg-zinc-950 text-white overflow-hidden relative border-t border-zinc-800/60">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
           <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
              <h2 className="text-5xl md:text-[80px] font-bold tracking-tighter leading-[0.9]">Connect your hospital <br /> to the modern health network.</h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">Ready to join the AyushAlert network?</p>
              <div className="pt-6">
                 <Link href="/dashboard" className="h-16 inline-flex items-center justify-center px-12 bg-white text-zinc-950 hover:bg-zinc-100 rounded-2xl text-lg font-bold transition-transform hover:scale-[1.02] shadow-xl">
                    Get Started with Demo
                 </Link>
              </div>
           </div>
        </section>

        {/* --- 5. TRUST / SOVEREIGNTY --- */}
        <section className="py-32 px-6 md:px-12 border-t border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-[#0B0F14]">
           <div className="max-w-7xl mx-auto space-y-20">
              <div className="max-w-2xl space-y-4">
                 <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase">Secure Healthcare</h2>
                 <p className="text-lg text-zinc-500 font-medium">Built with security and privacy to keep your health data safe.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <TrustCard 
                   icon={ShieldCheck} title="Privacy Control" 
                   desc="You decide who can access your medical records." 
                 />
                 <TrustCard 
                   icon={Zap} title="Patient History" 
                   desc="All your prescriptions and reports in one secure place." 
                 />
                 <TrustCard 
                   icon={Globe} title="Health Trends" 
                   desc="Helping communities stay safe with real-time health data." 
                 />
              </div>
           </div>
        </section>

        {/* --- 6. INFRASTRUCTURE MISSION --- */}
        <section className="py-32 px-6 md:px-12 bg-white dark:bg-[#0B0F14] border-t border-zinc-100 dark:border-zinc-800/60">
           <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
              <motion.div 
                className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-brand/20 bg-brand/5"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em]">Secure Platform</span>
              </motion.div>
              <h2 className="text-5xl md:text-7xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-[0.9]">
                We are building more than a feature. <br /> 
                We are building the <span className="text-brand">healthcare network for everyone.</span>
              </h2>
           </div>
        </section>
      </main>
    </div>
  );
}

function AnimatedOutline() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-brand/40 fill-none" preserveAspectRatio="none">
       <motion.rect
         width="100%"
         height="100%"
         rx="40"
         initial={{ pathLength: 0, opacity: 0 }}
         whileHover={{ pathLength: 1, opacity: 1 }}
         transition={{ duration: 0.8, ease: "easeInOut" }}
         strokeWidth="2"
       />
    </svg>
  );
}

function TrustCard({ icon: Icon, title, desc }: any) {
  return (
    <motion.div 
      className="relative p-12 rounded-[40px] bg-zinc-50/50 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/40 space-y-8 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-700 group cursor-default"
      whileHover={{ y: -10 }}
    >
       <AnimatedOutline />
       <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand transition-all duration-500 shadow-sm relative z-10">
         <Icon size={32} strokeWidth={1} />
       </div>
       <div className="space-y-4 relative z-10">
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tighter">{title}</h3>
          <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{desc}</p>
       </div>
    </motion.div>
  );
}

function ArchitectureItem({ icon: Icon, title, desc, step }: any) {
  return (
    <motion.div 
      className="relative flex flex-col items-center text-center space-y-8 p-10 group"
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative">
         <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-brand group-hover:border-brand/40 transition-all duration-500 shadow-xl">
           <Icon size={32} strokeWidth={1} />
         </div>
         <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand text-white text-[10px] font-black flex items-center justify-center shadow-lg">{step}</div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h3>
        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed opacity-60">{desc}</p>
      </div>
    </motion.div>
  );
}

function ModuleCard({ icon: Icon, title, desc, tags, image }: any) {
  return (
    <motion.div 
      className="relative p-12 bg-zinc-950 text-white rounded-[40px] border border-zinc-800/60 overflow-hidden group cursor-pointer h-full"
      whileHover={{ y: -8 }}
    >
      {image ? (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
          <Image src={image} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>
      ) : (
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-brand/20 transition-all duration-700" />
      )}
      
      <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start h-full">
         <div className="w-24 h-24 rounded-[32px] bg-zinc-900 border border-zinc-800 shadow-2xl flex items-center justify-center text-brand flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
           <Icon size={48} strokeWidth={1} />
         </div>
         <div className="space-y-8 flex-1">
            <div className="flex flex-wrap gap-3">
               {tags.map((tag: any) => (
                 <span key={tag} className="px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400">{tag}</span>
               ))}
            </div>
            <div className="space-y-4">
               <h3 className="text-4xl font-bold tracking-tighter leading-none">{title}</h3>
               <p className="text-lg text-zinc-400 font-medium leading-relaxed">{desc}</p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-brand font-bold text-sm tracking-tight group-hover:translate-x-2 transition-transform">
               Learn More <ChevronRight size={18} />
            </div>
         </div>
      </div>
    </motion.div>
  );
}

function RadarPulse() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
       <div className="absolute inset-0 bg-brand/20 rounded-full animate-ping" />
       <div className="absolute inset-2 bg-brand/30 rounded-full animate-[ping_1.5s_infinite]" />
       <div className="relative w-10 h-10 rounded-full bg-brand/10 border border-brand/40 flex items-center justify-center text-brand shadow-[0_0_20px_rgba(13,148,136,0.3)]">
         <MapPin size={18} strokeWidth={2.5} />
       </div>
    </div>
  );
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
       <motion.path
         d="M0 35 Q 10 35, 20 20 T 40 25 T 60 10 T 80 15 T 100 5"
         fill="none"
         stroke={color}
         strokeWidth="2"
         initial={{ pathLength: 0, opacity: 0 }}
         animate={{ pathLength: 1, opacity: 1 }}
         transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
       />
       <motion.path
         d="M0 35 Q 10 35, 20 20 T 40 25 T 60 10 T 80 15 T 100 5 L 100 40 L 0 40 Z"
         fill={`url(#gradient-${color.replace("#", "")})`}
         initial={{ opacity: 0 }}
         animate={{ opacity: 0.1 }}
         transition={{ duration: 1 }}
       />
       <defs>
          <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor={color} />
             <stop offset="100%" stopColor="transparent" />
          </linearGradient>
       </defs>
    </svg>
  );
}

function AutoScrollFeed() {
  const logs = [
    "Connecting to hospital...",
    "142 Records updated...",
    "Checking local trends...",
    "Health trend detected...",
    "Data verified...",
    "Hospital connected...",
    "Live updates active",
  ];

  return (
    <div className="h-32 overflow-hidden relative group">
       <motion.div 
         className="space-y-3"
         animate={{ y: [0, -200] }}
         transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
       >
          {[...logs, ...logs].map((log, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] font-mono font-bold tracking-tighter">
               <span className="text-zinc-500">{log}</span>
               <span className={`${i % 2 === 0 ? "text-brand" : "text-zinc-600"}`}>[OK]</span>
            </div>
          ))}
       </motion.div>
       <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/40 pointer-events-none" />
    </div>
  );
}
