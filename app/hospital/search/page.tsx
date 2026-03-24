'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HospitalSearch() {
  const [patientId, setPatientId] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) return;
    // In a real app, you might look up basic patient demographics.
    // For this prompt, it says: "Display message explaining: After requesting access, wait for patient approval."
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-zinc-900/80 backdrop-blur-xl p-8 rounded-xl shadow border-t-4 border-teal-600 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Search Patient Data</h2>
        
        <form onSubmit={handleSearch} className="flex space-x-2 mt-6 justify-center">
          <input
            type="text"
            placeholder="Enter Patient ID (e.g. PAT_123)"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="border border-zinc-800/50 rounded-md p-3 w-64 text-black focus:ring-teal-500 focus:border-teal-500"
          />
          <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-md">
            Search
          </button>
        </form>

        {patientId.trim() && (
          <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg text-left">
            <h3 className="font-semibold text-lg text-blue-800 mb-2">Patient Records Protected</h3>
            <p className="text-zinc-300 mb-4">
              To view health records for <span className="font-mono font-bold">{patientId}</span>, you need explicit patient consent. 
              After requesting access, wait for patient approval.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/hospital/request" 
                className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded transition"
              >
                Request Access Now
              </Link>
              <Link 
                href="/hospital/view-records" 
                className="inline-block bg-gray-200 hover:bg-gray-300 text-zinc-200 font-medium py-2 px-4 rounded transition"
              >
                Check Approved Records
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
