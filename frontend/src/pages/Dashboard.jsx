import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import {
  Bell, CreditCard, Users, AlertCircle, LogOut, Calendar, Car,
  Activity, Moon, Sun, Search, Star, ChevronRight, X,
  Shield, Map, TrendingUp, Home, CheckCheck, BellOff,
  Menu
} from 'lucide-react';
import axios from 'axios';

const BillingList = lazy(() => import('../components/BillingList'));
const ComplaintList = lazy(() => import('../components/ComplaintList'));
const VisitorList = lazy(() => import('../components/VisitorList'));
const FacilityBooking = lazy(() => import('../components/FacilityBooking'));
const VehicleManagement = lazy(() => import('../components/VehicleManagement'));
const SystemHealth = lazy(() => import('../components/SystemHealth'));
const AnalyticsDashboard = lazy(() => import('../components/AnalyticsDashboard'));
const FinancialDashboard = lazy(() => import('../components/FinancialDashboard'));
const CommunityHub = lazy(() => import('../components/CommunityHub'));
const SecurityDashboard = lazy(() => import('../components/SecurityDashboard'));
const SocietyMap = lazy(() => import('../components/SocietyMap'));
const HeroBanner = lazy(() => import('../components/HeroBanner'));

const ALL_NAV = [
  { id: 'billing',    icon: CreditCard,  label: 'Billing',      emoji: '💳', roles: ['ADMIN','RESIDENT'] },
  { id: 'complaints', icon: AlertCircle, label: 'Complaints',   emoji: '📋', roles: ['ADMIN','RESIDENT'] },
  { id: 'facilities', icon: Calendar,    label: 'Facilities',   emoji: '🏊', roles: ['ADMIN','RESIDENT'] },
  { id: 'vehicles',   icon: Car,         label: 'Parking',      emoji: '🚗', roles: ['ADMIN','RESIDENT'] },
  { id: 'community',  icon: Star,        label: 'Community',    emoji: '⭐', roles: ['ADMIN','RESIDENT'] },
  { id: 'map',        icon: Map,         label: 'Society Map',  emoji: '🗺️', roles: ['ADMIN','RESIDENT'] },
  { id: 'visitors',   icon: Users,       label: 'Visitors',     emoji: '🚪', roles: ['ADMIN'] },
  { id: 'analytics',  icon: Activity,    label: 'Analytics',    emoji: '📊', roles: ['ADMIN'] },
  { id: 'financial',  icon: TrendingUp,  label: 'Financials',   emoji: '💹', roles: ['ADMIN'] },
  { id: 'security',   icon: Shield,      label: 'Security',     emoji: '🔒', roles: ['ADMIN'] },
  { id: 'health',     icon: Activity,    label: 'Health',       emoji: '⚙️', roles: ['ADMIN'] },
];

const TAB_LABELS = {
  billing: 'Billing & Payments', complaints: 'Complaints', visitors: 'Visitors & QR',
  facilities: 'Facilities', vehicles: 'Parking', community: 'Community Hub',
  map: 'Society Map', analytics: 'Analytics', financial: 'Financials',
  security: 'Security', health: 'System Health',
};

const NOTIF_META = {
  FACILITY_BOOKING:  { icon: '🏊', color: 'bg-blue-100 text-blue-700',    label: 'Facility Booking'  },
  COMPLAINT:         { icon: '📋', color: 'bg-orange-100 text-orange-700', label: 'Complaint'         },
  COMPLAINT_UPDATED: { icon: '✅', color: 'bg-green-100 text-green-700',   label: 'Complaint Update'  },
  VISITOR_ARRIVAL:   { icon: '🚪', color: 'bg-purple-100 text-purple-700', label: 'Visitor'           },
  VISITOR:           { icon: '🚪', color: 'bg-purple-100 text-purple-700', label: 'Visitor'           },
  BILLING:           { icon: '💳', color: 'bg-red-100 text-red-700',       label: 'Billing'           },
  PAYMENT_DUE:       { icon: '💰', color: 'bg-amber-100 text-amber-700',   label: 'Payment Due'       },
  NOTICE:            { icon: '📢', color: 'bg-indigo-100 text-indigo-700', label: 'Notice'            },
  ANNOUNCEMENT:      { icon: '📣', color: 'bg-indigo-100 text-indigo-700', label: 'Announcement'      },
  SECURITY_ALERT:    { icon: '🔒', color: 'bg-red-100 text-red-700',       label: 'Security Alert'    },
  SYSTEM:            { icon: '⚙️', color: 'bg-gray-100 text-gray-700',     label: 'System'            },
  GENERAL:           { icon: '🔔', color: 'bg-slate-100 text-slate-700',   label: 'Notification'      },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Notification Panel
const NotificationPanel = ({ darkMode, onClose }) => {
  const { notifications, unreadCount, clearUnread, markRead } = useNotifications();
  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const text = darkMode ? 'text-white' : 'text-gray-900';

  return (
    // Full screen on mobile, dropdown on desktop
    <div className="fixed inset-0 z-[100] md:absolute md:inset-auto md:right-0 md:top-12 md:w-96 flex flex-col md:block md:rounded-2xl">
      {/* Mobile backdrop */}
      <div className="absolute inset-0 bg-black/40 md:hidden" onClick={onClose} />
      <div className={`relative z-10 mt-auto md:mt-0 md:rounded-2xl border shadow-2xl overflow-hidden max-h-[85vh] md:max-h-[500px] flex flex-col ${card}`}>
        <div className={`px-4 py-4 border-b flex justify-between items-center shrink-0 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${text}`}>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{unreadCount} new</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={clearUnread}
                className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-colors ${darkMode ? 'text-gray-400 bg-gray-700 hover:bg-gray-600' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}>
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-xl ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`overflow-y-auto flex-1 divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
          {notifications.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <BellOff className={`w-12 h-12 mx-auto mb-3 ${sub}`} />
              <p className={`font-semibold ${sub}`}>You're all caught up!</p>
              <p className={`text-sm mt-1 ${sub}`}>No notifications yet</p>
            </div>
          ) : notifications.map((n, i) => {
            const meta = NOTIF_META[n.type] || NOTIF_META.GENERAL;
            const unread = !n.is_read;
            return (
              <div key={n.id || i}
                onClick={() => n.id && !n.is_read && markRead(n.id)}
                className={`flex gap-3 px-4 py-3.5 cursor-pointer transition-colors active:scale-[0.99] ${
                  unread
                    ? darkMode ? 'bg-indigo-900/30 active:bg-indigo-900/50' : 'bg-indigo-50/70 active:bg-indigo-100'
                    : darkMode ? 'active:bg-gray-700/50' : 'active:bg-gray-50'
                }`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${meta.color}`}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className={`text-xs font-bold ${meta.color.split(' ')[1]}`}>{meta.label}</p>
                    <span className={`text-xs shrink-0 ${sub}`}>{timeAgo(n.created_at)}</span>
                  </div>
                  <p className={`text-sm mt-0.5 leading-snug line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {n.message}
                  </p>
                </div>
                {unread && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>

        {notifications.length > 0 && (
          <div className={`px-4 py-3 border-t text-center shrink-0 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs ${sub}`}>{notifications.length} total notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Search Results
const SearchPanel = ({ results, query, darkMode, loading, onClose }) => {
  const card = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const ICONS = { residents:'👤', complaints:'📋', vehicles:'🚗', visitors:'🚪', providers:'🔧', events:'🎉', facilities:'🏢' };
  const total = results ? Object.values(results).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0) : 0;

  return (
    <div className={`rounded-2xl border shadow-xl overflow-hidden ${card}`}>
      <div className={`px-4 py-3 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div>
          <h3 className={`text-sm font-bold ${text}`}>"{query}"</h3>
          <p className={`text-xs ${sub}`}>{loading ? 'Searching…' : `${total} results`}</p>
        </div>
        <button onClick={onClose} className={`${sub} hover:text-red-500 p-1`}><X className="w-4 h-4" /></button>
      </div>
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className={`text-sm ${sub}`}>Searching…</p>
        </div>
      ) : total === 0 ? (
        <div className="py-12 text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p className={`font-semibold ${text}`}>No results</p>
        </div>
      ) : (
        <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto">
          {results && Object.entries(results).map(([key, items]) => {
            if (!Array.isArray(items) || items.length === 0) return null;
            return (
              <div key={key}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${sub}`}>
                  {ICONS[key] || '📌'} {key}
                </p>
                {items.map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 ${darkMode ? 'bg-gray-700/60' : 'bg-gray-50'}`}>
                    <span className="text-base">{ICONS[key] || '📌'}</span>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${text}`}>{item.name || item.title || item.vehicle_number || item.resident_name || '—'}</p>
                      <p className={`text-xs ${sub}`}>
                        {[item.resident_name && `Resident: ${item.resident_name}`, item.flat_number && `Flat ${item.flat_number}`, item.status || item.purpose || item.category].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SectionLoader = () => (
  <div role="status" aria-label="Loading section" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {[0, 1, 2].map(index => (
      <div key={index} className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white" />
    ))}
  </div>
);

// Mobile Drawer Menu
const MobileDrawer = ({ navItems, activeTab, onSelect, user, onLogout }) => {
  const role = user?.role || user?.role_name || 'RESIDENT';
  const initials = user?.username?.substring(0, 2).toUpperCase() || 'US';
  return (
    <div className="fixed inset-0 z-[90] flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onSelect} />
      <div className="relative z-10 w-72 h-full flex flex-col shadow-2xl" style={{ background: '#1e1b4b' }}>
        {/* Header */}
        <div className="px-5 pt-12 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-lg"
              style={{ background: 'linear-gradient(135deg,#a78bfa,#6366f1)' }}>
              {initials}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{user?.username}</p>
              <p className="text-indigo-300 text-xs">{role}</p>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-indigo-600 text-white' : 'text-indigo-200/80 hover:bg-white/10 hover:text-white'
                }`}>
                <span className="text-xl">{item.emoji}</span>
                {item.label}
                {active && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>
        {/* Logout */}
        <div className="px-3 pb-8 border-t border-white/10 pt-4">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('billing');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const mobileNotifRef = useRef(null);
  const desktopNotifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const insideNotificationControl = [mobileNotifRef, desktopNotifRef]
        .some(ref => ref.current?.contains(e.target));
      if (!insideNotificationControl) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const role = user.role || user.role_name || 'RESIDENT';
  const navItems = ALL_NAV.filter(n => n.roles.includes(role));
  // Bottom nav: show first 5 items for resident, first 5 for admin
  const bottomNavItems = navItems.slice(0, 5);
  const initials = user.username?.substring(0, 2).toUpperCase() || 'US';

  const handleNavSelect = (tabId) => {
    if (tabId) setActiveTab(tabId);
    setShowDrawer(false);
    setSearchResults(null);
    setSearchQuery('');
  };

  const doLogout = () => { logout(); navigate('/login'); };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) { setSearchResults(null); return; }
    setSearching(true);
    setSearchResults({});
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data);
    } catch {
      addToast('Search failed.', 'error');
      setSearchResults(null);
    } finally { setSearching(false); }
  };

  const bg   = darkMode ? 'bg-gray-900' : 'bg-slate-50';
  const hdr  = darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white border-gray-200';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const mobileBottomBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${bg}`} style={{ WebkitTapHighlightColor: 'transparent' }}>

      {/* ────── MOBILE DRAWER ────── */}
      {showDrawer && (
        <MobileDrawer
          navItems={navItems}
          activeTab={activeTab}
          onSelect={handleNavSelect}
          user={user}
          onLogout={doLogout}
        />
      )}

      {/* ────── DESKTOP SIDEBAR ────── */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col shadow-xl" style={{ background: '#1e1b4b' }}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg,#818cf8,#4f46e5)' }}>
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base tracking-wide">RESIDENT360</p>
              <p className="text-indigo-300 text-xs font-medium">{role} Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => handleNavSelect(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active ? 'bg-indigo-600 text-white' : 'text-indigo-200/80 hover:bg-white/10 hover:text-white'
                }`}>
                <span className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-indigo-300 group-hover:text-white'}`} />
                  {item.label}
                </span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#a78bfa,#6366f1)' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{user.username}</p>
              <p className="text-indigo-300 text-xs truncate">{role}</p>
            </div>
          </div>
          <button onClick={doLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* ────── MAIN CONTENT ────── */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">

        {/* ── MOBILE TOP HEADER ── */}
        <header className={`md:hidden fixed top-0 left-0 right-0 z-40 border-b px-4 flex items-center justify-between gap-3 ${hdr}`}
          style={{ height: 60, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <button onClick={() => setShowDrawer(true)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Menu className={`w-5 h-5 ${text}`} />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <h1 className={`text-sm font-extrabold truncate ${text}`}>{TAB_LABELS[activeTab]}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowSearch(s => !s)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Search className={`w-4.5 h-4.5 ${text}`} />
            </button>
            <div className="relative" ref={mobileNotifRef}>
              <button
                aria-label="Open notifications"
                onClick={() => setShowNotifications(n => !n)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Bell className={`w-4.5 h-4.5 ${unreadCount > 0 ? 'text-indigo-500' : text}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationPanel darkMode={darkMode} onClose={() => setShowNotifications(false)} />
              )}
            </div>
          </div>
        </header>

        {/* ── MOBILE SEARCH BAR (slide down) ── */}
        {showSearch && (
          <form onSubmit={handleSearch} className={`md:hidden fixed top-[60px] left-0 right-0 z-30 px-4 py-3 border-b shadow-lg ${hdr}`}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <input type="text" placeholder="Search residents, complaints…"
                autoFocus
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchResults(null); }}
                className={`bg-transparent flex-1 text-sm focus:outline-none ${text}`}
              />
              <button type="submit" aria-label="Search" disabled={!searchQuery.trim() || searching}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-indigo-600 disabled:opacity-40">
                <Search className="w-5 h-5" />
              </button>
              <button type="button" aria-label="Close search" onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults(null); }}>
                <X className={`w-4 h-4 ${sub}`} />
              </button>
            </div>
          </form>
        )}

        {/* ── DESKTOP TOP HEADER ── */}
        <header className={`hidden md:flex border-b px-6 py-3.5 items-center justify-between gap-4 shrink-0 ${hdr}`}>
          <div className="flex items-center gap-4 min-w-0">
            <h1 className={`text-lg font-extrabold ${text}`}>{TAB_LABELS[activeTab]}</h1>
            <form onSubmit={handleSearch} className={`flex items-center gap-2 w-72 px-3.5 py-2 rounded-2xl border text-sm focus-within:ring-2 focus-within:ring-indigo-400 ${darkMode ? 'bg-gray-700/80 border-gray-600' : 'bg-gray-50/80 border-gray-200'}`}>
              <Search className={`w-4 h-4 shrink-0 ${sub}`} />
              <input type="text" placeholder="Search anything…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchResults(null); }}
                className={`bg-transparent focus:outline-none w-full text-sm ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
              />
              {searchQuery && <button type="button" aria-label="Clear search" onClick={() => { setSearchQuery(''); setSearchResults(null); }}><X className={`w-3.5 h-3.5 ${sub}`} /></button>}
              <button type="submit" aria-label="Search" disabled={!searchQuery.trim() || searching} className="text-indigo-500 disabled:opacity-40">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setDarkMode(d => !d)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="relative" ref={desktopNotifRef}>
              <button
                aria-label="Open notifications"
                onClick={() => setShowNotifications(n => !n)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center relative ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationPanel darkMode={darkMode} onClose={() => setShowNotifications(false)} />
              )}
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold text-white"
              style={{ background: 'linear-gradient(135deg,#a78bfa,#6366f1)' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${showSearch ? 'mt-[118px]' : 'mt-[60px]'} md:mt-0`}>
          {searchResults !== null ? (
            <SearchPanel results={searchResults} query={searchQuery} darkMode={darkMode} loading={searching}
              onClose={() => { setSearchResults(null); setSearchQuery(''); setShowSearch(false); }} />
          ) : (
            <Suspense fallback={<SectionLoader />}>
              <HeroBanner user={user} darkMode={darkMode} />
              {activeTab === 'billing'    && <BillingList darkMode={darkMode} />}
              {activeTab === 'complaints' && <ComplaintList darkMode={darkMode} />}
              {activeTab === 'visitors'   && <VisitorList darkMode={darkMode} />}
              {activeTab === 'facilities' && <FacilityBooking darkMode={darkMode} />}
              {activeTab === 'vehicles'   && <VehicleManagement darkMode={darkMode} />}
              {activeTab === 'community'  && <CommunityHub darkMode={darkMode} />}
              {activeTab === 'map'        && <SocietyMap darkMode={darkMode} />}
              {activeTab === 'analytics'  && <AnalyticsDashboard darkMode={darkMode} />}
              {activeTab === 'financial'  && <FinancialDashboard darkMode={darkMode} />}
              {activeTab === 'security'   && <SecurityDashboard darkMode={darkMode} />}
              {activeTab === 'health'     && <SystemHealth darkMode={darkMode} />}
            </Suspense>
          )}
        </main>

      </div>

      {/* ────── MOBILE BOTTOM NAVIGATION BAR ────── */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center border-t px-2 ${mobileBottomBg}`}
        style={{ height: `calc(64px + env(safe-area-inset-bottom, 0px))`, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {bottomNavItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => handleNavSelect(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all active:scale-90 ${
                active ? '' : 'opacity-50'
              }`}>
              <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>{item.emoji}</span>
              <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-indigo-600' : sub}`}>
                {item.label}
              </span>
              {active && <div className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />}
            </button>
          );
        })}
        {/* More button for extra nav items */}
        <button onClick={() => setShowDrawer(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 opacity-50`}>
          <span className="text-xl">☰</span>
          <span className={`text-[10px] font-semibold ${sub}`}>More</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
