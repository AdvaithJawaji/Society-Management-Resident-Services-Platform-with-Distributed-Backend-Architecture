import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { MapPin, Users, AlertCircle, CheckCircle } from 'lucide-react';

const BLOCKS = {
  A: {
    color: 'from-indigo-500 to-blue-600',
    light: 'bg-indigo-50 border-indigo-200',
    dark: 'bg-indigo-900/30 border-indigo-700',
    dot: 'bg-indigo-500',
    flats: ['A101','A102','A103','A104','A201','A202','A203','A204','A301','A302','A303','A304','A401','A402'],
  },
  B: {
    color: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50 border-violet-200',
    dark: 'bg-violet-900/30 border-violet-700',
    dot: 'bg-violet-500',
    flats: ['B101','B102','B103','B104','B201','B202','B203','B204','B301','B302','B303','B304'],
  },
  C: {
    color: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50 border-emerald-200',
    dark: 'bg-emerald-900/30 border-emerald-700',
    dot: 'bg-emerald-500',
    flats: ['C101','C102','C103','C201','C202','C203','C301','C302','C303','C401','C402'],
  },
};

const AMENITIES = [
  { icon: '🏊', name: 'Swimming Pool',  x: 20,  y: 75 },
  { icon: '🏋️', name: 'Gym',            x: 45,  y: 75 },
  { icon: '🎾', name: 'Tennis Court',   x: 70,  y: 75 },
  { icon: '🌳', name: 'Garden',         x: 33,  y: 88 },
  { icon: '🅿️', name: 'Parking',        x: 58,  y: 88 },
  { icon: '🔌', name: 'EV Charging',    x: 80,  y: 88 },
];

const FlatDetail = ({ flat, residents, complaints, darkMode, onClose }) => {
  const flatResidents = residents.filter(r => r.flat_number === flat || r.flat_number?.replace('-','') === flat);
  const flatComplaints = complaints.filter(c => c.flat_number === flat || c.flat_number?.replace('-','') === flat);
  const bg = darkMode ? 'bg-gray-800' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-3xl shadow-2xl max-w-sm w-full p-6 ${bg}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${text}`}>Flat {flat}</h3>
              <p className={`text-xs ${sub}`}>{flatResidents.length > 0 ? 'Occupied' : 'Vacant'}</p>
            </div>
          </div>
          <button onClick={onClose} className={`text-2xl ${sub} hover:text-red-500`}>×</button>
        </div>
        <div className="space-y-4">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${sub}`}>Residents ({flatResidents.length})</p>
            {flatResidents.length === 0 ? (
              <p className={`text-sm italic ${sub}`}>No residents on record</p>
            ) : flatResidents.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 py-2 border-b text-sm ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-700'}`}>
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {r.name?.charAt(0)}
                </div>
                <div>
                  <p className={`font-semibold ${text}`}>{r.name}</p>
                  <p className={`text-xs ${sub}`}>{r.phone}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${sub}`}>Complaints ({flatComplaints.length})</p>
            {flatComplaints.length === 0 ? (
              <p className={`text-sm italic ${sub}`}>No active complaints</p>
            ) : flatComplaints.slice(0,3).map((c, i) => (
              <div key={i} className={`text-xs py-1.5 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className={`w-2 h-2 rounded-full ${c.status === 'RESOLVED' ? 'bg-green-500' : 'bg-red-500'}`} />
                {c.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SocietyMap = ({ darkMode }) => {
  const [residents, setResidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState('A');
  const { addToast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [rRes, cRes] = await Promise.all([
          axios.get('/api/residents').catch(() => ({ data: [] })),
          axios.get('/api/complaints'),
        ]);
        setResidents(rRes.data || []);
        setComplaints(cRes.data || []);
      } catch { addToast('Could not load map data.', 'error'); }
    };
    fetch();
  }, []);

  const card  = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text  = darkMode ? 'text-white' : 'text-gray-900';
  const sub   = darkMode ? 'text-gray-400' : 'text-gray-500';

  const getFlatComplaintCount = (flat) => complaints.filter(c => c.flat_number === flat).length;
  const getFlatStatus = (flat) => {
    const cc = getFlatComplaintCount(flat);
    if (cc > 2) return 'high';
    if (cc > 0) return 'medium';
    return 'ok';
  };

  const statusDot = { ok: 'bg-emerald-400', medium: 'bg-amber-400', high: 'bg-red-400' };

  return (
    <>
      {selectedFlat && (
        <FlatDetail flat={selectedFlat} residents={residents} complaints={complaints}
          darkMode={darkMode} onClose={() => setSelectedFlat(null)} />
      )}

      <div className="space-y-6">
        {/* Map Header Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Blocks', value: '3', icon: '🏢' },
            { label: 'Total Flats',  value: Object.values(BLOCKS).reduce((s,b) => s + b.flats.length, 0), icon: '🏠' },
            { label: 'Active Complaints', value: complaints.filter(c => c.status === 'OPEN').length, icon: '⚠️' },
          ].map((s, i) => (
            <div key={i} className={`card-hover rounded-2xl p-5 border shadow-sm text-center ${card}`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className={`text-3xl font-extrabold ${text}`}>{s.value}</p>
              <p className={`text-xs ${sub} mt-1 font-medium`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Visual Society Map */}
        <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
          <h3 className={`text-base font-semibold mb-4 ${text}`}>🗺️ Society Layout — Resident360 Gardens</h3>

          {/* Block selection */}
          <div className="flex gap-2 mb-5">
            {Object.keys(BLOCKS).map(b => (
              <button key={b} onClick={() => setSelectedBlock(b)}
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                  selectedBlock === b
                    ? `bg-gradient-to-r ${BLOCKS[b].color} text-white shadow-md`
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                Block {b}
              </button>
            ))}
          </div>

          {/* Society visual grid */}
          <div className="relative">
            {/* Block grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {Object.entries(BLOCKS).map(([block, config]) => (
                <div key={block}
                  className={`rounded-2xl border-2 p-4 transition-all ${
                    selectedBlock === block
                      ? darkMode ? config.dark + ' border-2' : config.light + ' border-2'
                      : darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
                  }`}
                  onClick={() => setSelectedBlock(block)}>
                  <div className={`flex items-center gap-2 mb-3`}>
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.color}`} />
                    <span className={`font-bold text-sm ${text}`}>BLOCK {block}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {config.flats.slice(0, 8).map(flat => {
                      const st = getFlatStatus(flat);
                      return (
                        <button key={flat} onClick={(e) => { e.stopPropagation(); setSelectedFlat(flat); }}
                          className={`text-xs py-1 px-2 rounded-lg font-medium transition-all hover:scale-105 flex items-center justify-between gap-1 ${
                            darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-indigo-50 shadow-sm'
                          }`}>
                          <span>{flat}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[st]}`} />
                        </button>
                      );
                    })}
                  </div>
                  {config.flats.length > 8 && (
                    <p className={`text-xs mt-2 ${sub}`}>+{config.flats.length - 8} more floors</p>
                  )}
                </div>
              ))}
            </div>

            {/* Amenities Row */}
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-gray-100'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${sub}`}>Common Amenities</p>
              <div className="flex flex-wrap gap-3">
                {AMENITIES.map((a, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-700 shadow-sm'}`}>
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-4 pt-4 border-t">
            {[
              { color: 'bg-emerald-400', label: 'No issues' },
              { color: 'bg-amber-400',   label: 'Minor issues' },
              { color: 'bg-red-400',     label: 'Multiple complaints' },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span className={`text-xs ${sub}`}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Block Detail — selected block flats */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className={`text-base font-semibold ${text}`}>Block {selectedBlock} — All Flats</h3>
            <p className={`text-xs mt-0.5 ${sub}`}>Click any flat to view occupant details</p>
          </div>
          <div className="p-4 grid grid-cols-3 md:grid-cols-5 xl:grid-cols-7 gap-3">
            {BLOCKS[selectedBlock]?.flats.map(flat => {
              const cc = getFlatComplaintCount(flat);
              const st = getFlatStatus(flat);
              return (
                <button key={flat} onClick={() => setSelectedFlat(flat)}
                  className={`card-hover rounded-xl p-3 text-center border transition-all hover:scale-105 ${
                    darkMode ? 'bg-gray-700/60 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm'
                  }`}>
                  <div className="flex justify-end mb-1">
                    <span className={`w-2 h-2 rounded-full ${statusDot[st]}`} />
                  </div>
                  <p className={`text-sm font-bold ${text}`}>{flat}</p>
                  {cc > 0 && <p className="text-xs text-red-500 font-semibold mt-1">{cc} issue{cc > 1 ? 's' : ''}</p>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SocietyMap;
