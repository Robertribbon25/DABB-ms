import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, Loader2, AlertCircle, Mail, Lock, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen bg-[#060913] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans select-none relative overflow-hidden">
      {/* Premium Multi-layered Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-blue-600/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-6 bg-slate-900/30 p-8 sm:p-10 rounded-2xl border border-slate-800/40 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-10 transition-all duration-300 hover:border-slate-800/70">
        
        {/* Top Header Branding */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center shadow-inner relative group">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <ShieldCheck className="h-6 w-6 text-emerald-400 relative z-10 animate-pulse" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-white tracking-tight font-display">
            DAB<span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">.ENT</span>
          </h2>
          <p className="mt-1.5 text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">
            Business Management System
          </p>
        </div>

        {/* Alerts Block */}
        {(isExpired || error) && (
          <div className="space-y-2.5 transition-all duration-200 ease-out">
            {isExpired && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300/90 font-medium tracking-wide">
                  Your session has expired. Please sign in again.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3.5 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-xs text-rose-300/90 font-medium tracking-wide">
                  {error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Credentials Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Business Email
              </label>
              <div className="relative rounded-xl group focus-within:ring-1 focus-within:ring-emerald-500/60 transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-200">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-hidden text-sm transition-all duration-200 font-medium focus:bg-slate-950/80 focus:border-slate-700"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative rounded-xl group focus-within:ring-1 focus-within:ring-emerald-500/60 transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-200">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-hidden text-sm transition-all duration-200 font-medium focus:bg-slate-950/80 focus:border-slate-700"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password Utilities */}
          <div className="flex items-center justify-between text-xs font-medium">
            <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-800 bg-slate-950 text-emerald-500 accent-emerald-500 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
              />
              <span>Remember device</span>
            </label>
            <Link to="/forgot-password" className="text-slate-500 hover:text-slate-400 transition-colors">
              Forgot password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-xs font-bold uppercase tracking-widest rounded-xl text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-emerald-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-sans cursor-pointer shadow-[0_4px_20px_rgba(52,211,153,0.15)]"
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
        <div className="pt-5 border-t border-slate-800/50">
          <div className="flex items-center justify-center gap-1.5 mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400/70" />
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
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
                className="p-2.5 rounded-xl bg-slate-950/20 border border-slate-800/50 hover:border-slate-700/60 hover:bg-slate-900/40 text-left transition-all duration-200 active:scale-[0.97] group cursor-pointer"
              >
                <span className={`block font-bold text-[11px] uppercase tracking-wide group-hover:text-white transition-colors duration-200 ${demo.primary ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {demo.role}
                </span>
                <span className="block text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors duration-200 font-mono mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  {demo.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Link Component */}
        <div className="text-center text-[11px] text-slate-400 font-medium tracking-wide pt-2">
          New account?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 hover:underline transition-all duration-150">
            Register employee self-service
          </Link>
        </div>

      </div>
    </div>
  );
}