import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ShieldCheck, Loader2, AlertCircle, Sparkles, 
  User, Mail, Lock, Briefcase, ArrowRight, 
  CheckCircle2, Eye, EyeOff, Building2, Zap
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('sales');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const res = await register(name, email, password, role);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setSubmitting(false);
  };

  const roleDescriptions = {
    sales: { title: 'Sales Representative', icon: '📈', color: 'from-emerald-500 to-teal-600', description: 'Manage customer orders and process sales transactions' },
    storekeeper: { title: 'Warehouse Storekeeper', icon: '📦', color: 'from-blue-500 to-cyan-600', description: 'Handle inventory, stock movements, and shipments' },
    manager: { title: 'Operations Manager', icon: '👔', color: 'from-purple-500 to-indigo-600', description: 'Oversee operations, analytics, and team management' },
    admin: { title: 'System Administrator', icon: '⚙️', color: 'from-rose-500 to-pink-600', description: 'Full system access and user management' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          >
            <div className="w-1 h-1 bg-white/20 rounded-full" />
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Decorative Top Bar */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Zap className="w-3 h-3 text-indigo-300" />
            <span className="text-[10px] font-medium text-indigo-200 uppercase tracking-wider">Secure Registration</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="mt-4 text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="mt-1.5 text-sm text-slate-400">
                Join DAB Enterprise Management System
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-3 animate-in slide-in-from-top-2 fade-in">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Registration Error</p>
                  <p className="text-sm text-rose-300 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Full Name
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'scale-[1.01]' : ''}`}>
                  <input
                    type="text"
                    required
                    value={name}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                    placeholder="e.g., Sarah Johnson"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                  <input
                    type="email"
                    required
                    value={email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                    placeholder="sarah@dabenterprise.com"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Role Selection
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(roleDescriptions).map(([key, { title, icon, color }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRole(key)}
                      className={`p-3 rounded-xl text-left transition-all duration-200 ${
                        role === key
                          ? `bg-gradient-to-r ${color} shadow-lg scale-[1.02]`
                          : 'bg-slate-800/50 border border-slate-600 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="text-xl mb-1">{icon}</div>
                      <p className={`text-xs font-semibold ${role === key ? 'text-white' : 'text-slate-300'}`}>
                        {title.split(' ')[0]}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  {roleDescriptions[role]?.description}
                </p>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Password
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm pr-11"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="group">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Confirm Password
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'confirm' ? 'scale-[1.01]' : ''}`}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm pr-11"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && confirmPassword && password === confirmPassword && (
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Passwords match
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full mt-6 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <div className="text-center text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors inline-flex items-center gap-1 group">
                  Sign In
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-slate-500">256-bit SSL</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-600" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] text-slate-500">GDPR Compliant</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-600" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-slate-500">Secure Storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-slate-500">
            DAB Enterprise Management System v2.0
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}