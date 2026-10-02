import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const FinancialDashboard = ({ darkMode }) => {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/analytics/finance');
        setFinance(res.data);
      } catch { addToast('Could not load financial data.', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [addToast]);

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const revenue = Number(finance?.revenue) || 0;
  const pendingDues = Number(finance?.pending_dues) || 0;
  const totalBilled = revenue + pendingDues;
  const rate = Math.min(100, Math.max(0, Number(finance?.collection_rate) || 0));
  const hasFinance = !loading && finance !== null;
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
  const stats = [
    { label: 'Expected Collection', value: totalBilled, color: 'text-indigo-200', bg: 'bg-white/10' },
    { label: 'Collected', value: revenue, color: 'text-emerald-300', bg: 'bg-emerald-500/20' },
    { label: 'Outstanding', value: pendingDues, color: 'text-red-300', bg: 'bg-red-500/20' },
  ];
  const breakdown = [
    { label: 'Collected', value: revenue, color: 'bg-emerald-500' },
    { label: 'Outstanding', value: pendingDues, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Live billing summary */}
      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 60%, #7c3aed 100%)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Society Financial Dashboard</p>
              <h2 className="text-white text-2xl font-extrabold mt-1">Current billing summary</h2>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Collection Rate</p>
              <p className="text-4xl font-extrabold text-white">{hasFinance ? `${rate.toFixed(2)}%` : '—'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`rounded-xl p-4 ${stat.bg}`}>
                <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
                <p className={`text-2xl font-extrabold mt-1 ${stat.color}`}>{hasFinance ? formatCurrency(stat.value) : '—'}</p>
              </div>
            ))}
          </div>
          {/* Collection Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
              <span>Collection Progress</span>
              <span>{hasFinance ? `${rate.toFixed(2)}% collected` : 'Waiting for financial data'}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000"
                style={{ width: `${hasFinance ? rate : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Live collection breakdown */}
      <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
        <h3 className={`text-base font-semibold mb-5 ${text}`}>Collection breakdown</h3>
        <div className="space-y-5">
          {breakdown.map((item) => {
            const share = totalBilled > 0 ? (item.value / totalBilled) * 100 : 0;
            return (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className={`text-sm font-medium ${text}`}>{item.label}</span>
                  <span className={`text-sm font-semibold ${sub}`}>{hasFinance ? formatCurrency(item.value) : '—'}</span>
                </div>
                <div className={`h-2.5 w-full overflow-hidden rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${hasFinance ? share : 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
