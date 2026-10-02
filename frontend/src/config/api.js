// Central API configuration
// Uses Vite proxy in dev so all devices (mobile/desktop) work transparently.
// All API calls should use these base URLs.

// HTTP API — proxied through Vite to 
export const API_BASE = '';

// WebSocket (Socket.io) — proxied through Vite to http://localhost:5005
// In dev: connect to window.location.origin (same host/port as the Vite server)
export const WS_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

// Helper: full api path
export const api = (path) => `${API_BASE}${path}`;
