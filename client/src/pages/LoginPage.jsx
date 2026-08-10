import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, CalendarCheck2, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        showToast(`Welcome back, ${res.data.name}!`, 'success');
        navigate('/dashboard');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Demo Sign in for testing/interviews
  const fillDemoAccount = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    showToast(`Pre-filled ${demoRole.toUpperCase()} credentials`, 'info');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
            <CalendarCheck2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to Schedulo</h2>
          <p className="text-xs text-slate-400">Access your appointment management workspace</p>
        </div>

        {/* Form */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@schedulo.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Sign In Helpers */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              QUICK DEMO ACCESS
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('user.alice@schedulo.com', 'user')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-center transition-colors text-xs font-semibold text-slate-300 hover:text-white"
              >
                <UserCheck className="w-4 h-4 mx-auto mb-1 text-brand-400" />
                User
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('staff.vance@schedulo.com', 'staff')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-center transition-colors text-xs font-semibold text-slate-300 hover:text-white"
              >
                <Briefcase className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                Staff
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@schedulo.com', 'admin')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-center transition-colors text-xs font-semibold text-slate-300 hover:text-white"
              >
                <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:underline font-semibold">
            Register Client Account
          </Link>
        </p>
      </div>
    </div>
  );
};
