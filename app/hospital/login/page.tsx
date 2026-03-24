'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HospitalLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ admin_email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/hospital/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('hospital_id', data.hospital_id);
      
      router.push('/hospital/mock-portal');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-20 border-t-4 border-purple-600">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-800">Hospital Admin Login</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-semibold">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
          <input required type="email" onChange={e => setFormData({...formData, admin_email: e.target.value})} className="w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input required type="password" onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-md p-2" />
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition mt-6">
          {loading ? 'Authenticating...' : 'Login'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
        <button 
           onClick={() => {
              // Quick demo login
              setFormData({ admin_email: 'admin@apollo.com', password: 'demo' });
           }}
           className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded transition text-sm"
        >
          Use Demo Hospital Credentials
        </button>
        <p className="text-center text-sm text-gray-500">
          Not registered? <Link href="/hospital/register" className="text-purple-600 hover:underline">Register Hospital</Link>
        </p>
      </div>
    </div>
  );
}
