"use client";

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { 
  Sun, 
  Moon, 
  ChevronDown, 
  User, 
  Stethoscope, 
  Database, 
  Activity, 
  Shield, 
  Layers, 
  Globe,
  Info,
  Zap,
  Mail,
  Signal,
  Book,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NavBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = {
    platform: [
      { title: "Sovereign Identity", desc: "Citizen-first health wallet.", href: "/patient/login", icon: User },
      { title: "Command Suite", desc: "Intelligent clinical terminal.", href: "/doctor/login", icon: Stethoscope },
      { title: "Health Repository", desc: "Institutional EMR infrastructure.", href: "/hospital/login", icon: Database },
      { title: "Public Intelligence", desc: "Regional surveillance markers.", href: "/analytics", icon: Activity },
    ],
    ecosystem: [
       { title: "Architecture", desc: "The connective data layer.", href: "/docs/architecture", icon: Layers },
       { title: "Security Layer", desc: "Consent-driven protocol.", href: "/security", icon: Shield },
       { title: "Governance", desc: "Regional compliance specs.", href: "/governance", icon: Globe },
       { title: "Core Protocol", desc: "Infrastructure documentation.", href: "/docs", icon: Book },
    ],
    company: [
       { title: "Identity", desc: "Our platform vision.", href: "/about-us", icon: Info },
       { title: "Mission", desc: "Data sovereignty at scale.", href: "/mission", icon: Zap },
       { title: "Connectivity", desc: "Institutional support.", href: "/contact", icon: Mail },
       { title: "Network Status", desc: "Live infrastructure health.", href: "/status", icon: Signal },
    ]
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0B0F14]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0">
           <BrandLogo size={26} />
        </Link>
        
        {/* Center Links (Simple Mega Menus) */}
        <div className="hidden md:flex items-center gap-1 font-sans">
           <NavDropdown 
             label="Platform" 
             items={menuItems.platform} 
             isOpen={activeMenu === 'platform'}
             onHover={() => setActiveMenu('platform')}
             onLeave={() => setActiveMenu(null)}
           />
           <NavDropdown 
             label="Ecosystem" 
             items={menuItems.ecosystem} 
             isOpen={activeMenu === 'ecosystem'}
             onHover={() => setActiveMenu('ecosystem')}
             onLeave={() => setActiveMenu(null)}
           />
           <NavDropdown 
             label="Company" 
             items={menuItems.company} 
             isOpen={activeMenu === 'company'}
             onHover={() => setActiveMenu('company')}
             onLeave={() => setActiveMenu(null)}
           />
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors p-1"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>
          )}
          <Link href="/dashboard" className="bg-zinc-950 dark:bg-brand text-white px-4 sm:px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest sm:tracking-normal sm:capitalize hover:opacity-90 transition-all shadow-sm">
            <span className="hidden sm:inline">Access Ecosystem</span>
            <span className="sm:hidden text-[10px]">Access</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavDropdown({ label, items, isOpen, onHover, onLeave }: any) {
  return (
    <div className="relative" onMouseEnter={onHover} onMouseLeave={onLeave}>
       <button className="px-5 py-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
          {label} <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
       </button>

       <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[420px]"
            >
               <div className="bg-white dark:bg-[#111621] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-3 grid grid-cols-2 gap-1">
                  {items.map((item: any) => (
                    <Link 
                      key={item.title} 
                      href={item.href}
                      className="p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group flex items-start gap-4"
                    >
                       <div className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand transition-colors flex-shrink-0">
                          <item.icon size={18} strokeWidth={1.5} />
                       </div>
                       <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                          <p className="text-[10px] leading-tight text-zinc-500 font-medium">{item.desc}</p>
                       </div>
                    </Link>
                  ))}
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}
