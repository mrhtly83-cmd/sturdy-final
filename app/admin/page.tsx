'use client';

import { useState } from 'react';
import Header from '@/app/_components/Header'; // Adjust path if your components are elsewhere
import Footer from '@/app/_components/Footer';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMakeAdmin = async () => {
    if (!email) return;
    setLoading(true);
    setMessage('');
    
    try {
      // Calls your existing API route at app/api/admin/role/route.ts
      const res = await fetch('/api/admin/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'admin' }), 
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(`Success: ${data.message || 'User is now an admin'}`);
      } else {
        setMessage(`Error: ${data.error || 'Failed to update role'}`);
      }
    } catch (error) {
      setMessage('Error: Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-teal-400">Admin Dashboard</h1>

        {/* Admin Actions Card */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm max-w-xl">
          <h2 className="text-xl font-semibold mb-4 text-white">Manage User Roles</h2>
          <p className="text-slate-400 mb-4 text-sm">
            Enter a user's email to grant them Admin privileges.
          </p>
          
          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
            
            <button
              onClick={handleMakeAdmin}
              disabled={loading}
              className={`bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 px-4 rounded-lg transition-colors
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Grant Admin Access'}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
              {message}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
