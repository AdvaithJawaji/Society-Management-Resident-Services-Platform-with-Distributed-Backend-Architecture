import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { CreditCard, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { SkeletonRow, EmptyState } from './Skeleton';

const statusConfig = {
  PAID:    { label: 'Paid',    cls: 'chip-paid',    icon: '✓' },
  UNPAID:  { label: 'Unpaid',  cls: 'chip-unpaid',  icon: '⏳' },
  OVERDUE: { label: 'Overdue', cls: 'chip-overdue', icon: '⚠' },
};

const BillingList = ({ darkMode }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ paid: 0, unpaid: 0, overdue: 0, total: 0 });
  const { addToast } = useToast();

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/billing');
      setBills(res.data);
      const paid = res.data.filter(b => b.status === 'PAID').reduce((s, b) => s + parseFloat(b.amount || 0), 0);
      const unpaid = res.data.filter(b => b.status === 'UNPAID').reduce((s, b) => s + parseFloat(b.amount || 0), 0);
      const overdue = res.data.filter(b => b.status === 'OVERDUE').reduce((s, b) => s + parseFloat(b.amount || 0), 0);
      setStats({ paid, unpaid, overdue, total: res.data.length });
    } catch {
      addToast('Failed to fetch billing data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await axios.put(`/api/billing/${id}/pay`);
      addToast('Payment marked as paid successfully!', 'success');
      fetchBills();
    } catch {
      addToast('Payment update failed.', 'error');
    }
  };

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const th   = darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-slate-50 text-gray-500';
  const td   = darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-100';

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bills', value: stats.total, icon: <CreditCard className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50', clr: 'text-indigo-600' },
          { label: 'Collected', value: `₹${stats.paid.toLocaleString()}`, icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50', clr: 'text-emerald-600' },
          { label: 'Pending Dues', value: `₹${stats.unpaid.toLocaleString()}`, icon: <Clock className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50', clr: 'text-amber-600' },
          { label: 'Overdue', value: `₹${stats.overdue.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-red-500" />, bg: 'bg-red-50', clr: 'text-red-600' },
        ].map((s, i) => (
          <div key={i} className={`card-hover rounded-2xl p-5 border shadow-sm ${card}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700' : s.bg}`}>
              {s.icon}
            </div>
            <p className={`text-xs font-medium uppercase tracking-wide ${sub}`}>{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : s.clr}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Bills Table */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
          <div>
            <h3 className={`text-base font-semibold ${text}`}>Maintenance Bills</h3>
            <p className={`text-xs mt-0.5 ${sub}`}>{bills.length} total records</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={th}>
                {['Flat', 'Purpose', 'Month', 'Amount', 'Due Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={6} dark={darkMode} />)
              ) : bills.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon="💳" title="No bills found" subtitle="Billing records will appear here" dark={darkMode} /></td></tr>
              ) : (
                bills.slice(0, 25).map(b => {
                  const s = statusConfig[b.status] || statusConfig.UNPAID;
                  const isUnpaid = b.status === 'UNPAID' || b.status === 'OVERDUE';
                  return (
                    <tr key={b.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/40' : 'hover:bg-slate-50'}`}>
                      <td className={`px-6 py-4 text-sm font-semibold ${td}`}>{b.flat_number || '—'}</td>
                      <td className={`px-6 py-4 text-sm ${td}`}><span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>{b.purpose || 'Maintenance Charge'}</span></td>
                      <td className={`px-6 py-4 text-sm ${td}`}>{new Date(b.billing_month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-emerald-400' : 'text-gray-800'}`}>₹{parseFloat(b.amount).toLocaleString()}</td>
                      <td className={`px-6 py-4 text-sm ${td}`}>{new Date(b.due_date).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
                          {s.icon} {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isUnpaid && (
                          <button onClick={() => handlePay(b.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingList;
