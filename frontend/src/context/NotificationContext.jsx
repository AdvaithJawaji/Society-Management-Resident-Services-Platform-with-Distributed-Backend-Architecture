import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef([]);
  const { user, token } = useAuth();
  const { addToast } = useToast();

  // Fetch historical notifications from the DB on login
  const fetchHistorical = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const history = res.data || [];
      const historyIds = new Set(history.map(notification => notification.id));
      const merged = [...history, ...notificationsRef.current.filter(notification => !historyIds.has(notification.id))]
        .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
      notificationsRef.current = merged;
      setNotifications(merged);
      setUnreadCount(merged.filter(notification => !notification.is_read).length);
    } catch {
      addToast('Could not load notifications. Check your connection and retry.', 'error');
    }
  }, [user, token, addToast]);

  useEffect(() => {
    if (!user || !token) {
      notificationsRef.current = [];
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch past notifications
    fetchHistorical();

    // Connect via Vite proxy (/socket.io → localhost:5005)
    // window.location.origin works on any device (mobile, PC, etc.)
    const wsUrl = window.location.origin;
    const newSocket = io(wsUrl, {
      path: '/socket.io',
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      // Join room using user.id (the actual user ID from the DB)
      newSocket.emit('join', user.id);
      console.log(`[WS] Connected and joined room user_${user.id}`);
    });

    newSocket.on('new_notification', (data) => {
      if (notificationsRef.current.some(notification => notification.id === data.id)) return;
      const next = [{ ...data, is_read: false }, ...notificationsRef.current];
      notificationsRef.current = next;
      setNotifications(next);
      setUnreadCount(next.filter(notification => !notification.is_read).length);
    });

    newSocket.on('disconnect', () => {
      console.log('[WS] Disconnected from notification service');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, token, fetchHistorical]);

  // Mark all as read in UI (batch)
  const clearUnread = useCallback(async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const next = notificationsRef.current.map(notification => ({ ...notification, is_read: true }));
      notificationsRef.current = next;
      setUnreadCount(0);
      setNotifications(next);
    } catch {
      addToast('Could not mark notifications as read. Please try again.', 'error');
    }
  }, [token, addToast]);

  // Mark single notification as read
  const markRead = useCallback(async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const next = notificationsRef.current.map(notification =>
        notification.id === id ? { ...notification, is_read: true } : notification
      );
      notificationsRef.current = next;
      setNotifications(next);
      setUnreadCount(next.filter(notification => !notification.is_read).length);
    } catch {
      addToast('Could not update this notification. Please try again.', 'error');
    }
  }, [token, addToast]);

  // Push a new notification to a specific user (called by other components after an action)
  const pushNotification = useCallback(async (user_id, type, message) => {
    try {
      await axios.post('/api/notifications/send', { user_id, type, message }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      addToast('Could not send the notification. Please try again.', 'error');
    }
  }, [token, addToast]);

  return (
    <NotificationContext.Provider value={{ socket, notifications, unreadCount, clearUnread, markRead, pushNotification, refetch: fetchHistorical }}>
      {children}
    </NotificationContext.Provider>
  );
};
