import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GREET = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
  return { text: 'Good Evening', emoji: '🌙' };
};

const formatDate = () => new Date().toLocaleDateString('en-IN', {
  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
});

// Animated floating blob
const Blob = ({ style }) => (
  <div style={{
    position: 'absolute', borderRadius: '50%', filter: 'blur(60px)',
    opacity: 0.18, animation: 'heroBlobFloat 7s ease-in-out infinite alternate',
    ...style
  }} />
);

const HeroBanner = ({ user, darkMode }) => {
  const [time, setTime] = useState(new Date());
  const [adminStats, setAdminStats] = useState({ residents: 0, openComplaints: 0, todayVisitors: 0 });
  const role = user?.role || user?.role_name || 'RESIDENT';
  const greet = GREET();
  const name = user?.username || 'Resident';
  const displayName = name.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch admin stats
  useEffect(() => {
    if (role !== 'ADMIN') return;
    const fetch = async () => {
      try {
        const [cRes, vRes] = await Promise.all([
          axios.get('/api/complaints'),
          axios.get('/api/visitors'),
        ]);
        const open = (cRes.data || []).filter(c => c.status === 'OPEN').length;
        const today = new Date().toDateString();
        const todayV = (vRes.data || []).filter(v => new Date(v.created_at || v.entry_time).toDateString() === today).length;
        setAdminStats({ openComplaints: open, todayVisitors: todayV, residents: 120 });
      } catch { /* silent */ }
    };
    fetch();
  }, [role]);

  const clockStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const residentStats = [
    { icon: '🏠', label: 'My Flat', value: user?.flat_number || 'A-204' },
    { icon: '📅', label: 'Today', value: time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
    { icon: '✅', label: 'Status', value: 'All Clear' },
    { icon: '⏰', label: 'Time', value: clockStr },
  ];

  const adminStatsArr = [
    { icon: '👥', label: 'Residents', value: adminStats.residents },
    { icon: '📋', label: 'Open Issues', value: adminStats.openComplaints },
    { icon: '🚪', label: "Today's Visitors", value: adminStats.todayVisitors },
    { icon: '⏰', label: 'Time', value: clockStr },
  ];

  const stats = role === 'ADMIN' ? adminStatsArr : residentStats;

  return (
    <>
      <style>{`
        @keyframes heroBlobFloat {
          0%   { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-24px) scale(1.08); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .hero-banner { animation: heroFadeUp 0.6s ease-out both; }
        .hero-stat { animation: heroFadeUp 0.5s ease-out both; }
        .hero-stat:nth-child(1) { animation-delay: 0.1s; }
        .hero-stat:nth-child(2) { animation-delay: 0.2s; }
        .hero-stat:nth-child(3) { animation-delay: 0.3s; }
        .hero-stat:nth-child(4) { animation-delay: 0.4s; }
        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #c7d2fe 40%, #fff 60%, #a5b4fc 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: heroShimmer 4s linear infinite;
        }
      `}</style>

      <div className="hero-banner relative overflow-hidden rounded-3xl mb-6 select-none"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #7c3aed 75%, #4f46e5 100%)',
          minHeight: 180,
        }}>

        {/* Animated background blobs */}
        <Blob style={{ width: 260, height: 260, background: '#818cf8', top: -80, right: -60 }} />
        <Blob style={{ width: 180, height: 180, background: '#a78bfa', bottom: -60, left: 40, animationDelay: '2s' }} />
        <Blob style={{ width: 120, height: 120, background: '#38bdf8', top: 20, left: '40%', animationDelay: '4s' }} />

        {/* Wave at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
            <path d="M0 48C240 16 480 0 720 0C960 0 1200 16 1440 48V48H0V48Z" fill="rgba(255,255,255,0.06)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pt-6 pb-5">
          {/* Top row: greeting + role badge */}
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{greet.emoji}</span>
                <h2 className="shimmer-text text-2xl md:text-3xl font-extrabold tracking-tight">
                  {greet.text}, {displayName}!
                </h2>
              </div>
              <p style={{ color: 'rgba(199,210,254,0.85)' }} className="text-sm font-medium">
                {formatDate()}
              </p>
              <p style={{ color: 'rgba(167,139,250,0.75)' }} className="text-xs mt-0.5 italic">
                Your community. One platform. 🏡
              </p>
            </div>
            {/* Role pill */}
            <span className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#e0e7ff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {role === 'ADMIN' ? '🛡️ Admin' : '🏠 Resident'}
            </span>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="hero-stat rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{s.icon}</span>
                  <span style={{ color: 'rgba(199,210,254,0.7)' }} className="text-xs font-semibold uppercase tracking-wide">{s.label}</span>
                </div>
                <p className="text-white font-bold text-base truncate">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroBanner;
