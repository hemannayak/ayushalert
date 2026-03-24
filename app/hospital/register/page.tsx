'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HospitalRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    registration_id: '',
    address: '',
    admin_email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/hospital/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

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
    <div className="max-w-md mx-auto bg-zinc-900/80 backdrop-blur-xl p-8 rounded-xl shadow-lg mt-10 border-t-4 border-purple-600">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Hospital Registration</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-semibold">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Hospital Name</label>
          <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Government Registration ID</label>
          <input required type="text" onChange={e => setFormData({...formData, registration_id: e.target.value})} className="w-full border rounded-md p-2 uppercase" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Full Address</label>
          <input required type="text" onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Admin Email</label>
          <input required type="email" onChange={e => setFormData({...formData, admin_email: e.target.value})} className="w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Secure Password</label>
          <input required type="password" onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-md p-2" />
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition mt-6">
          {loading ? 'Registering...' : 'Register Hospital'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already registered? <Link href="/hospital/login" className="text-purple-600 hover:underline">Login here</Link>
      </p>
    </div>
  );
}
