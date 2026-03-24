'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HospitalNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#009688] py-4 px-6 text-white w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/hospital/search" className="text-xl font-bold tracking-tight">Hospital Portal</Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link 
            href="/hospital/search" 
            className="hover:text-emerald-100 transition-colors"
          >
            Search Patients
          </Link>
          <Link 
            href="/hospital/request" 
            className="hover:text-emerald-100 transition-colors"
          >
            Request Access
          </Link>
          <Link 
            href="/hospital/view-records" 
            className="hover:text-emerald-100 transition-colors"
          >
            View Records
          </Link>
        </div>
      </div>
    </nav>
  );
}
