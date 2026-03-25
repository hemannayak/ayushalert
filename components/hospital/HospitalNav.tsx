'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',                        label: '⌂ Home' },
  { href: '/hospital/search',        label: 'Search Patients' },
  { href: '/hospital/request',       label: 'Request Access' },
  { href: '/hospital/view-records',  label: 'View Records' },
  { href: '/hospital/portal',        label: 'EMR Sync' },
];

export default function HospitalNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/hospital/search" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">AyushAlert</span>
            <span className="text-zinc-500 font-normal"> / </span>
            <span className="text-sm font-semibold text-zinc-300">Hospital Portal</span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}>
                {label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-5 bg-zinc-800 mx-1" />

          {/* Hospital Login */}
          <Link href="/hospital/login"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === '/hospital/login'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}>
            Login
          </Link>

          {/* Admin Panel — distinct red */}
          <Link href="/admin/hospitals"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === '/admin/hospitals'
                ? 'bg-red-600/25 text-red-300 border border-red-500/40'
                : 'text-rose-600 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60'
            }`}>
            🛡 Admin
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
