import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, Zap, Users, CalendarDays } from 'lucide-react';
import { SkeletonCard, EmptyState } from './Skeleton';


const STATUS_COLOR = {
  AVAILABLE:   { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: '🟢' },
  MAINTENANCE: { bg: 'bg-amber-500',   text: 'text-amber-700',   badge: 'bg-amber-50 text-amber-700 border-amber-200',     dot: '🟡' },
  CLOSED:      { bg: 'bg-red-500',     text: 'text-red-700',     badge: 'bg-red-50 text-red-700 border-red-200',           dot: '🔴' },
};

const FACILITY_META = {
  'Swimming Pool':        { icon: '🏊', grad: 'from-cyan-500 to-blue-600',      category: 'Sports & Wellness' },
  'Fitness Center':       { icon: '🏋️', grad: 'from-orange-500 to-red-600',     category: 'Sports & Wellness' },
  'Clubhouse':            { icon: '🎉', grad: 'from-pink-500 to-rose-600',       category: 'Events' },
  'Badminton Court':      { icon: '🏸', grad: 'from-green-500 to-emerald-600',   category: 'Sports & Wellness' },
  'Tennis Court':         { icon: '🎾', grad: 'from-lime-500 to-green-600',      category: 'Sports & Wellness' },
  'Yoga Room':            { icon: '🧘', grad: 'from-violet-500 to-purple-600',   category: 'Sports & Wellness' },
  'Children Play Area':   { icon: '👶', grad: 'from-yellow-400 to-orange-500',   category: 'Recreation' },
  'Garden Park':          { icon: '🌳', grad: 'from-teal-500 to-green-600',      category: 'Recreation' },
  'Mini Theatre':         { icon: '🎬', grad: 'from-slate-600 to-gray-800',      category: 'Entertainment' },
  'Co-Working Space':     { icon: '💼', grad: 'from-blue-500 to-indigo-600',     category: 'Work' },
  'Study Room':           { icon: '📚', grad: 'from-indigo-400 to-blue-500',     category: 'Work' },
  'Community Hall':       { icon: '🎤', grad: 'from-purple-500 to-indigo-600',   category: 'Events' },
  'BBQ Area':             { icon: '🍖', grad: 'from-red-500 to-orange-600',      category: 'Recreation' },
  'Laundry Room':         { icon: '🧺', grad: 'from-sky-400 to-cyan-500',        category: 'Services' },
  'Maintenance Center':   { icon: '🛠️', grad: 'from-stone-500 to-gray-600',      category: 'Services' },
  'Guest Apartment':      { icon: '🏠', grad: 'from-amber-500 to-yellow-600',    category: 'Accommodation' },
  'Visitor Parking':      { icon: '🅿️', grad: 'from-gray-500 to-slate-600',      category: 'Services' },
  'Car Wash Bay':         { icon: '🚗', grad: 'from-blue-400 to-sky-500',        category: 'Services' },
  'Pet Zone':             { icon: '🐕', grad: 'from-yellow-500 to-amber-600',    category: 'Recreation' },
  'EV Charging Station':  { icon: '🔌', grad: 'from-emerald-500 to-teal-600',   category: 'Services' },
};

const TIME_SLOTS = ['06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'];

const BookModal = ({ facility, darkMode, onClose, onBook, submitting }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState('');
  const meta = FACILITY_META[facility.name] || { icon: '🏢', grad: 'from-indigo-500 to-purple-600' };
  const bg = darkMode ? 'bg-gray-900' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden ${bg}`} onClick={e => e.stopPropagation()}>
        <div className={`h-2 w-full bg-gradient-to-r ${meta.grad}`} />
        <div className="p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{meta.icon}</span>
            <div>
              <h2 className={`text-xl font-bold ${text}`}>{facility.name}</h2>
              <p className={`text-sm ${sub}`}>{facility.timing}</p>
            </div>
          </div>
          <div className={`rounded-2xl p-4 mb-5 ${darkMode ? 'bg-gray-800' : 'bg-slate-50'}`}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className={`text-xs uppercase tracking-wide font-medium ${sub}`}>Capacity</p><p className={`font-bold ${text}`}>{facility.capacity} people</p></div>
              <div><p className={`text-xs uppercase tracking-wide font-medium ${sub}`}>Booking Fee</p><p className={`font-bold ${text}`}>{facility.booking_fee > 0 ? `₹${facility.booking_fee}` : 'Free'}</p></div>
              <div><p className={`text-xs uppercase tracking-wide font-medium ${sub}`}>Status</p><p className="font-bold text-emerald-600">{STATUS_COLOR[facility.status]?.dot} {facility.status}</p></div>
              <div><p className={`text-xs uppercase tracking-wide font-medium ${sub}`}>Category</p><p className={`font-bold ${text}`}>{meta.category || 'General'}</p></div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`text-sm font-medium ${sub} block mb-1`}>Select Date</label>
              <input type="date" value={date} min={new Date().toISOString().split('T')[0]}
                onChange={e => setDate(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} />
            </div>
            <div>
              <label className={`text-sm font-medium ${sub} block mb-2`}>Select Time Slot</label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map(s => (
                  <button key={s} onClick={() => setSlot(s)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      slot === s
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                        : darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                Cancel
              </button>
              <button onClick={() => slot && !submitting && onBook(facility.id, date, slot)}
                disabled={!slot || submitting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-200 transition-all">
                {submitting ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FacilityBooking = ({ darkMode }) => {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingFacility, setBookingFacility] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const { addToast } = useToast();
  const { pushNotification } = useNotifications();
  const { user } = useAuth();
  const canBook = (user?.role || user?.role_name) === 'RESIDENT';

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [fRes, bRes] = await Promise.all([
        axios.get('/api/facilities'),
        axios.get('/api/facilities/bookings'),
      ]);
      setFacilities(fRes.data || []);
      setBookings(bRes.data || []);
    } catch (e) {
      addToast('Could not load facilities.', 'error');
    } finally { setLoading(false); }
  };

  const handleBook = async (facility_id, booking_date, time_slot) => {
    if (!canBook || bookingLoading) return;
    setBookingLoading(true);
    try {
      await axios.post('/api/facilities/bookings', { facility_id, booking_date, time_slot });

      // Get current user profile
      const facilityName = bookingFacility?.name || 'Facility';
      try {
        const userRes = await axios.get('/api/auth/profile');
        const userId = userRes.data?.id;
        const username = userRes.data?.username || 'Resident';

        // Notify the resident themselves
        if (userId) {
          await pushNotification(userId, 'FACILITY_BOOKING',
            `✅ Your booking for ${facilityName} on ${booking_date} (${time_slot}) is confirmed!`
          );
        }

        // Notify admin (user_id = 1) about the new booking
        await pushNotification(1, 'FACILITY_BOOKING',
          `📋 ${username} booked ${facilityName} on ${booking_date} at ${time_slot}`
        );
      } catch (e) { /* silent — don't fail booking if notification fails */ }

      addToast('Facility booked successfully! 🎉', 'success');
      setBookingFacility(null);
      fetchAll();
    } catch (e) {
      addToast(e.response?.data?.message || 'Booking failed.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const categories = ['All', ...new Set(Object.values(FACILITY_META).map(m => m.category))];
  const displayed = facilities.filter(f => {
    const meta = FACILITY_META[f.name];
    return filter === 'All' || meta?.category === filter;
  });

  const card = darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/90 border-gray-100';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const th   = darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-slate-50 text-gray-500';
  const td   = darkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-100';

  return (
    <>
      {bookingFacility && (
        <BookModal facility={bookingFacility} darkMode={darkMode} submitting={bookingLoading}
          onClose={() => setBookingFacility(null)} onBook={handleBook} />
      )}

      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Facilities', value: facilities.length, icon: '🏢' },
            { label: 'Available Now',    value: facilities.filter(f => f.status === 'AVAILABLE').length, icon: '✅' },
            { label: 'Total Bookings',   value: bookings.length, icon: '📅' },
            { label: 'Today\'s Bookings', value: bookings.filter(b => {
                const d = new Date(b.booking_date).toDateString();
                return d === new Date().toDateString();
              }).length, icon: '🔖' },
          ].map((s, i) => (
            <div key={i} className={`card-hover rounded-2xl p-5 border shadow-sm ${card}`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className={`text-xs font-medium uppercase tracking-wide ${sub}`}>{s.label}</p>
              <p className={`text-3xl font-extrabold mt-1 ${text}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                filter === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Facility Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} dark={darkMode} lines={3} />) :
            displayed.length === 0 ? <EmptyState icon="🏢" title="No facilities found" subtitle="No facilities in this category" dark={darkMode} /> :
            displayed.map(f => {
              const meta = FACILITY_META[f.name] || { icon: '🏢', grad: 'from-indigo-500 to-purple-600', category: 'General' };
              const sc = STATUS_COLOR[f.status] || STATUS_COLOR.AVAILABLE;
              const bookingCount = bookings.filter(b => b.facility_id === f.id || b.facility_name === f.name).length;
              return (
                <div key={f.id}
                  className={`card-hover rounded-2xl border shadow-sm overflow-hidden cursor-pointer group ${card}`}
                  onClick={() => canBook && f.status === 'AVAILABLE' && setBookingFacility(f)}>
                  <div className={`h-1.5 w-full bg-gradient-to-r ${meta.grad}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-200">{meta.icon}</div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.badge}`}>
                        {sc.dot} {f.status}
                      </span>
                    </div>
                    <h3 className={`font-bold text-base mb-1 ${text}`}>{f.name}</h3>
                    <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                      ⏰ {f.timing || '—'}
                    </p>
                    {f.description && (
                      <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${sub}`}>
                        {f.description.split('|').slice(2).join('|').trim()}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-dashed">
                      <div className="flex gap-3 text-xs">
                        <span className={`flex items-center gap-1 ${sub}`}>
                          <Users className="w-3 h-3" /> {f.capacity}
                        </span>
                        <span className={`flex items-center gap-1 ${sub}`}>
                          <CalendarDays className="w-3 h-3" /> {bookingCount} booked
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {f.booking_fee > 0 && (
                          <span className={`text-xs font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>₹{f.booking_fee}</span>
                        )}
                        {f.status === 'AVAILABLE' && canBook ? (
                          <button
                            onClick={e => { e.stopPropagation(); setBookingFacility(f); }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-md hover:shadow-indigo-200 transition-all">
                            Book Slot
                          </button>
                        ) : f.status === 'AVAILABLE' ? (
                          <span className={`text-xs font-medium ${sub}`}>Resident login required</span>
                        ) : (
                          <span className="text-xs font-semibold text-red-500 px-2">Unavailable</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Recent Bookings Table */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
          <div className={`px-6 py-4 border-b flex items-center gap-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <h3 className={`text-base font-semibold ${text}`}>Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className={th}>
                  {['Resident', 'Facility', 'Date', 'Slot', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {bookings.slice(0, 20).map(b => {
                  const meta = FACILITY_META[b.facility_name] || { icon: '🏢' };
                  return (
                    <tr key={b.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700/40' : 'hover:bg-slate-50'}`}>
                      <td className={`px-5 py-3.5 text-sm font-semibold ${text}`}>{b.resident_name || '—'}</td>
                      <td className={`px-5 py-3.5 text-sm ${td}`}>
                        <span className="flex items-center gap-2">
                          <span>{meta.icon}</span>
                          <span className="font-medium">{b.facility_name}</span>
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-sm ${td}`}>{new Date(b.booking_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</td>
                      <td className={`px-5 py-3.5 text-xs font-mono font-semibold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{b.time_slot}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'CONFIRMED' ? 'chip-paid' : 'chip-overdue'}`}>
                          {b.status === 'CONFIRMED' ? '✓ Confirmed' : '✗ Cancelled'}
                        </span>
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

export default FacilityBooking;
