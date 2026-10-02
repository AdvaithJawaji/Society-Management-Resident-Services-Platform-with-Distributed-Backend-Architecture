import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Shield, UserCheck, UserX, RefreshCw, Plus, X, Search } from 'lucide-react';
import { SkeletonRow, EmptyState } from './Skeleton';

const VSTATUS = {
  EXPECTED:    { label: 'Expected',   cls: 'chip-open',        icon: '🕐', next: 'CHECKED_IN',  nextLabel: 'Check In' },
  CHECKED_IN:  { label: 'Inside',     cls: 'chip-in_progress', icon: '✅', next: 'CHECKED_OUT', nextLabel: 'Check Out' },
  CHECKED_OUT: { label: 'Exited',     cls: 'chip-resolved',    icon: '🚪', next: null,          nextLabel: null },
  CANCELLED:   { label: 'Cancelled',  cls: 'chip-overdue',     icon: '❌', next: null,          nextLabel: null },
};

const isValidDateTimeLocal = (value) => !value || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);

const AddVisitorModal = ({ flats, onClose, onAdded, darkMode }) => {
  const [form, setForm] = useState({ name: '', phone: '', flat_id: '', purpose: '', expected_time: '' });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const bg = darkMode ? 'bg-gray-900' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inp = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = String(form.name || '').trim();
    const phone = String(form.phone || '').trim();
    const purpose = String(form.purpose || '').trim();
    const flat_id = String(form.flat_id || '').trim();
    const expected_time = form.expected_time || '';

    if (!name || !phone || !flat_id || !purpose) {
      addToast('Please fill all required fields.', 'warning'); return;
    }

    if (!isValidDateTimeLocal(expected_time)) {
      addToast('Please choose a valid date/time or leave it empty.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        phone,
        flat_id,
        purpose,
        expected_time: expected_time ? expected_time.replace('T', ' ') : ''
      };

      await axios.post('/api/visitors/register', payload);
      addToast(`✅ Visitor "${name}" registered! QR pass generated.`, 'success');
      onAdded();
      onClose();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to register visitor.', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-3xl shadow-2xl max-w-md w-full p-7 ${bg}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl font-bold ${text}`}>Register New Visitor</h2>
            <p className={`text-xs mt-0.5 ${sub}`}>A QR pass will be auto-generated</p>
          </div>
          <button onClick={onClose} className={`${sub} hover:text-red-500`}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {[
            { label: 'Visitor Name *', key: 'name', placeholder: 'e.g. Rahul Sharma', type: 'text' },
            { label: 'Phone Number *', key: 'phone', placeholder: 'e.g. 9876543210', type: 'tel' },
            { label: 'Purpose *', key: 'purpose', placeholder: 'e.g. Guest visit, Delivery, Repair', type: 'text' },
            { label: 'Expected Time', key: 'expected_time', placeholder: 'yyyy-mm-ddThh:mm', type: 'datetime-local' },
          ].map(f => (
            <div key={f.key}>
              <label className={`text-xs font-semibold uppercase tracking-wide block mb-1 ${sub}`}>{f.label}</label>
              <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none ${inp}`} />
            </div>
          ))}
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wide block mb-1 ${sub}`}>Flat Number *</label>
            <select value={form.flat_id} onChange={e => setForm(p => ({ ...p, flat_id: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none ${inp}`}>
              <option value="">Select flat...</option>
              {flats.map(f => <option key={f.id} value={f.id}>{f.flat_number} — Block {f.block}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold disabled:opacity-60 hover:shadow-lg transition-all">
              {saving ? 'Registering...' : 'Register & Generate Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SecurityDashboard = ({ darkMode }) => {
  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/visitors');
      setVisitors(res.data || []);
    } catch { addToast('Could not load visitor data.', 'error'); }
    finally { setLoading(false); }
  }, []);

  const fetchFlats = async () => {
    try {
      // Get flats from billing endpoint or directly
      const res = await axios.get('/api/billing');
      const uniqueFlats = [];
      const seen = new Set();
      (res.data || []).forEach(b => {
        if (b.flat_id && !seen.has(b.flat_id)) {
          seen.add(b.flat_id);
          uniqueFlats.push({ id: b.flat_id, flat_number: b.flat_number, block: b.flat_number?.[0] || 'A' });
        }
      });
      setFlats(uniqueFlats);
    } catch {}
  };

  useEffect(() => { fetchVisitors(); fetchFlats(); }, [fetchVisitors]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchVisitors, 15000);
    return () => clearInterval(interval);
  }, [fetchVisitors]);

  const handleStatusUpdate = async (visitor, newStatus) => {
    setUpdatingId(visitor.id);
    try {
      await axios.patch(`/api/visitors/${visitor.id}/status`, { status: newStatus });
      const labels = { CHECKED_IN: '✅ Checked in', CHECKED_OUT: '🚪 Checked out', CANCELLED: '❌ Cancelled' };
      addToast(`${labels[newStatus] || 'Updated'}: ${visitor.name}`, 'success');
      // Immediately update local state for instant UI feedback
      setVisitors(prev => prev.map(v => {
        if (v.id !== visitor.id) return v;
        const now = new Date().toISOString();
        return {
          ...v,
          status: newStatus,
          entry_time: newStatus === 'CHECKED_IN' ? now : v.entry_time,
          exit_time: newStatus === 'CHECKED_OUT' ? now : v.exit_time,
        };
      }));
    } catch (e) {
      addToast(e.response?.data?.message || 'Update failed.', 'error');
    } finally { setUpdatingId(null); }
  };

  const card  = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text  = darkMode ? 'text-white' : 'text-gray-900';
  const sub   = darkMode ? 'text-gray-400' : 'text-gray-500';
  const th    = darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-slate-50 text-gray-500';

  const inside   = visitors.filter(v => v.status === 'CHECKED_IN').length;
  const expected = visitors.filter(v => v.status === 'EXPECTED').length;
  const todayAll = visitors.filter(v => {
    // Determine the relevant date based on status
    let d = v.created_at;
    if (v.status === 'CHECKED_IN' && v.entry_time) d = v.entry_time;
    if (v.status === 'CHECKED_OUT' && v.exit_time) d = v.exit_time;
    return d && new Date(d).toDateString() === new Date().toDateString();
  });
  const todayIn  = todayAll.filter(v => v.status === 'CHECKED_IN' || v.status === 'CHECKED_OUT').length;
  const todayOut = todayAll.filter(v => v.status === 'CHECKED_OUT').length;

  const filtered = visitors.filter(v =>
    !search ||
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.flat_number?.toLowerCase().includes(search.toLowerCase()) ||
    v.purpose?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search)
  );

  return (
    <>
      {showAdd && <AddVisitorModal flats={flats} darkMode={darkMode} onAdded={fetchVisitors} onClose={() => setShowAdd(false)} />}

      <div className="space-y-6">
        {/* Security Control Header */}
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #0f0e17 0%, #1e1b4b 50%, #312e81 100%)' }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Security Control Center</h2>
                  <p className="text-indigo-300 text-sm">Gate management — Live tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-xs font-semibold">LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Currently Inside', value: inside,   icon: '👥', color: 'text-emerald-300 text-3xl font-extrabold' },
                { label: 'Expected',          value: expected, icon: '🕐', color: 'text-yellow-300 text-3xl font-extrabold' },
                { label: "Today's Entries",   value: todayIn,  icon: '⬆️', color: 'text-blue-300 text-3xl font-extrabold' },
                { label: "Today's Exits",     value: todayOut, icon: '⬇️', color: 'text-red-300 text-3xl font-extrabold' },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className={s.color}>{loading ? '—' : s.value}</p>
                  <p className="text-indigo-200/80 text-xs mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg hover:shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-100">
            <Plus className="w-5 h-5" /> Add / Register Visitor
          </button>
          <button onClick={fetchVisitors}
            className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm border transition-all hover:scale-[1.02] active:scale-100 ${darkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'}`}>
            <RefreshCw className="w-4 h-4" /> Refresh Live Data
          </button>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${card}`}>
            <Search className={`w-4 h-4 ${sub} shrink-0`} />
            <input type="text" placeholder="Search name, flat, purpose..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={`flex-1 bg-transparent focus:outline-none text-sm ${text} placeholder-gray-400`} />
          </div>
        </div>

        {/* Live Visitor Table */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
          <div className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div>
              <h3 className={`text-base font-bold ${text}`}>Live Visitor Log</h3>
              <p className={`text-xs ${sub}`}>{filtered.length} records · Auto-refresh every 15s</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-xs font-semibold text-emerald-600`}>Live</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className={th}>
                  {['Visitor', 'Phone', 'Flat', 'Purpose', 'Entry', 'Exit', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {loading ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={8} dark={darkMode} />) :
                 filtered.length === 0 ? <tr><td colSpan={8}><EmptyState icon="🚪" title="No visitors found" subtitle="Register a visitor using the button above" dark={darkMode} /></td></tr> :
                 filtered.slice(0, 40).map(v => {
                  const s = VSTATUS[v.status] || VSTATUS.EXPECTED;
                  const isUpdating = updatingId === v.id;
                  const rowBg = v.status === 'CHECKED_IN'
                    ? (darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50')
                    : v.status === 'EXPECTED'
                    ? (darkMode ? 'bg-yellow-900/10' : 'bg-yellow-50/50')
                    : '';

                  return (
                    <tr key={v.id} className={`transition-all ${rowBg} ${darkMode ? 'hover:bg-gray-700/40' : 'hover:bg-slate-50'}`}>
                      <td className={`px-5 py-3.5 text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {v.name?.charAt(0)?.toUpperCase()}
                          </div>
                          {v.name}
                        </div>
                      </td>
                      <td className={`px-5 py-3.5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{v.phone}</td>
                      <td className={`px-5 py-3.5 text-sm font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{v.flat_number || '—'}</td>
                      <td className={`px-5 py-3.5 text-sm max-w-xs truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{v.purpose}</td>
                      <td className={`px-5 py-3.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {v.entry_time ? new Date(v.entry_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className={`px-5 py-3.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {v.exit_time ? new Date(v.exit_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.cls}`}>
                          {s.icon} {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {s.next && (
                          <button
                            onClick={() => handleStatusUpdate(v, s.next)}
                            disabled={isUpdating}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                              s.next === 'CHECKED_IN'
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}>
                            {isUpdating ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : s.next === 'CHECKED_IN' ? (
                              <UserCheck className="w-3 h-3" />
                            ) : (
                              <UserX className="w-3 h-3" />
                            )}
                            {isUpdating ? 'Saving...' : s.nextLabel}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityDashboard;
