'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HospitalNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-teal-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/hospital/search" className="text-xl font-bold">Hospital Portal</Link>
        <div className="space-x-2 md:space-x-4">
          <Link 
            href="/hospital/search" 
            className={`hover:underline px-2 py-1 rounded ${pathname === '/hospital/search' ? 'bg-teal-700' : ''}`}
          >
            Search Patients
          </Link>
          <Link 
            href="/hospital/request" 
            className={`hover:underline px-2 py-1 rounded ${pathname === '/hospital/request' ? 'bg-teal-700' : ''}`}
          >
            Request Access
          </Link>
          <Link 
            href="/hospital/view-records" 
            className={`hover:underline px-2 py-1 rounded ${pathname === '/hospital/view-records' ? 'bg-teal-700' : ''}`}
          >
            View Records
          </Link>
        </div>
      </div>
    </nav>
  );
}
