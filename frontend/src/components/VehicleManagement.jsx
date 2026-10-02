import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Car, ParkingSquare, TrendingUp } from 'lucide-react';
import { SkeletonRow, EmptyState } from './Skeleton';

const TOTAL_SLOTS = 150;

const VehicleManagement = ({ darkMode }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/vehicles');
      setVehicles(res.data || []);
    } catch {
      addToast('Failed to load vehicle data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const th   = darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-slate-50 text-gray-500';
  const td   = darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-100';

  const occupied = vehicles.filter(v => v.parking_slot).length;
  const available = TOTAL_SLOTS - occupied;
  const fourW = vehicles.filter(v => v.type === '4_WHEELER').length;
  const twoW  = vehicles.filter(v => v.type === '2_WHEELER').length;
  const pct = Math.round((occupied / TOTAL_SLOTS) * 100);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Slots',  value: TOTAL_SLOTS,  icon: '🏢', color: 'text-indigo-600' },
          { label: 'Occupied',     value: occupied,     icon: '🚗', color: 'text-red-500' },
          { label: 'Available',    value: available,    icon: '🟢', color: 'text-emerald-600' },
          { label: '4-Wheelers',   value: fourW,        icon: '🚙', color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className={`card-hover rounded-2xl p-5 border shadow-sm ${card}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className={`text-xs font-medium uppercase tracking-wide ${sub}`}>{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Occupancy Bar */}
      <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className={`text-sm font-semibold ${text}`}>Parking Occupancy</h3>
          <span className={`text-sm font-bold ${pct > 80 ? 'text-red-500' : pct > 60 ? 'text-amber-500' : 'text-emerald-600'}`}>{pct}% Occupied</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className={`h-3 rounded-full transition-all duration-700 ${pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className={sub}>0</span>
          <span className={sub}>{TOTAL_SLOTS} total slots</span>
        </div>
      </div>

      {/* Parking Table */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center gap-2`}>
          <Car className="w-4 h-4 text-indigo-500" />
          <h3 className={`text-base font-semibold ${text}`}>Parking Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={th}>
                {['Flat', 'Resident', 'Vehicle Number', 'Type', 'Parking Slot', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} dark={darkMode} />)
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon="🚗" title="No vehicles registered" subtitle="Vehicle records will appear here" dark={darkMode} /></td></tr>
              ) : (
                vehicles.slice(0, 25).map(v => (
                  <tr key={v.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/40' : 'hover:bg-slate-50'}`}>
                    <td className={`px-6 py-4 text-sm font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{v.flat_number || '—'}</td>
                    <td className={`px-6 py-4 text-sm font-semibold ${text}`}>{v.resident_name}</td>
                    <td className={`px-6 py-4 text-sm font-mono font-bold ${text}`}>{v.vehicle_number}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        v.type === '4_WHEELER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {v.type === '4_WHEELER' ? '🚗 Car' : '🛵 2-Wheeler'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold ${v.parking_slot ? 'text-emerald-600' : td}`}>
                      {v.parking_slot || <span className={`text-xs ${sub}`}>Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${v.parking_slot ? 'chip-paid' : 'chip-unpaid'}`}>
                        {v.parking_slot ? '✓ Assigned' : '⚠ Unassigned'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;
