import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Loader2, AlertCircle, Mail, Lock, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-[#090D16] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans select-none relative overflow-hidden">
      {/* Subtle Background Glow Decorative Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-6 bg-slate-900/40 p-8 sm:p-10 rounded-2xl border border-slate-800/60 shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)] backdrop-blur-xl z-10 transition-all duration-300 hover:border-slate-800/80">
        
        {/* Top Header branding */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/10">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-white tracking-tight font-display">
            DAB<span className="text-emerald-400 bg-clip-text">.ENT</span>
          </h2>
          <p className="mt-1 text-[11px] uppercase font-semibold tracking-[0.25em] text-slate-400">
            Business Management System
          </p>
        </div>

        {/* Dynamic Alerts Container */}
        {(isExpired || error) && (
          <div className="space-y-2 animate-fadeIn">
            {isExpired && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300/90 font-medium tracking-wide">
                  Your session has expired. Please sign in again.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-xs text-rose-300/90 font-medium tracking-wide">
                  {error}
                </p>
              </div>
            )}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Business Email
              </label>
              <div className="relative rounded-xl group focus-within:ring-2 focus-within:ring-emerald-500/40 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-hidden text-sm transition-all font-medium focus:bg-slate-950"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl group focus-within:ring-2 focus-within:ring-emerald-500/40 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-hidden text-sm transition-all font-medium focus:bg-slate-950"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-xs font-bold uppercase tracking-widest rounded-xl text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans cursor-pointer shadow-lg shadow-emerald-500/10"
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
        <div className="pt-5 border-t border-slate-800/60">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Sparkles className="w-3 h-3 text-emerald-400/80" />
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Fast Demo Access
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'System Admin', email: 'admin@dab.com', pass: 'admin123', primary: true },
              { role: 'Store Manager', email: 'manager@dab.com', pass: 'manager123' },
              { role: 'Storekeeper', email: 'store@dab.com', pass: 'store123' },
              { role: 'Sales Rep', email: 'sales@dab.com', pass: 'sales123' }
            ].map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => handleDemoSignIn(demo.email, demo.pass)}
                className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/70 hover:border-slate-700 hover:bg-slate-900/60 text-left transition-all active:scale-[0.97] group cursor-pointer"
              >
                <span className={`block font-bold text-[11px] uppercase tracking-wide group-hover:text-white transition-colors ${demo.primary ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {demo.role}
                </span>
                <span className="block text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors font-mono mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  {demo.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-[11px] text-slate-400 font-medium tracking-wide pt-2">
          New account?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 hover:underline transition-colors">
            Register employee self-service
          </Link>
        </div>

      </div>
    </div>
  );
}