import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { QrCode, Users, X } from 'lucide-react';
import { SkeletonRow, EmptyState } from './Skeleton';
import { QRCodeSVG } from 'qrcode.react';

const VSTATUS = {
  EXPECTED:    { label: 'Expected',    cls: 'chip-open' },
  CHECKED_IN:  { label: 'Checked In',  cls: 'chip-in_progress' },
  CHECKED_OUT: { label: 'Checked Out', cls: 'chip-resolved' },
  CANCELLED:   { label: 'Cancelled',   cls: 'chip-overdue' },
};

const QRPassModal = ({ visitor, onClose }) => {
  if (!visitor) return null;
  const passData = JSON.stringify({
    id: visitor.id,
    name: visitor.name,
    flat: visitor.flat_number,
    token: visitor.pass_token,
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 qr-pass" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-indigo-800 text-sm">SOCIETY360</span>
            </div>
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">Visitor Pass</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 no-print"><X className="w-5 h-5" /></button>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-5 mb-5">
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Visitor</p>
              <p className="font-bold text-gray-800">{visitor.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Flat</p>
              <p className="font-bold text-gray-800">{visitor.flat_number || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Date</p>
              <p className="font-semibold text-gray-700">{visitor.entry_time ? new Date(visitor.entry_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Purpose</p>
              <p className="font-semibold text-gray-700 truncate">{visitor.purpose}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center bg-slate-50 rounded-2xl p-5 border border-dashed border-indigo-200">
          {visitor.pass_token ? (
            <QRCodeSVG value={passData} size={160} level="H" includeMargin fgColor="#1e1b4b" />
          ) : (
            <div className="w-40 h-40 bg-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-xs text-gray-400">No Token</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3 font-mono truncate max-w-full px-2">
            {visitor.pass_token ? visitor.pass_token.substring(0, 20) + '...' : 'No Token Generated'}
          </p>
        </div>

        <div className="flex gap-3 mt-6 no-print">
          <button onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Print Pass
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const VisitorList = ({ darkMode }) => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const { addToast } = useToast();

  useEffect(() => { fetchVisitors(); }, []);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/visitors');
      setVisitors(res.data || []);
    } catch {
      addToast('Failed to fetch visitor data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const th   = darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-slate-50 text-gray-500';
  const td   = darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-100';

  const active = visitors.filter(v => v.status === 'CHECKED_IN').length;

  return (
    <>
      {selectedVisitor && <QRPassModal visitor={selectedVisitor} onClose={() => setSelectedVisitor(null)} />}

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Visitors', value: visitors.length, icon: '👥' },
            { label: 'Currently Inside', value: active, icon: '✅' },
            { label: 'Today\'s Passes', value: visitors.filter(v => {
                const d = v.entry_time ? new Date(v.entry_time) : null;
                return d && d.toDateString() === new Date().toDateString();
              }).length, icon: '🎫' },
          ].map((s, i) => (
            <div key={i} className={`card-hover rounded-2xl p-5 border shadow-sm ${card}`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className={`text-xs font-medium uppercase tracking-wide ${sub}`}>{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${text}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center gap-2`}>
            <Users className="w-4 h-4 text-indigo-500" />
            <h3 className={`text-base font-semibold ${text}`}>Visitor Log with QR Passes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className={th}>
                  {['Visitor', 'Phone', 'Flat', 'Purpose', 'Entry', 'Status', 'QR Pass'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} dark={darkMode} />)
                ) : visitors.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState icon="🚪" title="No visitors yet" subtitle="Visitor logs will appear here" dark={darkMode} /></td></tr>
                ) : (
                  visitors.slice(0, 20).map(v => {
                    const s = VSTATUS[v.status] || VSTATUS.EXPECTED;
                    return (
                      <tr key={v.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/40' : 'hover:bg-slate-50'}`}>
                        <td className={`px-6 py-4 text-sm font-semibold ${text}`}>{v.name}</td>
                        <td className={`px-6 py-4 text-sm ${td}`}>{v.phone}</td>
                        <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{v.flat_number || '—'}</td>
                        <td className={`px-6 py-4 text-sm ${td}`}>{v.purpose}</td>
                        <td className={`px-6 py-4 text-xs ${sub}`}>{v.entry_time ? new Date(v.entry_time).toLocaleString('en-IN') : '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => setSelectedVisitor(v)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              v.pass_token
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!v.pass_token}>
                            <QrCode className="w-3.5 h-3.5" />
                            {v.pass_token ? 'View Pass' : 'No Token'}
                          </button>
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
    </>
  );
};

export default VisitorList;
