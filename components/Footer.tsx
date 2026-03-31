"use client";

import Link from "next/link";
import { Globe, Shield, MessageSquare, CheckCircle2, Lock, Mail, Database, Signal, Cpu } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="pt-24 pb-12 px-6 md:px-12 border-t border-white/5 bg-zinc-950 relative overflow-hidden">
      {/* Mesh Background for Footer */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-24">
          {/* Brand Column */}
          <div className="col-span-2 space-y-8">
              <div className="flex items-center gap-4 group cursor-pointer">
                 <BrandLogo variant="horizontal" size={32} />
              </div>
             
             <p className="text-sm font-medium text-zinc-500 max-w-xs leading-relaxed">
                Advanced institutional infrastructure for sovereign identity management. FHIR-native, decentralized, and cryptographically verified.
             </p>
             
             <div className="flex gap-4">
               {[Globe, Mail, MessageSquare].map((Icon, i) => (
                 <a key={i} href="#" className="p-2 rounded-lg bg-zinc-900/50 hover:bg-brand/20 border border-white/5 text-zinc-500 hover:text-white transition-all">
                   <Icon size={16} />
                 </a>
               ))}
           </div>
          </div>

          {/* Platform Column */}
          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Nodes</h4>
             <ul className="space-y-4 text-xs font-bold text-zinc-600">
                <li><Link href="/patient/login" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Patient Hub <ArrowRight size={10} /></Link></li>
                <li><Link href="/doctor/login" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Clinical Terminal <ArrowRight size={10} /></Link></li>
                <li><Link href="/hospital/login" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Institutional Vault <ArrowRight size={10} /></Link></li>
                <li><Link href="/analytics" className="hover:text-indigo-400 transition-colors flex items-center gap-2">Intelligence Hub <ArrowRight size={10} /></Link></li>
             </ul>
          </div>

          {/* Intelligence Column */}
          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Core</h4>
             <ul className="space-y-4 text-xs font-bold text-zinc-600">
                <li><Link href="/docs" className="hover:text-indigo-400 transition-colors">FHIR Stack</Link></li>
                <li><Link href="/docs/api" className="hover:text-indigo-400 transition-colors">Endpoint Matrix</Link></li>
                <li><Link href="/docs/architecture" className="hover:text-indigo-400 transition-colors">VLM-Engine</Link></li>
                <li><Link href="/docs/open-source" className="hover:text-indigo-400 transition-colors">Sovereign OS</Link></li>
             </ul>
          </div>

          {/* Governance Column */}
          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Trust</h4>
             <ul className="space-y-4 text-xs font-bold text-zinc-600">
                <li><Link href="/security" className="hover:text-indigo-400 transition-colors">Zero-Knowledge</Link></li>
                <li><Link href="/governance" className="hover:text-indigo-400 transition-colors">Consensus</Link></li>
                <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">N-Identity</Link></li>
                <li><Link href="/status" className="hover:text-brand transition-colors whitespace-nowrap flex items-center gap-2">Node Status <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /></Link></li>
             </ul>
          </div>

          {/* Terminal Stats Column */}
          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Telemetry</h4>
             <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                   <span>Node Health</span>
                   <span className="text-emerald-500">Nominal</span>
                </div>
                <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500/40 w-[94%]" />
                </div>
                <div className="flex items-center justify-between text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                   <span>Sync Rate</span>
                   <span className="text-indigo-400">44 TPS</span>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-6">
              <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} AyushAlert Protocol. Part of the Decentralized infrastructure Initiative.
              </p>
           </div>
           
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-6">
                    <BrandLogo variant="horizontal" size={24} />
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Sovereign Protocol v1.4</span>
                 </div>
                 <div className="flex items-center gap-2 text-zinc-800 group hover:text-zinc-600 transition-colors cursor-default">
                    <CheckCircle2 size={12} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Node Verified</p>
                 </div>
                 <div className="w-px h-4 bg-white/5 mx-2 hidden md:block" />
                 <div className="flex gap-6 text-[10px] font-black uppercase tracking-wider text-zinc-700 hover:text-zinc-400 transition-colors">
                    <Link href="/terms">Terms</Link>
                    <Link href="/privacy">Privacy</Link>
                 </div>
              </div>
           </div>
        </div>
     </footer>
  );
}

function ArrowRight({ size, className }: any) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>; }
