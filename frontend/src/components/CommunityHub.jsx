import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Star, Calendar, Wrench } from 'lucide-react';
import { SkeletonCard, EmptyState } from './Skeleton';

const StarRating = ({ rating, onRate }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} onClick={() => onRate && onRate(n)}
        className={`text-2xl transition-transform hover:scale-125 ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </button>
    ))}
  </div>
);

const CommunityHub = ({ darkMode }) => {
  const [providers, setProviders] = useState([]);
  const [events, setEvents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, eRes, fRes] = await Promise.all([
          axios.get('/api/analytics/providers'),
          axios.get('/api/analytics/events'),
          axios.get('/api/analytics/feedback'),
        ]);
        setProviders(pRes.data || []);
        setEvents(eRes.data || []);
        setFeedbacks(fRes.data || []);
        if (fRes.data?.length) {
          const avg = fRes.data.reduce((s, f) => s + f.rating, 0) / fRes.data.length;
          setAvgRating(avg.toFixed(1));
        }
      } catch { addToast('Could not load community data.', 'error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleFeedbackSubmit = async () => {
    if (!myRating) { addToast('Please select a star rating.', 'warning'); return; }
    try {
      addToast('Thank you for your feedback! 🌟', 'success');
      setSubmitted(true);
      setFeedbacks(prev => [{ id: Date.now(), resident_name: 'You', rating: myRating, comments: feedbackText, created_at: new Date() }, ...prev]);
    } catch { addToast('Could not submit feedback.', 'error'); }
  };

  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';

  const CATEGORY_ICONS = { PLUMBER: '🔧', ELECTRICIAN: '⚡', MAID: '🧹', CARPENTER: '🔨', SECURITY: '🛡️' };

  return (
    <div className="space-y-6">
      {/* Average Rating Banner */}
      <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>Average Resolution Rating</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-5xl font-extrabold ${darkMode ? 'text-yellow-300' : 'text-yellow-500'}`}>{avgRating}</span>
              <span className={`text-xl ${sub}`}>/ 5</span>
            </div>
            <StarRating rating={Math.round(avgRating)} />
          </div>
          <div className={`text-right ${sub}`}>
            <p className="text-4xl font-bold">{feedbacks.length}</p>
            <p className="text-xs mt-1">Total Reviews</p>
          </div>
        </div>
      </div>

      {/* Events */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center gap-2`}>
          <Calendar className="w-4 h-4 text-indigo-500" />
          <h3 className={`text-base font-semibold ${text}`}>Upcoming Events</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {loading ? Array.from({length:4}).map((_,i) => <SkeletonCard key={i} dark={darkMode} lines={2} />) :
           events.length === 0 ? <EmptyState icon="🎊" title="No events scheduled" subtitle="" dark={darkMode} /> :
           events.slice(0, 6).map(e => (
            <div key={e.id} className={`p-4 rounded-xl border-l-4 border-l-indigo-500 ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-indigo-50/50 border-gray-100'}`}>
              <h4 className={`font-bold text-sm ${text}`}>{e.title}</h4>
              <p className={`text-xs mt-1 ${sub}`}>{e.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>📅 {new Date(e.event_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</span>
                <span className={`text-xs ${sub}`}>📍 {e.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Providers */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center gap-2`}>
          <Wrench className="w-4 h-4 text-indigo-500" />
          <h3 className={`text-base font-semibold ${text}`}>Service Providers Directory</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? Array.from({length:6}).map((_,i) => <SkeletonCard key={i} dark={darkMode} lines={2}/>) :
           providers.map(p => (
            <div key={p.id} className={`p-4 rounded-xl card-hover border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-start justify-between">
                <div className="text-2xl">{CATEGORY_ICONS[p.category] || '🔧'}</div>
                <span className={`text-xs font-bold ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>★ {p.rating}</span>
              </div>
              <p className={`font-bold text-sm mt-2 ${text}`}>{p.name}</p>
              <p className={`text-xs ${sub}`}>{p.category}</p>
              <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>📞 {p.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Feedback */}
        <div className={`rounded-2xl border shadow-sm p-6 ${card}`}>
          <h3 className={`text-base font-semibold mb-4 ${text}`}>Rate Your Experience</h3>
          {submitted ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <p className={`font-semibold ${text}`}>Feedback Submitted!</p>
              <p className={`text-sm mt-1 ${sub}`}>Thank you for rating us.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className={`text-sm font-medium mb-2 ${sub}`}>How was the complaint resolution?</p>
                <StarRating rating={myRating} onRate={setMyRating} />
              </div>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
              <button onClick={handleFeedbackSubmit}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm">
                Submit Feedback
              </button>
            </div>
          )}
        </div>

        {/* Recent Feedback */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className={`text-base font-semibold ${text}`}>Recent Feedback</h3>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {feedbacks.map((f, i) => (
              <div key={f.id || i} className={`px-6 py-4 ${darkMode ? 'divide-gray-700' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm font-semibold ${text}`}>{f.resident_name}</p>
                    <p className={`text-xs mt-0.5 ${sub}`}>{new Date(f.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <StarRating rating={f.rating} />
                </div>
                {f.comments && <p className={`text-sm mt-2 italic ${sub}`}>"{f.comments}"</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
