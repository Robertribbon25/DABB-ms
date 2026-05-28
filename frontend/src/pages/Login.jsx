import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isExpired = searchParams.get('expired') === 'true';

  const handleDemoSignIn = (demoMail, demoPass) => {
    setEmail(demoMail);
    setPassword(demoPass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!email || !password) {
      setError('Please fill in all input fields.');
      setSubmitting(false);
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans select-none">
      <div className="max-w-md w-full space-y-8 bg-slate-950/40 p-8 sm:p-10 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md">
        
        {/* Top Header branding */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-white tracking-tighter uppercase font-display">DAB<span className="text-emerald-400">.ENT</span></h2>
          <p className="mt-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Business Management System</p>
        </div>

        {isExpired && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
              Your session has expired. Please sign in again.
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-lg p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300 font-bold uppercase tracking-wider">
              {error}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Business Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-[#0F172A] border border-slate-850 rounded-lg text-white placeholder-slate-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-colors font-medium"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-[#0F172A] border border-slate-850 rounded-lg text-white placeholder-slate-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-colors font-medium"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-xs font-bold uppercase tracking-widest rounded-lg text-white bg-emerald-500 hover:bg-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </div>
        </form>

        {/* Demo Fast Account Selectors */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
            Operations Live Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoSignIn('admin@dab.com', 'admin123')}
              className="py-2.5 px-3 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 text-slate-300 font-medium text-left transition-all active:scale-95 cursor-pointer"
            >
              <span className="block font-black text-emerald-400 font-display text-[11px] uppercase tracking-wider">System Admin</span>
              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">admin@dab.com</span>
            </button>
            <button
              onClick={() => handleDemoSignIn('manager@dab.com', 'manager123')}
              className="py-2.5 px-3 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 text-slate-300 font-medium text-left transition-all active:scale-95 cursor-pointer"
            >
              <span className="block font-black text-slate-200 font-display text-[11px] uppercase tracking-wider">Store Manager</span>
              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">manager@dab.com</span>
            </button>
            <button
              onClick={() => handleDemoSignIn('store@dab.com', 'store123')}
              className="py-2.5 px-3 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 text-slate-300 font-medium text-left transition-all active:scale-95 cursor-pointer"
            >
              <span className="block font-black text-slate-200 font-display text-[11px] uppercase tracking-wider">Storekeeper</span>
              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">store@dab.com</span>
            </button>
            <button
              onClick={() => handleDemoSignIn('sales@dab.com', 'sales123')}
              className="py-2.5 px-3 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 text-slate-300 font-medium text-left transition-all active:scale-95 cursor-pointer"
            >
              <span className="block font-black text-slate-200 font-display text-[11px] uppercase tracking-wider">Sales Representative</span>
              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">sales@dab.com</span>
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6 pt-2">
          New account? <Link to="/register" className="text-emerald-400 font-black hover:text-emerald-300 underline">Register employee self-service</Link>
        </div>

      </div>
    </div>
  );
}
