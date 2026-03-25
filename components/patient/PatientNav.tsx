'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PatientNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!localStorage.getItem('token'));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('patient_id');
    router.push('/patient/login');
  };

  if (pathname === '/patient/login' || pathname === '/patient/register') {
    return null; /* Modals are stand-alone */
  }

  if (!isLogged) return null;

  return (
    <aside className="w-full md:w-72 md:shrink-0 bg-zinc-900/50 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-zinc-800/60 sticky top-0 md:h-screen md:overflow-y-auto z-40 flex flex-col shadow-2xl">
      <div className="p-6 md:p-8 border-b border-zinc-800/50">
        <Link href="/patient/dashboard" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 tracking-tight">
          AyushAlert
        </Link>
        <p className="text-xs text-zinc-500 font-bold mt-1.5 tracking-widest uppercase">Patient Node Core</p>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
        <NavLink href="/" current={pathname} icon="🏠">Home</NavLink>
        <NavLink href="/patient/dashboard" current={pathname} icon="📊">Dashboard</NavLink>
        <NavLink href="/patient/profile" current={pathname} icon="🧬">My Identity</NavLink>
        <NavLink href="/patient/records" current={pathname} icon="📚">Health Atlas</NavLink>
        <NavLink href="/patient/upload" current={pathname} icon="🧠">Neural Scan</NavLink>
        <NavLink href="/patient/requests" current={pathname} icon="🔐">Consent Broker</NavLink>
      </nav>

      <div className="p-6 border-t border-zinc-800/50 hidden md:block">
        <button 
          onClick={handleLogout} 
          className="w-full py-3.5 bg-red-900/10 hover:bg-red-900/30 text-red-500 font-bold rounded-xl transition-all border border-red-900/30 text-sm tracking-wide"
        >
          Terminate Session
        </button>
      </div>
    </aside>
  );
}

function NavLink({ href, current, icon, children }: { href: string; current: string; icon: string; children: React.ReactNode }) {
  // exact or starting string logic for active states
  const isActive = current === href || (href !== '/patient/dashboard' && current.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-sm shrink-0 md:shrink border ${
        isActive 
          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
          : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="tracking-wide hidden md:block">{children}</span>
    </Link>
  );
}
