'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/hospital/search',        label: 'DASHBOARD' },
  { href: '/hospital/request',       label: 'REQUEST ACCESS' },
  { href: '/hospital/view-records',  label: 'VIEW RECORDS' },
];

export default function HospitalNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-zinc-950 border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/hospital/search" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/10">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white tracking-[0.2em] uppercase leading-tight">AyushAlert</span>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mt-0.5">Hospital Node</span>
            </div>
          </Link>
          
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          
          <Link href="/" className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-colors hidden sm:block">
            ⟵ Return to Homepage
          </Link>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                  active
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                }`}>
                {label}
              </Link>
            );
          })}

          <div className="w-px h-5 bg-white/10 mx-2" />

          {/* Hospital Login */}
          <Link href="/hospital/login"
            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
              pathname === '/hospital/login'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
            }`}>
            LOGIN
          </Link>

          {/* Admin Panel */}
          <Link href="/admin/hospitals"
            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all flex items-center gap-2 ${
              pathname === '/admin/hospitals'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                : 'text-rose-600 hover:text-rose-400 hover:bg-rose-500/5'
            }`}>
            🛡 ADMIN
          </Link>
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Live</span>
        </div>
      </div>
    </nav>
  );
}
