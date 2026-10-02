import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { AlertCircle, Flame, Filter, Plus, X, Send, ChevronDown } from 'lucide-react';
import { SkeletonRow, EmptyState } from './Skeleton';

const PRIORITY = {
  CRITICAL: { label: '🔴 URGENT',  cls: 'chip-urgent',  dot: 'bg-red-500 pulse-dot', order: 1 },
  HIGH:     { label: '🟠 HIGH',    cls: 'chip-high',    dot: 'bg-orange-400', order: 2 },
  MEDIUM:   { label: '🟡 MEDIUM',  cls: 'chip-medium',  dot: 'bg-yellow-400', order: 3 },
  LOW:      { label: '🟢 LOW',     cls: 'chip-low',     dot: 'bg-green-400',  order: 4 },
};

const STATUS = {
  OPEN:        { label: 'Open',        cls: 'chip-open' },
  IN_PROGRESS: { label: 'In Progress', cls: 'chip-in_progress' },
  RESOLVED:    { label: 'Resolved',    cls: 'chip-resolved' },
  REJECTED:    { label: 'Rejected',    cls: 'chip-overdue' },
};

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Lift/Elevator', 'Cleaning', 'Parking',
  'Noise', 'Security', 'Internet/WiFi', 'Common Area', 'Water Supply',
  'Gas', 'Pest Control', 'Gardening', 'Structural', 'Other',
];

const PRIORITY_OPTIONS = [
  { value: 'LOW',      label: '🟢 Low',    color: 'bg-green-100 text-green-800 border-green-300',   active: 'bg-green-500 text-white border-green-500'   },
  { value: 'MEDIUM',   label: '🟡 Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', active: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 'HIGH',     label: '🟠 High',   color: 'bg-orange-100 text-orange-800 border-orange-300', active: 'bg-orange-500 text-white border-orange-500' },
  { value: 'CRITICAL', label: '🔴 Urgent', color: 'bg-red-100 text-red-800 border-red-300',         active: 'bg-red-500 text-white border-red-500'       },
];

// ─── File Complaint Modal ───────────────────────────────────────────────────
const FileComplaintModal = ({ darkMode, onClose, onSuccess }) => {
  const [form, setForm] = useState({ title: '', category: '', description: '', priority: 'LOW' });
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();
  const { pushNotification } = useNotifications();

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category || !form.description.trim()) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/complaints', {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        priority: form.priority,
      });
      const complaintId = res.data?.complaint_id || '—';

      // Notify the resident immediately via WebSocket
      if (user?.id) {
        await pushNotification(
          user.id,
          'COMPLAINT',
          `✅ Complaint #${complaintId} registered! "${form.title}" — We'll look into it shortly. Track status in your Complaints tab.`
        ).catch(() => {});
        // Also notify admin (user_id = 1)
        await pushNotification(
          1,
          'COMPLAINT',
          `📋 New complaint from ${user.username}: "${form.title}" [${form.priority}] — ${form.category}`
        ).catch(() => {});
      }

      addToast(`🎉 Complaint #${complaintId} submitted successfully!`, 'success');
      onSuccess();
      onClose();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to submit complaint.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const overlay = 'fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6';
  const backdrop = 'absolute inset-0 bg-black/60 backdrop-blur-sm';
  const modal = `relative z-10 w-full md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`;

  return (
    <div className={overlay}>
      <div className={backdrop} onClick={onClose} />
      <div className={modal}>
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg,#1e1b4b,#4f46e5)' }}>
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span>📋</span> File a Complaint
            </h2>
            <p className="text-indigo-200 text-xs mt-0.5">We'll address your issue promptly</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className={`px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto ${darkMode ? 'text-white' : 'text-gray-900'}`}>

          {/* Title */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Complaint Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Water leakage in bathroom"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Category */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Priority Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITY_OPTIONS.map(p => (
                <button key={p.value} type="button"
                  onClick={() => update('priority', p.value)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 ${
                    form.priority === p.value ? p.active : p.color
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe the issue in detail. Include location, time, and any relevant details..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className={`px-6 py-4 flex gap-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <button onClick={onClose}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
            style={{ background: submitting ? '#6366f1' : 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Complaint</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Status Updater ───────────────────────────────────────────────────
const StatusDropdown = ({ complaintId, currentStatus, residentUserId, complaintTitle, darkMode, onUpdated }) => {
  const [updating, setUpdating] = useState(false);
  const { pushNotification } = useNotifications();
  const { addToast } = useToast();

  const handleChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setUpdating(true);
    try {
      await axios.patch(`/api/complaints/${complaintId}`, { status: newStatus });
      if (newStatus === 'RESOLVED' && residentUserId) {
        await pushNotification(residentUserId, 'COMPLAINT_UPDATED',
          `🎉 Your complaint "${complaintTitle}" has been resolved! Please rate the resolution.`
        ).catch(() => {});
      } else if (newStatus === 'IN_PROGRESS' && residentUserId) {
        await pushNotification(residentUserId, 'COMPLAINT_UPDATED',
          `🔧 Your complaint "${complaintTitle}" is now being worked on!`
        ).catch(() => {});
      }
      addToast(`Status updated to ${newStatus}`, 'success');
      onUpdated();
    } catch {
      addToast('Failed to update status', 'error');
    } finally { setUpdating(false); }
  };

  return (
    <select
      value={currentStatus}
      onChange={e => handleChange(e.target.value)}
      disabled={updating}
      className={`text-xs px-2 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
        darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
      }`}>
      <option value="OPEN">Open</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="RESOLVED">Resolved</option>
      <option value="REJECTED">Rejected</option>
    </select>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const ComplaintList = ({ darkMode }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();
  const role = user?.role || user?.role_name || 'RESIDENT';

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/complaints');
      const sorted = (res.data || []).sort((a, b) =>
        (PRIORITY[a.priority]?.order || 5) - (PRIORITY[b.priority]?.order || 5)
      );
      setComplaints(sorted);
    } catch {
      addToast('Failed to load complaints.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const th   = darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-slate-50 text-gray-500';

  const filters = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  let filtered = filter === 'ALL' ? complaints : complaints.filter(c => c.priority === filter);
  if (statusFilter !== 'ALL') filtered = filtered.filter(c => c.status === statusFilter);

  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  complaints.forEach(c => { if (counts[c.priority] !== undefined) counts[c.priority]++; });

  const resolvdCount = complaints.filter(c => c.status === 'RESOLVED').length;
  const openCount    = complaints.filter(c => c.status === 'OPEN').length;

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-xl font-extrabold ${text}`}>Complaints</h2>
          <p className={`text-sm ${sub}`}>
            {openCount} open · {resolvdCount} resolved · {complaints.length} total
          </p>
        </div>
        {role === 'RESIDENT' && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Plus className="w-4 h-4" /> File Complaint
          </button>
        )}
      </div>

      {/* Priority Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(PRIORITY).map(([key, val]) => (
          <button key={key} onClick={() => setFilter(key === filter ? 'ALL' : key)}
            className={`card-hover rounded-2xl p-4 border shadow-sm text-left transition-all ${card} ${filter === key ? 'ring-2 ring-indigo-500 shadow-indigo-100' : ''}`}>
            <div className={`w-3 h-3 rounded-full mb-3 ${val.dot}`} />
            <p className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>{key}</p>
            <p className={`text-3xl font-bold mt-1 ${text}`}>{counts[key]}</p>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filter === f
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'ALL' ? `All (${complaints.length})` : `${f} (${counts[f]})`}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          {['ALL','OPEN','IN_PROGRESS','RESOLVED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                statusFilter === s
                  ? 'bg-violet-600 text-white border-violet-600'
                  : darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              {s === 'ALL' ? 'All Status' : STATUS[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className={`text-base font-semibold ${text}`}>
              {role === 'ADMIN' ? 'All Society Complaints' : 'My Complaints'}
            </h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
            {filtered.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={th}>
                {['Priority', 'Title', 'Category', 'Flat', 'Status', ...(role === 'ADMIN' ? ['Update'] : []), 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={role === 'ADMIN' ? 7 : 6} dark={darkMode} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={role === 'ADMIN' ? 7 : 6}>
                  <EmptyState
                    icon="📋"
                    title={role === 'RESIDENT' ? 'No complaints yet!' : 'No complaints found'}
                    subtitle={role === 'RESIDENT' ? 'Tap "File Complaint" to report an issue' : 'All quiet — no issues reported'}
                    dark={darkMode}
                  />
                </td></tr>
              ) : (
                filtered.slice(0, 40).map(c => {
                  const p = PRIORITY[c.priority] || PRIORITY.LOW;
                  const s = STATUS[c.status] || STATUS.OPEN;
                  return (
                    <tr key={c.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/40' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${p.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                          {p.label}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-sm font-medium max-w-[200px] ${text}`}>
                        <div className="truncate">{c.title}</div>
                        {c.sla_breached && <span className="text-xs text-red-500 font-semibold">⚠ SLA Breached</span>}
                      </td>
                      <td className={`px-5 py-3.5 text-xs font-medium ${sub}`}>{c.category}</td>
                      <td className={`px-5 py-3.5 text-sm font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                        {c.flat_number || c.flat_id}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
                      </td>
                      {role === 'ADMIN' && (
                        <td className="px-5 py-3.5">
                          <StatusDropdown
                            complaintId={c.id}
                            currentStatus={c.status}
                            residentUserId={c.resident_user_id}
                            complaintTitle={c.title}
                            darkMode={darkMode}
                            onUpdated={fetchComplaints}
                          />
                        </td>
                      )}
                      <td className={`px-5 py-3.5 text-xs ${sub}`}>
                        {new Date(c.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Complaint Modal */}
      {showModal && (
        <FileComplaintModal
          darkMode={darkMode}
          onClose={() => setShowModal(false)}
          onSuccess={fetchComplaints}
        />
      )}
    </div>
  );
};

export default ComplaintList;
