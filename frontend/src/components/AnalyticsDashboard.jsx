import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { SkeletonStat } from './Skeleton';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsDashboard = ({ darkMode }) => {
  const [finance, setFinance] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [fR, iR] = await Promise.all([
          axios.get('/api/analytics/finance'),
          axios.get('/api/analytics/insights'),
        ]);
        setFinance(fR.data);
        setInsights(iR.data);
      } catch { addToast('Could not load analytics.', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';

  // Mock monthly revenue trend
  const trendData = [
    { month: 'Apr', revenue: 85000, dues: 15000 },
    { month: 'May', revenue: 92000, dues: 8000 },
    { month: 'Jun', revenue: 78000, dues: 22000 },
    { month: 'Jul', revenue: 95000, dues: 5000 },
    { month: 'Aug', revenue: 88000, dues: 12000 },
    { month: 'Sep', revenue: finance ? Number(finance.revenue) : 90000, dues: finance ? Number(finance.pending_dues) : 10000 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} dark={darkMode} />)
        ) : finance ? [
          { label: 'Total Collected',   value: `₹${Number(finance.revenue).toLocaleString()}`,       change: '+12%', up: true },
          { label: 'Pending Dues',      value: `₹${Number(finance.pending_dues).toLocaleString()}`,  change: '-5%',  up: false },
          { label: 'Collection Rate',   value: `${finance.collection_rate}%`,                        change: '+3%',  up: true },
          { label: 'Active Complaints', value: insights?.by_status?.OPEN || 0,                       change: '-2',   up: false },
        ].map((s, i) => (
          <div key={i} className={`card-hover rounded-2xl p-5 border shadow-sm ${card}`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${sub}`}>{s.label}</p>
            <p className={`text-2xl font-extrabold mt-2 ${text}`}>{s.value}</p>
            <p className={`text-xs font-semibold mt-1 ${s.up ? 'text-emerald-500' : 'text-red-500'}`}>{s.change} from last month</p>
          </div>
        )) : null}
      </div>

      {/* Revenue Trend Area Chart */}
      <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
        <h3 className={`text-base font-semibold mb-4 ${text}`}>Revenue vs Pending Dues — Last 6 Months</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f1f5f9'} />
              <XAxis dataKey="month" stroke={darkMode ? '#6b7280' : '#94a3b8'} tick={{ fontSize: 12 }} />
              <YAxis stroke={darkMode ? '#6b7280' : '#94a3b8'} tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, '']} contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revenue)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="dues" stroke="#ef4444" fill="url(#dues)" strokeWidth={2} name="Pending Dues" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complaint Charts */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
            <h3 className={`text-base font-semibold mb-4 ${text}`}>Complaints by Category</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={insights.by_category} cx="50%" cy="50%" outerRadius={75} innerRadius={35} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {insights.by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
            <h3 className={`text-base font-semibold mb-4 ${text}`}>Complaints by Status</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(insights.by_status || {}).map(([k, v]) => ({ name: k, count: v }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f1f5f9'} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={darkMode ? '#6b7280' : '#94a3b8'} />
                  <YAxis tick={{ fontSize: 11 }} stroke={darkMode ? '#6b7280' : '#94a3b8'} />
                  <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
