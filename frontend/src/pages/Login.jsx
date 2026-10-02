import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Building2, Wifi, Shield, BarChart3 } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(credentials.username, credentials.password);
      addToast('Welcome back! Login successful.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const status = error.response?.status;
      const message = status === 401
        ? 'Invalid username or password. Please try again.'
        : !status
          ? 'Cannot reach the API. Check that the backend is running and your phone is on the same Wi-Fi as this computer.'
          : status >= 500
            ? 'The sign-in service is unavailable. Check the backend and database, then try again.'
            : error.response?.data?.detail || error.response?.data?.message || 'Sign-in failed. Please try again.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Shield className="w-5 h-5" />, label: 'Secure Gateway' },
    { icon: <Wifi className="w-5 h-5" />, label: 'Real-time Alerts' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Live Analytics' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e40af 100%)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #34d399, transparent)' }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #818cf8, #4f46e5)' }}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-wide">RESIDENT360</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Your community.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #a5b4fc, #34d399)' }}>
              One platform.
            </span>
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-10">
            Manage maintenance, visitors, facilities, complaints, and financials — all in one elegant dashboard designed for modern residential societies.
          </p>

          <div className="flex gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-indigo-200">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300">
                  {f.icon}
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          {[28, 25, 6, 8, 4].map((n, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-white">{n}{i === 0 ? '+' : i === 1 ? '+' : i === 2 ? '' : ''}</div>
              <div className="text-indigo-300 text-xs mt-1">{['Residents','Flats','Services','Events','Alerts'][i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #818cf8, #4f46e5)' }}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">RESIDENT360</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-indigo-200 text-sm mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1.5">Username</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="e.g. admin1"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent pr-12 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-indigo-300 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: loading ? '#6366f1' : 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-indigo-300 text-center mb-3 font-medium">DEMO CREDENTIALS</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setCredentials({ username: 'admin1', password: 'password123' })}
                  className="text-xs py-2 px-3 rounded-lg bg-white/10 text-indigo-200 hover:bg-white/20 transition-all font-medium">
                  👤 Admin Login
                </button>
                <button onClick={() => setCredentials({ username: 'resident_a101', password: 'password123' })}
                  className="text-xs py-2 px-3 rounded-lg bg-white/10 text-indigo-200 hover:bg-white/20 transition-all font-medium">
                  🏠 Resident Login
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-indigo-300/60 text-xs mt-6">
            RESIDENT360 © 2026 · Secure · Distributed Architecture
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
