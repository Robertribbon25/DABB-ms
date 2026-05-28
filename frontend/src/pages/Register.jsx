import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sales');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!name || !email || !password) {
      setError('Please fill in all registration fields.');
      setSubmitting(false);
      return;
    }

    const res = await register(name, email, password, role);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-slate-950/80 p-8 sm:p-10 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/10">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight">DAB Enterprise</h2>
          <p className="mt-1.5 text-sm text-slate-400">Employee Self-Registration Portal</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/35 rounded-lg p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-450 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300">
              {error}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm transition-colors"
                placeholder="Sarah Connor"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Business Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm transition-colors"
                placeholder="sarah@dab.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Access Authorization Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm transition-colors"
              >
                <option value="sales">Sales Representative</option>
                <option value="storekeeper">Warehouse Storekeeper</option>
                <option value="manager">Operations Manager</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Secure Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-sm transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-sky-600 hover:bg-sky-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Generate Credentials & Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-400 mt-6 pt-2">
          Already registered? <Link to="/login" className="text-sky-400 font-medium hover:underline">Sign In to Dashboard</Link>
        </div>

      </div>
    </div>
  );
}
